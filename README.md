# Fluxel

A tiny, type-safe utility for building reactive DOM UIs, drawing inspiration from React's `createElement` and native browser APIs. This package simplifies the creation of HTML elements with a fluent API, robust attribute handling, and a flexible reactive system designed for high performance in focused scenarios.

This utlity is also the remarkably lightweight, which weighs in at approximately 3.2 KB (minified + gzipped), making it an ideal choice for performance-critical applications and environments where every byte counts.

## Features

* **Type-Safe:** Built with TypeScript, offering comprehensive type checking and autocompletion for HTML elements and their properties.
* **Intuitive API:** Create elements using direct function calls for each HTML tag (e.g., `div()`, `span()`).
* **Flexible Children & Properties:** Supports various types for children (strings, Nodes, reactive values) and handles attributes, event listeners, inline styles, `classList`, and `dataset` properties seamlessly.
* **Reactive System:** Introduce state-driven reactivity for properties, styles, and children, enabling automatic UI updates when state changes.
* **`fluxel.fragment`:** A powerful utility that groups child elements without creating an extra DOM wrapper, and intelligently **propagates attributes (especially classes and event handlers) to its children**.
    * **Attribute Overwriting:** Most attributes on `fragment` will overwrite existing attributes on children.
    * **Class Addition:** `classList` values on `fragment` will be **added** to children's existing classes.
    * **Event Handler Addition:** Event handlers on `fragment` will be **added** to children's existing event listeners.
* **`fluxel.useUniqueString`**: Generates a unique string for `id`/`htmlFor` pairings, simplifying accessibility for form elements.
* **`fluxel.component`**: A lightweight abstraction to define reusable, stateful UI components, enhancing modularity while leveraging the reactive core.

## Installation

```bash
npm install fluxel
# or
yarn add fluxel
```

## Usage

### Basic Element Creation

```typescript
import fluxel from 'fluxel';

const myDiv = fluxel.div('Hello, World!');
document.body.appendChild(myDiv); // <div>Hello, World!</div>
```

### Setting Attributes and Event Handlers

```typescript
import fluxel from 'fluxel';

const button = fluxel.button({
  children: 'Click Me!',
  onclick: () => console.log('Button clicked!'),
  style: { backgroundColor: 'dodgerblue', color: 'white', padding: '10px' },
  classList: ['btn', 'btn-primary'],
  dataset: { action: 'submit' }
});
document.body.appendChild(button);
```

### Reactive State with `fluxel.reactive`

This utility allows you to create dynamic UI components that update automatically when their state changes.

```typescript
import fluxel from 'fluxel';

const reactiveComponent = fluxel.reactive({ counter: 0, label: "Count" }, state => ([
  fluxel.div({
    style: {
      backgroundColor: state.use("counter").derive(c => c % 2 === 0 ? "lightgreen" : "lightcoral"),
    },
    children: [
      fluxel.h3("Reactive Counter"),
      fluxel.p([
        fluxel.span(state.use("label").derive(l => l + ": ")),
        fluxel.span(state.use("counter")), // Direct reactive value
      ]),
      fluxel.button({
        children: "Increment",
        onclick: () => { state.counter++; } // Modify state to trigger updates
      })
    ]
  })
]));

document.body.appendChild(reactiveComponent);
```

* **`state.use(key)`**: Returns a `ReactiveDependency` for a state property. During the component's initial render (which happens only once), this call **explicitly builds a direct dependency map**. This map links specific UI elements (like attributes, styles, or children) to the state properties they depend on. When a state property changes, `create-element` leverages this pre-built map to **directly and efficiently update only the affected DOM nodes or properties**, without re-rendering the entire component or using a virtual DOM diffing algorithm.
* **`ReactiveDependency.derive(fn)`**: Creates a new `ReactiveDependency` whose value is derived from the original one. The `deriveFn` is re-evaluated only when its declared dependencies change, ensuring efficient recalculations.
* **Updating state**: Directly assigning a new value to a state property (e.g., `state.counter++`) triggers updates. For nested object changes, `state.render()` might be needed if the top-level property reference doesn't change.

### `fluxel.useUniqueString`

Generates a unique ID for use with `id` and `htmlFor` attributes, simplifying accessible form elements.

```typescript
import fluxel from 'fluxel';

const formElement = fluxel.useUniqueString(id => [
  fluxel.label({ htmlFor: id, children: "Your Name:" }),
  fluxel.input({ type: "text", id: id, placeholder: "Enter name" })
]);
document.body.appendChild(formElement);
```

### `fluxel.fragment`

`fluxel.fragment` allows you to group multiple child nodes without introducing an additional wrapper DOM element into the DOM tree. This is particularly useful when you need to return multiple top-level elements from a component's `renderer` function, or when you want to apply common options (like event handlers or styles) to a collection of elements without affecting their DOM structure.

It takes two arguments: `children` and `options`.

- `children`: Can be a single `Node`, a `string`, a `ReactiveDependency`, or an array containing a mix of these. These will be the elements that compose the fragment.
- `options`: An optional object for applying attributes, event handlers, or styles to the *children* within the fragment. Note that `fragment` itself does not create a DOM element, so these options are applied to the immediate `HTMLElement` children if they are not `ReactiveDependency` objects.

```js
import fluxel from 'fluxel';

const ClickableItems = fluxel.component(
  (props, state) => {
    const handleClick = () => {
      state.clicks++;
    };

    return fluxel.fragment(
      [
        fluxel.button('Click Me 1'),
        fluxel.button('Click Me 2'),
        fluxel.p(state.use('clicks', clicks => `Total Clicks: ${clicks}`))
      ],
      {
        onclick: handleClick, // This handler applies to the buttons
        style: {
          margin: '5px',
          padding: '8px',
          border: '1px solid blue'
        }
      }
    );
  },
  { clicks: 0 }
);

// Each button will have the click handler and styles applied.
document.body.appendChild(ClickableItems());
```

### `fluxel.component`

Define reusable, stateful components. This function wraps `fluxel.reactive` to provide a clearer component structure.

The `renderer` function receives `props` and `state` as arguments:
- `props`: An object containing data passed from the parent component. Props are generally considered **immutable** within the component. **Directly changing a `prop` value within the component will not trigger a re-render or reactive update.** If the parent component provides a `ReactiveDependency` as a prop (e.g., via `parentState.use()`), the child component can then `derive` from this `ReactiveDependency` to react to its changes.
- `state`: An object representing the component's internal, reactive state. Changes to `state` properties via `state.propertyName = value` will automatically trigger a re-render of the component.

```typescript
import fluxel from 'fluxel';

interface CounterProps {
  title: string;
  initialCount?: number;
}

interface CounterState {
  count: number;
}

const MyCounter = fluxel.component<CounterProps, CounterState, HTMLElement>(
  // Component renderer function: receives props and state
  (props, state) => {
    return fluxel.div([ // Wrapped in a div
      fluxel.h3(props.title),
      fluxel.p(state.use('count').derive(c => `Count: ${c}`)), // Reactive content
      fluxel.button({
        children: "Increment",
        onclick: () => { state.count++; }
      })
    ]);
  },
  // Initial state for the component (can be a function of props)
  props => ({ count: props.initialCount || 0 })
);

document.body.append(
  MyCounter({ title: "First Counter" }),
  MyCounter({ title: "Second Counter", initialCount: 5 })
);
```

#### Component Lifecycle

`create-element` components have a straightforward lifecycle, primarily centered around their initial setup and subsequent reactive updates:

1.  **Initialization (`fluxel.component` call)**:
    * The `renderer` function is executed **only once** when the component instance is first created.
    * During this initial execution, `state.use()` calls within the `renderer` build the direct dependency map, linking UI elements to state properties.
    * The `initialState` (or `initialStateFn`) is evaluated to set up the component's internal reactive state.

2.  **Reactive Updates (State Changes)**:
    * After initialization, the `renderer` function is **never re-executed**.
    * Instead, when a state property is modified (e.g., `state.count++` or `state.render()` for nested objects), `create-element` leverages the dependency map built during initialization.
    * Only the specific DOM elements or attributes that are directly tied to the changed state property through `state.use` will be updated. This is a direct, push-based update to the DOM.

3.  **Prop Updates (Parent Changes)**:
    * If a parent component passes a `ReactiveDependency` as a prop, and that `ReactiveDependency` changes, the child component's UI can react to it *if* the child uses `props.yourPropName.derive()` to integrate it into its own reactive system. The child component's `renderer` itself is not re-executed by prop changes; only the derived values are updated.

This simple lifecycle ensures high performance by minimizing redundant computations and DOM manipulations, focusing updates directly on the reactive parts.

#### Handling Potentially Changing Props Reactively

If a prop's value can change over time from the parent, and you need the child component to reactively update based on this changing prop (e.g., for derived calculations or conditional rendering that depends on the prop's *current* value), you should map that prop into your component's internal reactive system using `state.derive()` on the prop itself.

**Important Note:** The `props` object itself is **not reactive**. Its values are set once per render cycle by the parent. To react to changes in a `prop`'s value when that `prop` is a `ReactiveDependency` from the parent, you must use `props.yourPropName.derive()` to create a new reactive dependency *within* the child component.

```ts
import fluxel from 'fluxel';

// This component manages a reactive message and passes it as a prop.
const ParentComponent = fluxel.component(
  (props, state) => {
    setTimeout(() => {
      state.message = "Message updated!";
    }, 2000);

    return fluxel.div([
      fluxel.h2('Parent Component'),
      // Use state.use with a derive function for string interpolation
      // or directly pass the ReactiveDependency if it's a single child.
      fluxel.p(state.use('message', msg => `Parent's current message: ${msg}`)),
      // Pass the ReactiveDependency directly as a prop to the child.
      DisplayMessage({ receivedMessage: state.use('message') }),
    ]);
  },
  { message: "Hello from parent!" }
);

// This component reacts to a prop passed as a ReactiveDependency.
const DisplayMessage = fluxel.component(
  (props, state) => {
    // We use props.receivedMessage.derive() to create a new ReactiveDependency
    // that updates whenever the parent's `message` (which is a ReactiveDependency) changes.
    const displayValue = props.receivedMessage.derive(msg => {
      return msg ? `Child displays: "${msg}"` : "Child displays: (No message)";
    });

    return fluxel.div({
      style: { border: '1px dashed #ccc', padding: '10px', margin: '10px 0' },
      children: [
        fluxel.h3('Display Message Component'),
        fluxel.p(displayValue), // Use the derived reactive value
      ],
    });
  },
  {} // This component doesn't need its own internal state.
);

document.body.appendChild(ParentComponent());
```

#### Memoization within Components

`create-element`'s reactivity model ensures highly efficient updates by directly patching the DOM only where state changes occur. However, the `renderer` function of `fluxel.component` runs only once during initialization, and `state.use`'s `deriveFn` is re-executed when its dependencies change. In certain scenarios, this can still lead to unnecessary re-creations of DOM elements or re-execution of expensive computations *within* a reactive block.

This is where `memo` and `useWithMemo` come in. Their design is specifically tailored to `create-element`'s unique "single renderer execution" model and push-based update strategy, differing from typical virtual DOM frameworks:

* **Optimizing within Reactive Blocks**: When you opt for a broader `state.use` scope for better code readability or component structure (e.g., when conditionally rendering entirely different elements like a 'Stop' button vs. a 'Start/Resume' button, as seen in the timer example), the entire block might re-execute even if only a small part of its output changes. `memo` allows you to prevent the re-creation of specific, unchanging elements or the re-running of expensive computations *within* that reactive block, ensuring optimal performance without sacrificing code clarity.
* **Targeted Use**: `memo` is tightly integrated with `state.use`'s dependency digestion process. This means its memoized data is managed per `state.use` call. The intention is to apply memoization precisely where direct state dependencies trigger a re-evaluation, rather than as a general-purpose caching mechanism across arbitrary function calls.
* **Addressing Component Separation Edge Cases (`useWithMemo`)**: While the primary recommendation is to bind reactivity directly to the changing properties of an element (e.g., `fluxel.span(state.use('value'))` instead of memoizing the entire `span`), real-world component separation often requires passing `ReactiveDependency` objects as props. `useWithMemo` facilitates memoization in these "edge cases" where a child component needs to optimize renders based on a reactive prop from its parent, extending the power of `memo` beyond the direct `deriveFn` scope.

By carefully applying `memo` and `useWithMemo`, you can maintain highly readable and modular component code while ensuring that only truly necessary DOM updates and computations occur.

* **`memo(factory, deps, pure?)`**: Available within the `deriveFn` of `state.use`, this function caches the result of the `factory` function as long as its `deps` (dependency array) do not change. This is useful for optimizing expensive computations or DOM element creations. Setting the `pure` option to `true` enables stricter memoization by stringifying the dependency array to generate a cache key.

    ```javascript
    fluxel.p({
      children: state.use(['count', 'label'], ({ count, label }, memo) => {
        const expensiveResult = memo(() => calculateSomething(count, label), [count, label]);
        return `${label}: ${expensiveResult}`;
      })
    });
    ```

* **`useWithMemo(key)`**: When a component receives a `ReactiveDependency` as a prop from its parent, this function allows you to obtain that `ReactiveDependency` along with a `memo` function usable within that component's scope. This enables memoization even outside the direct `state.use`'s `deriveFn` scope.

    ```javascript
    const MyComponent = fluxel.component({ /* ... */ }, (props, state) => {
      const [todos, memo] = state.useWithMemo('todos'); // Get ReactiveDependency and memo function
      // ...
      const todoItems = todos.derive(todos => todos.map(todo => memo(() => createTodoItem(todo), [todo])));
      // ...
    });
    ```

Proper use of `memo` and `useWithMemo` can significantly improve the performance of your `create-element` applications.

### Important Considerations for Reactivity

`fluxel` prioritizes lightweightness and direct DOM manipulation, which leads to specific behaviors regarding reactive updates of child elements:

1.  **Child Element Type Stability**:
    When using a `ReactiveDependency` as one element within a `children` array to dynamically switch between different types of elements, the type of the DOM node generated in the **first render** is determined. Subsequent updates will **not** change the underlying DOM node's type.

    * **Switching between HTMLElements**: Dynamically switching between different `HTMLElement` types (e.g., `fluxel.hr()` vs `fluxel.span()`) is achieved by creating a new element and **replacing** the old one.
    * **TextNode ⇔ HTMLElement switching is not supported**: Dynamic switching between a `TextNode` and an `HTMLElement` is not supported. If you need to conditionally render text or an element, it is recommended to wrap the text in an `HTMLElement` like `fluxel.span('text content')`.

    * **Conditional component rendering**: If you want to conditionally show or hide a component within a `children` array, it is recommended to either wrap the entire dynamic `children` array with an outer `ReactiveDependency`, or use an empty element like `fluxel.span()` when the component should not be displayed.

2.  **Efficient List Updates (Advanced Reconciliation)**:

    `create-element` employs a sophisticated, direct-to-DOM reconciliation algorithm for lists and dynamically changing children, even without a virtual DOM. This approach aims to minimize costly DOM operations.

    **How it Works (Direct DOM Reconciliation):**

    When a list of children (`children` property that is a `ReactiveDependency` that may change in length or order) needs to update:

    1.  **Direct DOM Comparison**: Instead of creating a new virtual DOM tree and comparing it, `create-element` directly compares the `newChildren` (the updated list of DOM nodes) with the `element.children` (the current live DOM nodes). This eliminates the overhead of a virtual DOM layer.

    2.  **Smart Diffing Algorithm**:
        * **End-Based Optimizations**: It first checks for additions or removals at the beginning or end of the list. If `newChildren` either start or end with the `currentChildren`, it performs highly efficient `appendChild`, `prepend`, or `removeChild` operations on only the changed elements.
        * **Node Instance Preservation**: For more complex changes (e.g., elements in the middle, reordering), the algorithm leverages the stability of DOM node instances generated by `create-element`. It uses `Node.isSameNode()` to efficiently identify existing nodes.
        * **Minimal Operations**: It strategically removes mismatched nodes from their current positions and then inserts new or moved nodes into their correct places. This ensures that only the absolutely necessary `appendChild`, `removeChild`, or `insertBefore` calls are made, avoiding a costly "clear and re-append all" strategy.

    3.  **Stability through Memoization (and `isSameNode`)**:
        The core philosophy of `create-element` is that DOM node instances are stable by default (as the `renderer` function runs only once). This stability is crucial for the direct DOM comparison using `isSameNode()`. Furthermore, by using `memo` (especially with `pure: true` for stable element instances, as seen in the TodoApp example for `li` elements), you can ensure that even when a `deriveFn` re-executes, unchanging child elements are not re-created, allowing the reconciliation algorithm to efficiently identify and preserve them in the DOM.

    This advanced direct DOM reconciliation, combined with the library's overall philosophy of stable DOM node instances, provides highly efficient updates for dynamic lists, often outperforming virtual DOM solutions by avoiding their inherent overheads.

3.  **TextNode vs. HTMLElement updates**:
    The library distinguishes between updating the content of a `TextNode` (which is highly efficient, as only `nodeValue` is changed) and replacing an `HTMLElement` (which involves creating a new element and replacing the old one). This pragmatic approach ensures efficiency for common text updates without incurring the overhead of complex element reconciliation for simple cases.

## Type Definitions

Key exported types are described below.

* **`ReactiveDependency<T>`**: A class representing a reactive value, enabling dependency tracking and derivation.
* **`StateParam<T>`**: The type for the state object passed to `fluxel.reactive`'s renderer and `fluxel.component`'s renderer, including `use` and `render` methods.

## Contributing

Feel free to open issues or pull requests on the GitHub repository if you have suggestions or find bugs.

## License

This project is licensed under the MIT License.
