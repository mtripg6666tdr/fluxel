# Fluxel - Tiny, Fast, and Delightful DOM Building Library
Fluxel is an ultra-lightweight and high-performance DOM-building library inspired by the simplicity of React's JSX and the DOM API. It enables the dynamic building of static and/or reactive UIs, offers strong type safety via TypeScript, and provides a pleasant developer and user experience—all with a surprisingly small footprint.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Features](#features)
- [Installation](#installation)
  - [Installation via package managers](#installation-via-package-managers)
  - [Importing](#importing)
  - [JSX Setup](#jsx-setup)
  - [Installation via CDN](#installation-via-cdn)
- [Usage](#usage)
  - [Basic Functional API Example](#basic-functional-api-example)
  - [Basic Functional API Example with Native DOM Reactivity](#basic-functional-api-example-with-native-dom-reactivity)
  - [Basic JSX Example](#basic-jsx-example)
  - [Build-Free JSX-like Syntax with HTM and `fluxel/h`](#build-free-jsx-like-syntax-with-htm-and-fluxelh)
  - [Using `classList`](#using-classlist)
  - [Using `fragment` (`Fluxel.fragment`)](#using-fragment-fluxelfragment)
    - [Functional API Example](#functional-api-example)
    - [JSX Example](#jsx-example)
  - [Components (`Fluxel.createComponent` / `Fluxel.createStatefulComponent`)](#components-fluxelcreatecomponent--fluxelcreatestatefulcomponent)
    - [Basing Example](#basing-example)
    - [Component Overview](#component-overview)
    - [State Nesting and Re-rendering](#state-nesting-and-re-rendering)
    - [Reactive State and `ReactiveDependency` Objects](#reactive-state-and-reactivedependency-objects)
    - [Component Lifecycle](#component-lifecycle)
    - [Notes on Prop Changes](#notes-on-prop-changes)
    - [Memoization within Components](#memoization-within-components)
  - [Creating an unique identifier (`Fluxel.useUniqueString`)](#creating-an-unique-identifier-fluxeluseuniquestring)
  - [Component-Bound Static Style Injection (`Fluxel.forwardStyle`)](#component-bound-static-style-injection-fluxelforwardstyle)
  - [Using Client-side Router](#using-client-side-router)
    - [Minimal Example](#minimal-example)
    - [Import Style](#import-style)
    - [Route Definition](#route-definition)
    - [Get Route Information (`useRouter`)](#get-route-information-userouter)
    - [Navigation](#navigation)
    - [Asynchronous Routes and Loading States](#asynchronous-routes-and-loading-states)
    - [Error Handling and `useRouter` Options](#error-handling-and-userouter-options)
  - [Server-Side Rendering (SSR) and Hydration](#server-side-rendering-ssr-and-hydration)
    - [`renderToString` Function](#rendertostring-function)
    - [`hydrate` Function](#hydrate-function)
    - [Important Considerations for SSR and Hydration](#important-considerations-for-ssr-and-hydration)
    - [SSR and Hydration Example](#ssr-and-hydration-example)
    - [Technical Overview](#technical-overview)
- [Advanced Reactivity Information](#advanced-reactivity-information)
  - [Efficient List Updates (Advanced DOM Diffing and Application)](#efficient-list-updates-advanced-dom-diffing-and-application)
  - [`TextNode` Updates vs. `HTMLElement` Updates](#textnode-updates-vs-htmlelement-updates)
  - [Child Element Type Stability](#child-element-type-stability)
  - [Triggering Side Effects by Monitoring State Changes (`state.listenTarget`)](#triggering-side-effects-by-monitoring-state-changes-statelistentarget)
  - [Expressing Reactive Elements without Components (`Fluxel.reactive`)](#expressing-reactive-elements-without-components-fluxelreactive)
  - [Memoization when using `ReactiveDependency` as `Props` (`state.useWithMemo`)](#memoization-when-using-reactivedependency-as-props-stateusewithmemo)
- [Type Definitions](#type-definitions)
- [Contributions](#contributions)
- [License](#license)

## Features

* 💡 **Intuitive API (Functional & JSX)**: You can create elements using tag-based functions like `Fluxel.div()` and `Fluxel.span()`. For those who prefer declarative code, Fluxel also supports optional React-like JSX syntax (`<div />`). Both styles allow for efficient UI building.
* ⚡ **High-Performance DOM Updates / Reactive System**: Fluxel features a state-driven reactivity system that automatically updates the UI when the state changes. Without relying on a virtual DOM, it updates only the specific DOM nodes linked to the changed state, achieving exceptional performance.
* 🧭 **Integrated Client-Side Router**: Fluxel comes with a powerful, built-in client-side router that enables seamless navigation within your single-page applications. It supports dynamic routes, nested routing, and efficient view updates without full page reloads, ensuring a smooth user experience. Besides, all can be done without compilation, significantly simplifying the development process.
* 🧩 **`Fluxel.fragment`**: A utility that allows grouping multiple children without introducing unnecessary wrapper elements in the DOM. It can intelligently propagate attributes (especially `classList` and event handlers) to its children.
* 🏗️ **`Fluxel.createComponent` / `Fluxel.createStatefulComponent`**: Lightweight abstractions for defining reusable UI components. You can clearly define both stateless and reactive components.
* 🍃 **Ultra-Compact & Build-Free Modular Design**: Fluxel boasts an incredibly tiny footprint, achieved through its zero-dependency and modular design. It's engineered to be ultra-compact at runtime. You can selectively import features to keep your app lean:
  * **Core**: around **<!--CORE-->3.17KB<!--CORE-->** (gzipped)
  * **Reactive Core**: around **<!--RCORE-->4.25KB<!--RCORE-->** (gzipped)
  * **Reactive Core with JSX Support**: around **<!--JSX-->4.37KB<!--JSX-->** (gzipped)
  * **Reactive Core with Router**: around **<!--ROUTER-->5.42KB<!--ROUTER-->** (gzipped)
  * **Reactive Core with JSX and Router**: around **<!--JROUTER-->5.59KB<!--JROUTER-->** (gzipped)
  * **Hyperscript-compatible `h` function factory**: + around **<!--HFACTORY-->0.81KB<!--HFACTORY-->** (gzipped)
  * **Hydration for SSR**: + around **<!--SSRCLIENT-->1.10KB<!--SSRCLIENT-->** (gzipped)

## Installation
**Instead of reading through the detailed installation instructions below,**
**you can use our interactive [Import Assistant](https://static-objects.usamyon.moe/fluxel_temporary/index.html) for a personalized guide.**

### Installation via package managers

```sh
npm install fluxel
# or
yarn add fluxel
```

### Importing

Once installed, you can import Fluxel and start using it immediately.
Fluxel provides multiple import modules based on your needs:

|                                    | Without Reactivity | With Reactivity              | With Reactivity and Router   |
| :--------------------------------: | :----------------: | :--------------------------: | :--------------------------: |
| **Functional API**                 |      `fluxel`\*    | `fluxel/reactive`\*          |  `fluxel/reactive-router`\*  |
| **JSX Syntax (New JSX Transform)** |         -          | `fluxel/jsx-reactive`        | `fluxel/jsx-reactive-router` |
| **JSX Syntax (Old JSX Transform)** |         -          | `fluxel/jsx-reactive-legacy` |             -                |

All APIs available in `fluxel` are also available in the other modules.
You can choose and import just one of these.

If you have more specific development needs, some of these optional modules may be needed.
|                                                 | Module                |
| :---------------------------------------------: | :-------------------: |
| **Hyperscript-compatible `h` function factory** | `fluxel/h`\*          |
| **Hydration feature for SSR**                   | `fluxel/ssr/client`\* |

* Modules with the asterisk (`*`) are also available via CDN. See [Installation via CDN](#installation-via-cdn) for more details.

Fluxel supports both CommonJS and ESModules. If using CommonJS, note that the `default` property corresponds to the default export of ESModules:

```js
// CommonJS example
const Fluxel = require('fluxel').default;
```

### JSX Setup

To use JSX with Fluxel, you’ll need a JSX-compatible compiler. Here's an example using the TypeScript compiler:

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "fluxel"
  }
}
```

This uses the modern React runtime. Fluxel supports both the new and legacy React runtimes.
To use the legacy one, set `"jsx": "react"`, and configure `"jsxFactory"` and `"jsxFragment"` like this:

```json
{
  "jsxFactory": "Fluxel.jsx.createElement",
  "jsxFragment": "Fluxel.jsx.Fragment"
}
```

Then import Fluxel in all files like so:

```ts
import Fluxel from "fluxel/jsx-reactive-legacy";
```

### Installation via CDN

Instead of installing via package managers like npm, you can load it directly into your HTML from a CDN like [jsDelivr](https://www.jsdelivr.com/).

* If you don't need reactivity, paste the following into your `<head>`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/fluxel@x.x/dist/browser/fluxel.min.js"></script>
  ```

* If reactivity is required, paste the following into your `<head>`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/fluxel@x.x/dist/browser/fluxel-reactive.min.js"></script>
  ```

* If reactivity and the router feature are required, paste the following into your `<head>`:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/fluxel@x.x/dist/browser/fluxel-reactive-router.min.js"></script>
  ```

* **Optional modules**:
  * If you plan to use [htm](https://npmjs.com/package/htm) or similar libraries for JSX-like syntax without a build step,
    include the following together with one of above tags in your `<head>` to load the Hyperscript-compatible h function factory.
    ```html
    <script src="https://cdn.jsdelivr.net/npm/fluxel@x.x/dist/browser/fluxel-h.min.js"></script>
    ```

  * If you need the hydration feature for SSR, include the folloing together with one of above tags in your `<head>`.
    ```html
    <script src="https://cdn.jsdelivr.net/npm/fluxel@x.x/dist/browser/fluxel-ssr-client.min.js"></script>
    ```

For ES Modules usage, you can import Fluxel directly from [esm.run](https://www.jsdelivr.com/esm). This is useful when you want to use `import` statements in your browser-side JavaScript without a bundler.

* If you don't need reactivity:
  ```js
  import Fluxel from 'https://esm.run/fluxel@x.x';
  ```

* If reactivity is required:
  ```js
  import Fluxel from 'https://esm.run/fluxel@x.x/reactive';
  ```

* If reactivity and the router feature are required:
  ```js
  import Fluxel from 'https://esm.run/fluxel@x.x/reactive-router';
  ```

* **Optional modules**:
  * If you need the the Hyperscript-compatible h function factory for [htm](https://npmjs.com/package/htm) or similar libraries:
    ```js
    import FluxelHFactory from 'https://esm.run/fluxel@x.x/h';
    ```
  * If you need the hydration feature for SSR:
    ```js
    import hydrate from 'https://esm.run/fluxel@x.x/ssr/client';
    ```

Please replace `x.x` with the appropriate version number for all CDN and ES Modules links.

## Usage

### Basic Functional API Example

```tsx
import Fluxel from 'fluxel';

const myDiv = Fluxel.div('Hello, World!');
document.body.appendChild(myDiv); // <div>Hello, World!</div>

const button = Fluxel.button({
  children: 'Click Me!',
  onclick: () => console.log('Button clicked!'),
  style: { backgroundColor: 'dodgerblue', color: 'white', padding: '10px' },
  classList: ['btn', 'btn-primary'],
  dataset: { action: 'submit' }
});
document.body.appendChild(button);
```

### Basic Functional API Example with Native DOM Reactivity
This is a minimal example of `ToDo List` without fluxel's reactivity.
```js
import Fluxel from "fluxel";

const TodoItem = Fluxel.createComponent(({ text }) => Fluxel.div([
  Fluxel.input({
      type: "checkbox",
      onchange: e => e.target.closest("div").querySelector("span").style.textDecoration = e.target.checked ? "line-through" : "",
  }),
  Fluxel.span(text),
  Fluxel.a({
      onclick: e => e.target.closest("div").remove(),
      children: "❌",
  }),
]));

const TodoList = Fluxel.createComponent(() => {
  const todoInput = Fluxel.input({ type: "text", placeholder: "New todo..." });

  const dom = Fluxel.div([
      todoInput,
      Fluxel.button({
          onclick: () => {
              dom.appendChild(TodoItem({ text: todoInput.value.trim() }));
              todoInput.value = ""; // Clear the input field.
          },
          children: "Add"
      }),
  ]);
  return dom;
});

document.body.appendChild(TodoList());
```

<!--
### Basic Functional API Example with Fluxel's Reactivity
```ts

```
-->

### Basic JSX Example

```tsx
// src/index.tsx
import Fluxel, { type FluxelJSXElement } from "fluxel/jsx-reactive";

const MyComponent = Fluxel.createStatefulComponent((_, state) => {
  const handleClick = () => {
    state.count++;
  };
  return (
    <div>
      <h1>Fluxel Counter</h1>
      <p>Count: {state.use("count")}</p>
      <button onclick={handleClick}>Increment</button>
    </div>
  );
}, { count: 0 });

document.getElementById('app')!.appendChild(Fluxel.ensureNode(<MyComponent />));
```

Use the `ensureNode` function to convert a `FluxelJSXElement` into a DOM Node:

```tsx
import Fluxel, { type FluxelJSXElement } from "fluxel/jsx-reactive";

const instance: FluxelJSXElement = <MyComponent />;
const node: Node = Fluxel.ensureNode(instance);
```

### Build-Free JSX-like Syntax with HTM and `fluxel/h`

If you want to use JSX-like syntax directly in the browser without a build tool, you can combine the [htm](https://npmjs.com/package/htm) library with Fluxel's `fluxel/h` module. The `fluxel/h` module provides a `FluxelHFactory` function, which takes a Fluxel instance and returns a [Hyperscript](https://github.com/hyperhype/hyperscript)-compatible `h` function. This `h` function can then be bound to `htm`.

This approach allows you to write declarative UI code similar to JSX directly in your HTML, leveraging Fluxel's rendering capabilities without the need for a compilation step.

```js
const h = FluxelHFactory(Fluxel);
const html = htm.bind(h);

const myElement = Fluxel.createComponent(() => html`
    <div>Hello from HTM + Fluxel!</div>
`);

document.body.appendChild(myElement);
```

While the `h` function provided by `FluxelHFactory` is designed to be [Hyperscript](https://github.com/hyperhype/hyperscript)-compatible, it's important to clarify that it doesn't support all Hyperscript variations. Specifically, it does not support:

  * Class or ID attributes directly in the tag name (e.g., `h('div#myId.myClass', ...)`)
  * String-based `style` attributes (e.g., `h('div', { style: 'color: red;' })`)
  * Kebab-case keys in the `style` object (e.g., `h('div', { style: { 'background-color': 'blue' } })`). Use camelCase instead (`backgroundColor`).

Additionally, consistent with other Fluxel functions, you must use `classList` instead of className for applying CSS classes. See the below section for more details. These constraints are a deliberate decision to minimize the bundle size of `FluxelHFactory`.

### Using `classList`

When handling the `class` attribute, use the `classList` property in Fluxel. It supports both strings and arrays of strings—including reactive values—allowing for flexible and dynamic class management.

> ⚠️ **Note**: Do not use `className`; use `classList` instead for advanced and reactive functionality.

```tsx
import Fluxel from 'fluxel/reactive';

const MyComponent = Fluxel.createStatefulComponent((_, state) => {
  const toggleActive = () => {
    state.isActive = !state.isActive;
  };

  return (
    <button
      onclick={toggleActive}
      classList={['button', state.use('isActive', active => active ? 'active' : '')]}
      style={{ padding: '10px', margin: '5px' }}
    >
      Click Me ({state.use('isActive', active => active ? 'Active' : 'Inactive')})
    </button>
  );
}, { isActive: false });

document.body.appendChild(Fluxel.ensureNode(<MyComponent />));
```

### Using `fragment` (`Fluxel.fragment`)

`Fluxel.fragment` allows grouping multiple elements without wrapping them in an extra DOM element. In addition, attributes and event handlers can be propagated to child elements.

#### Functional API Example

```ts
import Fluxel from 'fluxel';

const handleClick = () => {
  console.log('Fragment children clicked!');
};

const myFragment = Fluxel.fragment(
  [
    Fluxel.button('Static Button 1'),
    Fluxel.button('Static Button 2'),
    Fluxel.p('This is a static paragraph.')
  ],
  {
    onclick: handleClick,
    style: {
      margin: '5px',
      padding: '8px',
      border: '1px solid blue',
      borderRadius: '8px'
    },
    classList: ['fragment-group']
  }
);

document.body.appendChild(myFragment);
```

#### JSX Example

You can utilize the `Fragment` component, which wraps `Fluxel.fragment` as a JSX-compatible component. `Fragment` can be utilized via named import from `fluxel/jsx-reactive`.

```tsx
import Fluxel, { Fragment } from "fluxel/jsx-reactive";

const ClickableItemsJSX = Fluxel.createStatefulComponent(
  (_, state) => {
    const handleClick = () => {
      state.clicks++;
    };

    return (
      <Fragment
        onclick={handleClick}
        style={{
          margin: '5px',
          padding: '8px',
          border: '1px solid green',
          borderRadius: '8px'
        }}
        classList={['fragment-group-jsx']}
      >
        <button>Click Me 1 (JSX)</button>
        <button>Click Me 2 (JSX)</button>
        <p>Total Clicks (JSX): {state.use('clicks', clicks => `${clicks}`)}</p>
      </Fragment>
    );
  },
  { clicks: 0 }
);

document.getElementById('app')!.appendChild(Fluxel.ensureNode(<ClickableItemsJSX />));
```

### Components (`Fluxel.createComponent` / `Fluxel.createStatefulComponent`)

Fluxel allows you to define reusable UI parts as components. This improves code modularity, readability, and maintainability.

#### Basing Example

```tsx
// src/index.ts
import Fluxel from "fluxel/jsx-reactive"; // Import this when using JSX
// Even when using the functional API, `Fluxel.createComponent` and `Fluxel.createStatefulComponent` can be used by importing from 'fluxel' or 'fluxel/reactive'.
// (Note: `Fluxel.createStatefulComponent` is only available when importing from reactive modules.)

const MyComponent = Fluxel.createStatefulComponent((_, state) => {
  const handleClick = () => {
    state.count++;
  };
  return (
    <div>
      <h1>Fluxel Counter</h1>
      <p>Count: {state.use("count")}</p>
      <button onclick={handleClick}>Increment</button>
    </div>
  );
}, { count: 0 });

document.getElementById('app')!.appendChild(Fluxel.ensureNode(<MyComponent />));
```

#### Component Overview

Fluxel components come in two types: `Fluxel.createComponent` (stateless) and `Fluxel.createStatefulComponent` (stateful). Both function as functional components, accepting Props and returning Fluxel elements (DOM nodes or reactive values).

The signatures for these two functions are as follows:

```ts
// Stateless component
Fluxel.createComponent(renderer: (props: P) => ReturnType);

// Stateful component
Fluxel.createStatefulComponent(renderer: (props: P, state: StateParam<S>) => ReturnType, initialState: S | ((props: P) => S));
```

* `props`: An object containing data passed from the parent component. Props are generally considered **immutable** within the component. Directly changing the values of props will not trigger re-rendering or reactive updates. (This is due to the component's lifecycle; please refer to the section on lifecycle later for details.) If the parent component provides a **reactive value (an instance of `ReactiveDependency`)** obtained via `state.use()` or similar (e.g., via `parentState.use()`), the child component can react to its changes by calling `derive()` from that reactive value.

* `state`: An object representing the component's internal reactive state. When you directly change a `state` property's value, such as `state.propertyName = value`, Fluxel automatically detects the change and updates the associated UI. (If you change a nested value, Fluxel **will not** automatically detect as you intend. See below for more details.) This is generally available via `createStatefulComponent`.

* `initialState`: Sets the initial value of the component's internal reactive state. In addition to initializing with a fixed value, you can also set `initialState` based on the values of props. In this case, `initialState` should be a function that accepts props and returns the initial value for the reactive state.

#### State Nesting and Re-rendering

When you update a **nested value** within your component's state (e.g., `state.myObject.myProperty = newValue`), Fluxel's reactivity system **will not automatically detect this change and trigger a re-render** of the component. This is because Fluxel tracks changes to the top-level properties of the `state` object, not deep mutations within nested objects or arrays.

To ensure your component re-renders and reflects the updated nested value, you must **manually trigger a re-render** for that specific state property by calling `state.render('yourStatePropertyKey')`.

For example:

```javascript
// ❌ Incorrect: This will not trigger a re-render
state.myObject.myProperty = newValue;

// ✅ Correct: Call state.render() to force a re-render for 'myObject'
state.myObject.myProperty = newValue;
state.render('myObject');
```

This explicit call tells Fluxel to re-evaluate any parts of your component's rendering logic that depend on `state.myObject`, ensuring your UI stays synchronized with your data.

#### Reactive State and `ReactiveDependency` Objects

The core of Fluxel's reactive system lies in its mechanism for detecting state changes and automatically updating the UI accordingly.

* **Reactive State**:
  The `state` object of components defined with `Fluxel.createStatefulComponent` has reactive properties. This means that by simply changing a property's value directly, such as `state.propertyName = newValue`, Fluxel detects the change and automatically updates the associated UI elements. Developers can focus on state management without manually manipulating the DOM.

* **`ReactiveDependency` Object**:
  Calling `state.use("propertyName")` returns not the **current value** of that property itself, but a **dependency (`ReactiveDependency` object)** for updating the UI when that value changes. This `ReactiveDependency` object is like a "reference" to a reactive value; when its value changes, the UI elements dependent on it are automatically re-rendered.

  For example, `state.use("count")` retrieves not the current value of the `count` state itself, but a "reference" to the `count` state. This provides a mechanism to update its display when it changes.

  Furthermore, the `ReactiveDependency` object has a `derive()` method. This allows you to "derive" new reactive values from existing ones. By calling this method, the derived value can also track changes in the existing reactive value.

  ```ts
  const myReactiveValue = state.use("someProperty"); // This returns a ReactiveDependency object
  const derivedValue = myReactiveValue.derive(val => `Derived value: ${val}`); // Derive a new ReactiveDependency
  // If this derivedValue is bound to the UI, it will be updated every time myReactiveValue changes.
  ```

  You can also concisely write `derive()` in the form of `state.use("propertyName", deriveFn)`. In this case, `deriveFn` will be executed every time the value of `propertyName` changes, and its return value will be reflected in the UI. This behaves almost identically to calling the `derive()` method.
  The clear distinction between `state.use("propertyName", deriveFn)` and `state.use("propertyName").derive()` calls is whether a memoization function is passed as the second argument to `deriveFn`. Further details about memoization functions will be provided later.

  ```ts
  // This will result in the same outcome as the derive() example above.
  const derivedValue = state.use("someProperty", val => `Derived value: ${val}`);
  ```

  If you were to write ``const derivedValue = `Derived Value: ${state.someProperty}` `` here, and then bind this `derivedValue` to the UI, the UI would not update even if `state.someProperty` changes.

#### Component Lifecycle

Fluxel components have a simple lifecycle, centered around initial setup and subsequent reactive updates.

1.  **Initialization (When `Fluxel.createComponent` / `Fluxel.createStatefulComponent` is called)**:

  * The `renderer` function is executed **only once** when the component instance is first created.

  * During this initial execution, a direct dependency map linking UI elements and state properties is built through `state.use()` calls within the `renderer`.

  * `initialState` (or the function passed to `initialState`) is evaluated, and the component's internal reactive state is set.

2.  **Reactive Updates (Upon State Change)**:

  * After initialization, the `renderer` function is **never re-executed**.

  * Instead, when a state property changes (e.g., `state.count++`), Fluxel leverages the dependency map built during initialization.

  * Only specific DOM elements or attributes directly linked to the changed state property via `state.use` are updated. This is a direct, push-based update to the DOM.

3. **Props Updates (Upon Parent Component Change)**:

    * If the parent component passes a `ReactiveDependency` as a Prop, and that `ReactiveDependency` changes, the child component's UI can react to that change if it has integrated that Prop into its own reactive system using `props.yourPropName.derive()`. The child component's `renderer` itself is not re-executed due to Prop changes; only the derived values are updated.

This simple lifecycle minimizes redundant calculations and DOM operations, focusing updates directly on the reactive parts, thereby ensuring high performance.

#### Notes on Prop Changes

If a Prop's value can change over time from the parent, and the child component needs to reactively update based on these changing Props (e.g., for derived calculations or conditional rendering dependent on the **current** value of the Prop), then that Prop must be mapped into the component's internal reactive system using `props.yourPropName.derive()`.

**Important**: The `props` object itself is **not reactive**. Its values are set once per rendering cycle by the parent. To react to changes in a `prop` value passed as a `ReactiveDependency` from the parent, you must create a new reactive dependency within the child component using `props.yourPropName.derive()`.


```ts
import Fluxel from 'fluxel/reactive';

// This component manages a reactive message and passes it as a Prop.
const ParentComponent = Fluxel.createStatefulComponent(
  (props, state) => {
    setTimeout(() => {
      state.message = "Message updated!";
    }, 2000);

    return Fluxel.div([
      Fluxel.h2('Parent Component'),
      // Use state.use and the derive function for string interpolation
      // Alternatively, pass ReactiveDependency directly if it's a single child element
      Fluxel.p(state.use('message', msg => `Parent's current message: ${msg}`)),
      // Pass ReactiveDependency directly as a Prop to the child.
      DisplayMessage({ receivedMessage: state.use('message') }),
    ]);
  },
  { message: "Hello from parent!" }
);

// This component reacts to Props passed as ReactiveDependency.
const DisplayMessage = Fluxel.createComponent(
  (props) => {
    // Create a new ReactiveDependency using props.receivedMessage.derive().
    // This ensures updates whenever the parent's `message` (ReactiveDependency) changes.
    const displayValue = props.receivedMessage.derive(msg => {
      return msg ? `Child displays: "${msg}"` : "Child displays: (No message)";
    });

    return Fluxel.div({
      style: { border: '1px dashed #ccc', padding: '10px', margin: '10px 0', borderRadius: '8px' },
      children: [
        Fluxel.h3('Display Message Component'),
        Fluxel.p(displayValue), // Use the derived reactive value
      ],
    });
  } // This component does not require its own internal state.
);

document.body.appendChild(ParentComponent());
```

#### Memoization within Components

Fluxel's reactivity model ensures high efficiency by directly patching only the parts of the DOM where state changes occur. However, the `renderer` function of `Fluxel.createComponent` and `Fluxel.createStatefulComponent` is executed only once during initialization, and the `deriveFn` of `state.use` is re-executed when its dependencies change. In certain scenarios, this can lead to unnecessary regeneration of DOM elements or re-execution of expensive calculations within reactive blocks.

This is where the `memo` function comes in. Its design is specialized for Fluxel's unique "single renderer execution" model and push-based update strategy, differing from typical Virtual DOM frameworks.

* **Optimization within Reactive Blocks**: If you expand the scope of `state.use` for code readability or component structure (e.g., conditionally rendering entirely different elements like "Stop" and "Start/Resume" buttons in a timer UI), the entire DOM block might be regenerated even if only a small part or none of the output has changed. Using `memo` within that reactive block can prevent the regeneration of specific unchanging elements or the re-execution of expensive calculations, ensuring optimal performance without sacrificing code clarity.

* **Targeted Usage**: `memo` is tightly integrated with the dependency digestion process of `state.use`. This means that memoized data is managed per `state.use` call. The intention is to apply memoization precisely where direct state dependencies trigger re-evaluation, and this memoization feature is not a general-purpose caching mechanism for arbitrary function calls.

* The `memo` function is available within `state.use`'s `deriveFn` in the form of `memo(factory, deps, pure?)`. This function caches the result of the `factory` function as long as `deps` (dependency array) does not change. This helps optimize expensive calculations and DOM element generation. To correctly associate with memoized data, the number of calls to this function must not change within the same component. If the `pure` option is set to `true`, more strict memoization becomes possible by stringifying the dependency array to generate a cache key. This allows for efficient reuse of existing DOM nodes and maximizes performance even when elements in a list are added, removed, or reordered. Note that when the `pure` option is enabled, the number of `memo` function calls can be changed.

  ```tsx
  // Code returning elements within the component's renderer function
  // Each <li> element for a ToDo item will not be regenerated unless todo.id and todo.completed change.
  return (
    <ul>
      {state.use("todos", (currentTodos, memo) =>
        currentTodos.map(todo => memo(() => (
          <li>
            <span onclick={() => toggleTodo(todo.id)} classList={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
            <button onclick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ), [todo.id, todo.completed], true))
        // pure = true enables strict memoization and element reuse. When pure = true,
        // the number of memo function calls within deriveFn does not need to be the same each time.
      )}
    </ul>
  );
  ```

### Creating an unique identifier (`Fluxel.useUniqueString`)

`Fluxel.useUniqueString` helps generate unique strings that can be used for HTML element attributes like `id` and `htmlFor`, simplifying accessibility for form elements and more. This function accepts a callback function as an argument, and the generated unique ID is passed as a string to this callback.

```tsx
import Fluxel from "fluxel/jsx";

const MyForm = Fluxel.createComponent(() => {
  return Fluxel.useUniqueString((inputId) => (
    <form>
      <label htmlFor={inputId}>Name:</label>
      <input type="text" id={inputId} name="name" />
    </form>
  ));
});

document.body.appendChild(Fluxel.ensureNode(<MyForm />));
```

### Component-Bound Static Style Injection (`Fluxel.forwardStyle`)

Fluxel.forwardStyle is a powerful utility function that allows you to dynamically insert CSS strings into the document's &lt;head&gt; at any time. This provides a flexible way to manage styles, especially for component-specific or theme-related styling.

This function accepts a single CSS string as its argument and returns nothing (void). The CSS rules provided in the string are immediately inserted into the document's &lt;head&gt; upon function call, and the styles are applied instantly.

```tsx
import Fluxel from 'fluxel';

const MyButtonComponent = Fluxel.createComponent(() => {
  // Styles are injected when this component is first rendered.
  Fluxel.forwardStyle(`
    .my-button {
      background-color: #007bff;
    }
    .my-button:hover {
      background-color: #0056b3;
    }
  `);

  return Fluxel.button({
    classList: ['my-button'],
    children: 'Click Me'
  });
});
```

**Key Features & Benefits:**

* **Dynamic Style Insertion**: Insert CSS rules into the &lt;head&gt; at any point during the application's lifecycle, enabling dynamic styling based on user interactions or application state.  
* **Automatic Deduplication**: The function performs deduplication by comparing the exact CSS string. If the same CSS string is passed multiple times, it will only be inserted into the &lt;head&gt; once, preventing redundant style tags.  
* **Immediate Application**: Styles are applied instantly when the forwardStyle function is called.  
* **Component-Specific Styling (Initial Load)**: It is particularly suitable for injecting common styles that a component needs when it is first initialized. This helps manage styles that are logically tied to a component.

**Important Considerations:**

* **No Deletion Functionality**: Once a style string is inserted via forwardStyle, there is no built-in function to remove it from the &lt;head&gt;.  
* **No Scoping**: Styles inserted by forwardStyle are applied globally to the entire document. There is no automatic mechanism for scoping styles to specific component instances or elements. Developers should manage potential style conflicts manually.  
* **Not for Unique Dynamic Styles**: This function is generally not recommended for scenarios requiring the generation of unique class names for every component instance or highly dynamic, instance-specific styling that needs to be scoped or removed. This is because once CSS is added, it cannot be deleted, leading to an accumulation of style definitions. Its primary use case is for applying a fixed set of styles that are common to a component or a specific part of the application upon its initial rendering.

### Using Client-side Router

Fluxel includes a powerful and flexible client-side router, perfect for building Single-Page Applications (SPAs) that offer a smooth and responsive user experience.

* **Flexible Routing Modes**: Supports both clean URL (`history` API) and hash-based (`#`) routing, giving you control over your application's URL structure.
* **Dynamic & Nested Routes**: Easily define routes with dynamic parameters (e.g., `/users/:id` or optional segments like `/blog/:year?/`) and capture them using intuitive named groups for direct access in your components.
* **Reactive Query Parameters**: Query parameters (`?key=value`) are automatically reactive. When these parameters change, your components can efficiently respond to the URL updates without a full page reload, ensuring a highly dynamic UI.
* **Asynchronous Route Loading & Smooth Transitions**: Seamlessly handles asynchronous components (e.g., for code splitting and lazy loading). Besides, a built-in `deferUpdate` mechanism intelligently defers UI updates until new route components are fully loaded, preventing content flickering or temporary empty states and ensuring a smooth user experience.
* **Integrated Fallback**: Provides a graceful fallback component for unmatched routes, ensuring that users always see meaningful content, even when navigating to non-existent paths.

#### Minimal Example

Here's a minimal example demonstrating how to set up and use the Fluxel router with basic routes, navigation, and parameter/query access.

```js
import Fluxel, { createRouter, useRouter } from 'fluxel/reactive-router';

// 1. Define Route Components
const HomePage = Fluxel.createComponent(() => Fluxel.div({
  children: [
    Fluxel.h1('Home Page'),
    Fluxel.p('Welcome to the Fluxel Router Example!'),
  ]
}));

const AboutPage = Fluxel.createComponent(() => Fluxel.div({
  children: [
    Fluxel.h1('About Us'),
    Fluxel.p('Learn more about Fluxel.'),
  ]
}));

const UserProfilePage = Fluxel.createComponent(() => {
  // 2. Use useRouter to get the current router state (path, parameters, query)
  const router = useRouter();

  const userId = router.params.id; // params is a pure object with path parameters
  const userName = router.query.use("name", name => name || 'Guest'); // // query is a reactive state object

  return Fluxel.div({
    children: [
      Fluxel.h1(`User Profile: ${userId}`),
      Fluxel.p(userName.derive(name => `Hello, ${name}!`)),
      // Example of links to change query parameters
      Fluxel.Link({ href: `/users/${userId}?name=Jane`, children: 'Change name to Jane' }),
      Fluxel.br(),
      Fluxel.Link({ href: `/users/${userId}?name=John`, children: 'Change name to John' })
    ]
  });
});

const NotFoundPage = Fluxel.createComponent(() => Fluxel.div({ children: [
  Fluxel.h1('404 - Page Not Found'),
  Fluxel.p('The page you are looking for could not be found.'),
]}));

// 3. Define Route Configuration
const router = createRouter({
  '/': HomePage,
  '/about': AboutPage,
  '/users/:id': UserProfilePage,
  '/*': NotFoundPage, // Fallback for unmatched routes
});

// 4. Main Application Component
const App = Fluxel.createComponent(() => {
  // Navigation Bar (static content, NOT inside the router's dynamic area)
  const Navbar = Fluxel.div({
    classList: ['p-4', 'bg-blue-600', 'text-white'],
    children: Fluxel.ul({
      classList: ['flex', 'space-x-4'],
      children: [
        Fluxel.li(Fluxel.Link({ href: '/', children: 'Home' })),
        Fluxel.li(Fluxel.Link({ href: '/about', children: 'About' })),
        Fluxel.li(Fluxel.Link({ href: '/users/123?name=Alice', children: 'User 123 (Alice)' })),
        Fluxel.li(Fluxel.a({ href: '/non-existent', children: 'Non-existent Page' })) // For 404 testing
      ],
    })
  });

  return Fluxel.div({
    // Main container for the entire application layout
    classList: ['min-h-screen', 'flex', 'flex-col'],
    children: [
      Navbar, // Place the static navigation bar here
      // The router's dynamic content area (the Outlet)
      // The Provider component itself will manage rendering the matched route component
      Fluxel.div({
        classList: ['p-4', 'flex-grow'], // Use flex-grow to take available vertical space
        children: router.Provider(), // Call Provider without explicit children for route content
      }),
    ]
  });
});

// Render the application to the DOM
document.body.appendChild(App());
```

#### Import Style

The `createRouter` and `useRouter` functions, as well as the `Link` component, can be accessed in two convenient ways:

1.  **Via `Fluxel` object**:
    * `Fluxel.createRouter(...)`
    * `Fluxel.useRouter()`
    * `Fluxel.Link(...)`

2.  **Via named imports**:
    * `import { createRouter, useRouter, Link } from 'fluxel/reactive-router';` (or `fluxel/jsx-reactive-router`)

Choose the import style that best suits your project's coding conventions and readability preferences. Both methods provide access to the same powerful router functionalities.

#### Route Definition
  * **Dynamic Segments**: Define dynamic parts of your path using a colon (e.g., `/users/:id`).
  * **Optional Segments**: Make path segments optional by adding a question mark (e.g., `/blog/:year?/`).
  * **Catch-all Routes**: Use `'/*'` (e.g., `createRouter({ '/*': NotFoundPage })`) to define a fallback route that matches any path not explicitly defined, useful for handling 404 pages.

#### Get Route Information (`useRouter`)
  * **`router.route`**: The matched route pattern string (e.g., `/users/:id`). This can be useful for debugging or for conditional logic based on the route pattern itself, not just the rendered component.
  * **`router.pathname`**: The current pathname of URL (e.g., `/users/123`). Useful for logging or displaying the exact path. (Query parameter will not be included.)
  * **`router.params` (Non-Reactive)**: This is a plain JavaScript object holding path parameters extracted from your route pattern (e.g., `id` from `/users/:id`). These values are typically static for a given route match and do not react to changes.
  * **`router.query` (Reactive `StateParam` Object)**: This is a reactive `StateParam` object that manages URL query parameters (e.g., `?name=Alice`). Since query parameters can change dynamically, you should use `router.query.use()` or `.derive()` to access and react to their values. Changes to query parameters will automatically trigger UI updates.

#### Navigation
  * **`Fluxel.Link` Component**: Use this for declarative navigation. It behaves like a standard `<a>` tag, accepting an `href` attribute. Clicks are automatically intercepted to provide smooth SPA transitions.
  * **Programmatic Navigation (`router.navigate` or `globalNavigate`)**: For navigation triggered by events like form submissions or API responses, you can use `router.navigate(path, options)`. This method automatically respects the configured `basePath` and `mode` (history or hash).
      * `options.replace: true` can be passed to replace the current history entry, preventing the user from navigating back to the previous page.
      * `globalNavigate(path, options)` is a lower-level function that applies the `path` directly to the browser's URL without considering the router's `mode` or `basePath`. `router.navigate` internally uses `globalNavigate` after adjusting the path based on the router's configuration (e.g., adding `#` for hash mode). Use `router.navigate` for most cases to ensure consistency with your router's configuration.

#### Asynchronous Routes and Loading States

Fluxel's router fully supports asynchronous route components, enabling powerful code splitting and lazy loading for optimized application performance.

* **Defining Asynchronous Routes**: Your route configuration can point to components that are loaded asynchronously. This is done by having the route function return a `Promise` that resolves to the actual component.

    ```tsx
    const LazyLoadedComponent = Fluxel.createComponent(() => Fluxel.div('This is a lazy-loaded component!'));

    const router = createRouter({
      '/lazy': () => import('./LazyLoadedComponent').then(m => m.LazyLoadedComponent), // Example of a promise-based route
      // ... other routes
    });
    ```

* **Smooth Transitions with `router.deferUpdate()`**:
    To prevent UI flickering or temporary empty states while an asynchronous component is loading, use `router.deferUpdate()`. This function allows you to tell the router to postpone the DOM update until a specific asynchronous operation (like fetch some data) is complete.

    ```tsx
    // Inside a component or a middleware function that might trigger an async load
    router.deferUpdate(async () => {
      // Perform your asynchronous operation here, e.g.,
      // await fetchDataForRoute();
      // await import('./MyHeavyComponent');
    });
    ```
    The router will automatically show the previous route's content (or a loading indicator if you implement one) until all deferred promises are resolved, ensuring a smooth user experience.

#### Error Handling and `useRouter` Options

* **No Router Instance Error**: Calling `useRouter()` outside of a component rendered within `router.Provider()` will result in an error.
* **Optional Router Context**: If a component needs to behave differently depending on whether it's within a router context or not, you can use the `{ optional: true }` option:
    ```tsx
    const MyComponent = Fluxel.createComponent(() => {
      const router = useRouter({ optional: true });
      if (!router) {
        return Fluxel.p('This component is not within a router context.');
      }
      // ... use router as usual
      return Fluxel.p(`Current route: ${router.pathname}`);
    });
    ```

### Server-Side Rendering (SSR) and Hydration

Fluxel supports Server-Side Rendering (SSR) and hydration.

To use server-side rendering, ensure the peer dependency, `jsdom@^29.1.0` is installed, which will be used to emulate DOM building.

```sh
npm i jsdom -D
```

This process primarily uses the following two functions:

* **renderToString**: Renders Fluxel components into an HTML string on the server side.  
* **hydrate**: Activates the HTML generated by renderToString as a Fluxel application on the client side.

#### `renderToString` Function

This function is used to render Fluxel components into an HTML string on the server side.

```tsx
// Import
import renderToString from "fluxel/ssr";

// Signature
function renderToString(
  renderer: () => Node | FluxelJSXElement,
  options?: {
    reactive?: boolean,
    metadata?: string,
    pathname?: string,
    search?: string,
    hash?: string,
  }
): { dom: string; style: string; };
```
1. **`renderer`**:
   * Type: `() => Node | FluxelJSXElement`
   * Description: A function that returns the root element of the Fluxel component you want to render.  
2. **`options.reactive` (Optional)**:
   * Type: `boolean`
   * Description: Whether the Fluxel component you want to render has reactivity or not. Hydration is not available unless `reactive` set to `true`.
3. **`options.metadata` (Optional)**:
   * Type: `string`
   * Description: This string is added as a data-fluxel-metadata attribute to the root element of the rendered HTML (e.g., div or section). It can be used to pass specific information or state during client-side hydration.
4. **`options.pathname`, `options.search`, `options.hash` (Optional)**:
   * Type: `string`
   * Description: These will be used as the location of the page while rendering. These are useful if you use the client-side router feature.
      * Don't include `?` at the beginnig of `options.search` as well `#` at the beginning of `options.hash`.

**Return Value:**

renderToString returns an object with the following properties:

* **dom**:  
  * Type: `string`  
  * Description: The HTML string of the rendered component. It can be placed within the application's root element (e.g., `<div id="app"></div>`) to generate a complete HTML page as the result of server-side rendering.  
* **style**:  
  * Type: `string`  
  * Description: A concatenated string of all CSS strings inserted by the Fluxel.forwardStyle function during SSR execution. This can be directly embedded in the HTML's &lt;head&gt; section to ensure style application on the client side.

#### `hydrate` Function

This function is used to "hydrate" (activate) an HTML element rendered on the server side as a reactive Fluxel component on the client side. This transforms static HTML into an interactive UI.

```ts
// Import
import hydrate from "fluxel/ssr/client";
// Signature
function hydrate(
  renderer: () => Node | FluxelJSXElement,
  rootElement: HTMLElement,
): void;
```
1. **renderer**:  
   * Type: `() => Node | FluxelJSXElement`  
   * Description: A function that returns the same Fluxel component root element used when generating HTML on the server side.  
2. **rootElement**:  
   * Type: `HTMLElement`  
   * Description: The root element of the HTML rendered on the server side (e.g., document.getElementById('app')). This element and its descendants will be the target of hydration.

**Return Value:**

The hydrate function returns void (nothing). Hydration is performed on the existing DOM tree and directly updates the UI.

#### Important Considerations for SSR and Hydration

* **Strict DOM Match Required**: For Fluxel's hydration to function correctly, the HTML rendered on the server must *strictly match* the DOM structure that Fluxel would initially render on the client side. If there's a mismatch, Fluxel's index-based hydration cannot proceed correctly, and the only recourse is to completely rebuild the DOM on the client.  
* **Developer Responsibility for Consistency**: It is crucial for developers to ensure that the rendering logic produces identical DOM structures on both the server and the client for the initial render.  
* **Handling Client-Specific Data (e.g., `localStorage`)**: If your application needs to display content that depends on client-specific data (e.g., data from `localStorage`, user preferences not available on the server), this can cause a mismatch. In such cases, it's recommended to:  
  1. Render the initial state on the server (or client) without this client-specific data.  
  2. After the initial render/hydration, use `Fluxel.schedule` to update the state with the client-specific data.  
  * **`Fluxel.schedule`**: This utility function essentially wraps the state update in a `setTimeout(..., 0)`, delaying the update until the next tick of the event loop, after initial hydration is complete. This ensures the initial DOM matches the server-rendered output.

#### SSR and Hydration Example

This example demonstrates a conceptual SSR flow, where the server-rendered HTML is then hydrated on the client. It shows how the code would typically be separated into different files for a real-world SSR application.

```tsx
// src/components/MyComponent.tsx  
import Fluxel from "fluxel/jsx-reactive";

export const MyComponent = Fluxel.createStatefulComponent((_, state) => {  
    // Use Fluxel.schedule to update state after hydration  
    // This ensures the initial server-rendered DOM matches,  
    // and the update happens client-side without a mismatch.  
    Fluxel.schedule(() => {  
        const clientData = localStorage.getItem("userPreference") || "Default Preference";  
        state.message = `Client data loaded: ${clientData}`;  
    });

    return (  
        <div>  
            <p>{state.use("message")}</p>  
        </div>  
    );  
}, { message: "Loading client-specific data..." }); // Initial state for SSR, will be immediately overwritten by client data

// server.ts (Conceptual Server-Side Rendering)  
// This is a simplified example. In a real server, you'd use a web framework (e.g., Express).  
import { MyComponent } from "./src/components/MyComponent"; // Import the component  
import renderToString from "fluxel/ssr";

function renderApp(): string {  
    // Render the component to a string  
    const { dom, style } = renderToString(MyComponent);

    // Construct the full HTML page  
    const html = `  
<!DOCTYPE html>  
<html>  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>Fluxel SSR Hydration Example</title>  
    <!-- Server-rendered styles -->  
    <style id="server-styles">${style}</style>  
</head>  
<body>  
    <div id="app">  
        <!-- Server-rendered DOM content -->  
        ${dom}  
    </div>  
    <!-- Client-side JavaScript will hydrate this content -->  
    <script type="module" src="/client.js"></script>  
</body>  
</html>  
`;  
    return html;  
}

// In a real server, you would send this HTML as a response to a client request.  
// console.log(renderApp());

// client.ts (This file would be bundled and served to the browser)  
import hydrate from "fluxel/ssr/client";  
import { MyComponent } from "./components/MyComponent"; // Import the component (after bundling)

document.addEventListener("DOMContentLoaded", () => {  
    const appRoot = document.getElementById("app");  
    if (appRoot) {  
        // Hydrate the server-rendered content with the Fluxel component.  
        // The hydrate function will automatically find the [data-fluxel-ssr] element  
        // within the provided rootElement.  
        hydrate(MyComponent, appRoot as HTMLElement);  
    }  
});
```

#### Technical Overview

Fluxel's SSR and hydration perform "Index-Based Hydration" for lightweight and high-performance UI.

1. **Server-Side Rendering (`renderToString` Operation)**

    `renderToString` performs the following processes when generating HTML on the server:

   * **Virtual DOM Generation**: A virtual DOM tree is generated in an environment like jsdom.  
   * **Index Assignment**: For each `document.createElement` call, a `data-fluxel-eid` attribute (sequential numbering starting from 0) is assigned to the element. This is used to efficiently identify elements during hydration.  
   * **Metadata Assignment to Root Element**: The topmost element generated by Fluxel is assigned the following attributes:  
   * `data-fluxel-ssr="true"`: Indicates that this element was rendered server-side.  
   * `data-fluxel-e-count="{total_element_count}"`: Records the total number of elements generated.  
   * `data-fluxel-metadata="{metadata_string}"`: Records the string specified in the metadata argument of `renderToString` (empty string if not specified).  
   * **`reactive` Option**: When the reactive argument of `renderToString` is set to true, the above attributes are assigned, enabling hydration. If false or omitted, plain HTML without these attributes will be generated, and the output will not be hydratable.

    **Example of Generated HTML:**

    ```html
    <div data-fluxel-eid="9" data-fluxel-ssr="true" data-fluxel-e-count="11" data-fluxel-metadata="">  
        <h1 data-fluxel-eid="4">Fluxel ToDo List</h1>  
        <hr data-fluxel-eid="0">  
        <p data-fluxel-eid="1">This is a fragment.</p>  
        <!-- ...other elements... -->  
        <ul data-fluxel-eid="8"></ul>  
    </div>
    ```

2. **Client-Side Hydration (`hydrate` Operation)**

    `hydrate` activates the existing DOM tree sent from the server.

   * **createElement Hook**: It hooks into `document.createElement` calls and does not create new elements.  
   * **Index-Based Element Retrieval**: Based on `data-fluxel-eid` (index), it directly retrieves existing DOM elements using `querySelector` within the `rootElement`.  
   * **Event Handlers Only**: Only event handlers are attached to the retrieved elements.  
   * **Attribute/Style Skipping**: Attribute and style settings/comparisons are not performed. This assumes that the server-side generated state is correct.  
   * **Reactivity Establishment**: Although attribute and style settings are skipped, internal operations to make the elements reactive are performed. This allows for reusing existing DOM while building an interactive UI.  
   * **Root Element Flexibility**: Even if rootElement does not directly have the `[data-fluxel-ssr]` attribute, hydrate automatically searches for the immediate child with the `[data-fluxel-ssr]` attribute and starts hydration.

3. **Important Development Considerations**

   * **Strict DOM Match Required**: The DOM structure of the HTML rendered on the server must **strictly match** the DOM structure that Fluxel would initially render on the client. If there is a mismatch, hydration will fail, and DOM reconstruction will be necessary.  
   * **Handling Client-Specific Data**: Displaying content that depends on client-specific data (e.g., localStorage) not available on the server can cause mismatches. It is recommended to display a state independent of such data during initial rendering, and then update the state with client-specific data using Fluxel.schedule (setTimeout(..., 0)) after hydration is complete.

## Advanced Reactivity Information

Since Fluxel prioritizes lightness and direct DOM manipulation, its behavior may sometimes appear counter-intuitive at first glance.
Additionally, there are several advanced functions available that are useful for edge cases not fully covered by its design philosophy.

### Efficient List Updates (Advanced DOM Diffing and Application)

Even without using a Virtual DOM, Fluxel employs a sophisticated "direct DOM reconciliation algorithm" for lists and dynamically changing child elements. This approach aims to minimize costly DOM operations.

**Points of Operation Principle:**

When a list of child elements (the `children` property, which is a `ReactiveDependency` whose length or order may change) needs to be updated:

* **Direct DOM Comparison**: Instead of creating and comparing a new virtual DOM tree, Fluxel directly compares the list of updated DOM nodes with the current live DOM nodes. This eliminates the overhead of a virtual DOM layer.

* **Smart Diffing Algorithm**:

    * **Optimized for Node Instance Preservation**: The algorithm efficiently identifies existing DOM node instances using strict reference equality (`===`) or `Node.isSameNode()`. This is crucial for Fluxel's reactive system, ensuring that reactive dependencies and internal states are preserved when nodes are reused or moved.

    * **Longest Common Subsequence (LCS) Based**: For complex changes, including reordering and insertions/deletions of intermediate elements, Fluxel employs a sophisticated algorithm inspired by the Longest Common Subsequence (LCS) approach. It intelligently finds the longest sequence of common, ordered nodes between the old and new lists.

    * **Minimal & Precise DOM Operations**: Based on the identified common sequence, the algorithm strategically performs only the absolutely necessary DOM operations (`appendChild`, `removeChild`, `insertBefore`). This prevents costly "clear all and re-add" strategies and minimizes browser reflows and repaints, leading to highly efficient UI updates.

    * **Fast Lookups with Maps**: To further enhance performance for larger lists, the algorithm utilizes `Map` data structures for `O(1)` average-time complexity lookups of node indices, significantly speeding up the diffing process compared to linear searches.


* **Stability through Memoization (and `isSameNode`)**:
    Fluxel's core philosophy is that DOM node instances are stable by default (because the `renderer` function is executed only once). This stability is crucial for direct DOM comparison using `Node.isSameNode()`. Furthermore, using `memo` (especially when `pure: true` is used for stable element instances, as in the ToDoApp's `li` element example) prevents unchanging child elements from being recreated even if `deriveFn` is re-executed, allowing the reconciliation algorithm to efficiently identify and preserve them in the DOM.

This "direct DOM reconciliation algorithm," combined with the library's overall philosophy of stable DOM node instances, provides highly efficient updates for dynamic lists, often outperforming virtual DOM solutions by avoiding their inherent overhead.

### `TextNode` Updates vs. `HTMLElement` Updates

This library distinguishes between updating the content of a `TextNode` (which is highly efficient as only `nodeValue` is changed) and replacing an `HTMLElement` (which requires creating a new element and replacing the old one). This practical approach ensures the efficiency of general text updates without incurring the overhead of complex element reconciliation in simple cases.

### Child Element Type Stability

Fluxel prioritizes lightness and direct DOM manipulation, and thus has specific behaviors regarding the update of reactive child elements.

When dynamically switching between different types of elements using `ReactiveDependency` within a `children` array, the type of the generated DOM node (whether it's a TextNode or an HTMLElement) is determined during the **initial rendering**. In subsequent updates, the underlying DOM node's type will not change. Furthermore, changes in the number of elements in the `children` array cannot be tracked. This is because if the `children` value is an array, Fluxel's runtime builds dependencies as a fixed-length array.

* **Switching between HTMLElements**: Dynamic switching between different `HTMLElement` types (e.g., `Fluxel.hr()` and `Fluxel.span()`) is achieved by creating a new element and **replacing** the old one.

* **`TextNode` ⇔ `HTMLElement` switching is not supported**: Dynamic switching between `TextNode` and `HTMLElement` is not supported. If you need to conditionally render text or an element, you can wrap the text in an `HTMLElement` like `Fluxel.span('text content')`.

* **Conditional Rendering of Components**: If you need to change the length of `children`, such as conditionally showing or hiding components within the `children` array, you can either make the entire dynamic `children` array reactive, or use an empty element like `Fluxel.span()` when the component is not to be displayed.

### Triggering Side Effects by Monitoring State Changes (`state.listenTarget`)

Fluxel's `state.listenTarget` (an `EventTarget` instance) provides a powerful mechanism to observe changes in your component's state properties. This allows you to manage side effects, such as data persistence to `LocalStorage`, external API integrations, or debugging, in a clean and loosely coupled manner.

Events dispatched by `state.listenTarget` provide detailed information about the change and are fully type-safe, eliminating the need for manual type assertions. The event's `detail` object (accessible as `event.detail`) contains `oldValue` and `newValue` for the state property that changed.

Events are triggered under two primary conditions:
1.  When a **top-level state property's reference is directly updated** (e.g., `state.count = 5`).
2.  When `state.render('propertyKey')` is explicitly called, typically to signal a **deep update within a nested state property** (e.g., after modifying `state.myObject.nestedProperty`).

When an event is triggered by a direct state property assignment, `event.detail.oldValue` will contain the property's previous value. However, if the event is dispatched due to `state.render('propertyKey')` (where the top-level object reference itself did not change), `event.detail.oldValue` will be `undefined`. This distinction allows you to write flexible event handlers that adapt to different update scenarios.

It's important to note that event handlers for nested property changes (triggered by `state.render('propertyKey')`) are executed *before* the corresponding DOM updates are applied. While this provides a window to make further modifications to the nested properties within the event handler, **it is generally not recommended**. Such practice can lead to complex and hard-to-debug behaviors, including potential infinite loops or unpredictable UI states.

**Example:**

```ts
// Monitor state changes and execute side effects
state.listenTarget.addEventListener('count', (event) => {
  const { oldValue, newValue } = event.detail; 
  
  if (oldValue !== undefined) {
    console.log(`Count changed directly from ${oldValue} to ${newValue}.`);
  } else {
    // This path is taken when state.render('count') is called,
    // or upon initial setup/first assignment where old value isn't tracked.
    console.log(`Count (or its nested properties) was explicitly re-rendered. Current value: ${newValue}.`);
  }
  
  // Example side effect: Save to LocalStorage
  // localStorage.setItem('myCount', String(newValue));
});

// Assuming state = { count: 0, data: { nested: { value: 0 } } } initially

// Triggering events:

// 1. Direct top-level property update
state.count = 1; 
// -> Dispatches 'count' event: { oldValue: 0, newValue: 1 } (if count was 0 initially)

// 2. Nested property update, followed by state.render()
state.data.nested.value = 10; // This alone does NOT trigger a 'data' event.
state.render('data');          // This WILL trigger a 'data' event.
                               // -> Dispatches 'data' event: { oldValue: undefined, newValue: { nested: { value: 10 } } }
                               //    (oldValue is undefined because the 'data' object reference didn't change,
                               //    only its internal content did, and state.render was used to signal this.)
```

### Expressing Reactive Elements without Components (`Fluxel.reactive`)

Normally in Fluxel, to define reactive elements, you use the `Fluxel.createStatefulComponent` function.
By using `Fluxel.reactive`, which is also an internal function, it's possible to introduce a reactive scope without creating a full component.

```ts
import Fluxel from "fluxel/reactive";

const reactiveButton = Fluxel.div({
  children: Fluxel.reactive({ count: 0 }, state => (
    Fluxel.button({
      children: state.use("count", count => `Count: ${count}`),
      onclick: () => state.count++,
      classList: ["reactive-button"]
    })
  ))
});
```

It is particularly useful when the responsibility is too small to be extracted as an independent component, or when it is intended for one-time use in a specific location. This eliminates the need to define a separate component file and allows reactive logic to be written directly near the code.

### Memoization when using `ReactiveDependency` as `Props` (`state.useWithMemo`)

`state.useWithMemo` is a special function that is generally not recommended for direct use. In typical cases, the form `state.use("key", (value, memo) => { /* ... */ })` is sufficient, and the `memo` function is used to reduce the overhead of derived functions (which are called whenever a value changes) tied to the state.

However, in the following specific scenarios, `state.useWithMemo` can be helpful in solving problems.

**Use Case:**

When a parent component passes the result of `state.use` (a `ReactiveDependency` object) as props to a child component, and within that child component, you want to perform a derivation related to the received `ReactiveDependency` and memoize its result.

In this situation, if the parent component generates the child component like `state.use("key", (value, memo) => <ChildComponent someProp={value} MemoizeFunction={memo} />)`, the entire child component will be regenerated every time the parent's state changes. This is highly inefficient and inconvenient because the child component itself doesn't necessarily need to be regenerated just because the state changed.

**Solution with `state.useWithMemo`:**

To solve this problem, `state.useWithMemo` allows you to obtain a `ReactiveDependency` and its associated `memo` function from the parent component side at once, and pass both as props to the child component.

```ts
// The simplified function signature of `state.useWithMemo`
state.useWithMemo<T, R>(
  key: keyof State, // State is the type of states of the component.
): [ReactiveDependency<T>, MemoizeFunction];
```

By passing the obtained `ReactiveDependency` and `memo` function as props to the child component, the child component can efficiently memoize its internal derived values using the received `memo` function, without being regenerated every time.

```tsx
import Fluxel, { type ReactiveDependency, type MemoizeFunction } from 'fluxel/jsx-reactive';

// Parent Component
const ParentComponent = Fluxel.createStatefulComponent((_, state) => {
  // Use state.useWithMemo to get ReactiveDependency and memo function simultaneously
  const [messageDep, MemoizeFunction] = state.useWithMemo('message');

  return (
    <div>
      <h1>Parent component</h1>
      <p>Message of parent component: {state.use('message')}</p>
      {/* Pass ReactiveDependency and MemoizeFunction to child component */}
      <ChildComponent messageDep={messageDep} MemoizeFunction={MemoizeFunction} />
      <button onclick={() => state.message = 'Updated from parent!'}>
        Update message (parent component)
      </button>
    </div>
  );
}, { message: 'Hello from parent!' });

// Child Component
// Accepts ReactiveDependency and MemoizeFunction as Props
interface ChildProps {
  messageDep: ReactiveDependency<string>;
  MemoizeFunction: MemoizeFunction;
}

const ChildComponent = Fluxel.createComponent((props: ChildProps) => {
  // Generate a memoized derived value using the received messageDep and MemoizeFunction
  const displayMessage = props.messageDep.derive((msg, memo) => {
    // By using MemoizeFunction, expensive calculations or DOM construction within this block can be memoized
    return memo(() => `Message of parent component received from parent: "${msg}"`, [msg]);
  });

  return (
    <div style={{ border: '1px solid gray', padding: '10px', marginTop: '10px' }}>
      <h2>Child component</h2>
      <p>{displayMessage}</p>
    </div>
  );
});

document.body.appendChild(Fluxel.ensureNode(<ParentComponent />));
```

**Reason for not recommending general use:**

Using `state.useWithMemo` outside of this specific use case is generally not recommended. It can lead to unexpected behavior and make code harder to understand, as the `memo` function exists independently of the reactive value.

## Type Definitions

The main exported types are as follows:

* **`ReactiveDependency<T>`**: A class representing a reactive value, enabling dependency tracking and derivation.

* **`ChildrenType<T>`**: Defines the diverse types of child elements that Fluxel elements can accept or return (strings, DOM nodes, reactive values, or arrays thereof).

* **`FluxelComponent<P, R>`**: Defines the type of Fluxel's custom components. `P` is the type of Props, and `R` is the `ChildrenType` returned by the component.

* **`FluxelJSXElement`**: A single virtual type that JSX resolves to. It hides the recursive complexity of `ChildrenType` from TypeScript's type inference, optimizing performance while maintaining type safety.

* **`StateParam<T>`**: The type of the state object passed to the renderer function of `Fluxel.createStatefulComponent`. Reactive values can be obtained and updated using the `use` method or by directly accessing properties.

## Contributions

If you have any suggestions or find some bugs, please feel free to open a new issue or a pull request.

## License

This project is licensed under MIT license.
