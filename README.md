# @mtripg6666tdr/create-element
A tiny, type-safe utility to create DOM elements with ease, inspired by React's `createElement` and native browser APIs. This package simplifies the creation of HTML elements by providing a fluent API for common tags and attribute handling.

---

## Features

* **Type-Safe:** Fully typed with TypeScript, providing autocompletion and compile-time checks for HTML elements and their properties.
* **Intuitive API:** Create elements using a simple function call for each HTML tag (e.g., `div()`, `span()`, `img()`).
* **Flexible Arguments:** Supports passing children directly as a string or array of `HTMLElement`s/`Node`s, or as an `options` object for attributes and children.
* **Automatic Attribute Assignment:** Assigns element attributes directly from the options object.
* **Event Listener Handling:** Easily attach single or multiple event handlers using `on` prefixed attributes (e.g., `onClick`, `onMouseOver`).
* **Style Support:** Apply inline styles using the `style` property, accepting a `Partial<CSSStyleDeclaration>`.

---

## Installation

```bash
npm install @mtripg6666tdr/create-element
# or
yarn add @mtripg6666tdr/create-element
```

---

## Usage

### Basic Element Creation

You can create an element by simply calling the tag function:

```typescript
import createElement from '@mtripg6666tdr/create-element';

const myDiv = createElement.div();
document.body.appendChild(myDiv); // <div></div>
```

### Adding Text Content

Pass a string as the first argument to add text content:

```typescript
import createElement from '@mtripg6666tdr/create-element';

const heading = createElement.h1('Hello, World!');
document.body.appendChild(heading); // <h1>Hello, World!</h1>
```

### Adding Child Elements

Pass an array of `HTMLElement`s or `Node`s as children:

```typescript
import createElement from '@mtripg6666tdr/create-element';

const item1 = createElement.li('Item 1');
const item2 = createElement.li('Item 2');
const myList = createElement.ul([item1, item2]);
document.body.appendChild(myList);
/*
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
*/
```

### Setting Attributes and Properties

Use an options object to set attributes and properties:

```typescript
import createElement from '@mtripg6666tdr/create-element';

const link = createElement.a({
  href: 'https://example.com',
  target: '_blank',
  textContent: 'Visit Example', // You can use textContent or innerText
});
document.body.appendChild(link); // <a href="https://example.com" target="_blank">Visit Example</a>
```

### Handling Events

Event handlers can be attached using `on` prefixed properties. You can also provide an array of handlers for the same event.

```typescript
import createElement from '@mtripg6666tdr/create-element';

function handleClick() {
  console.log('Button clicked!');
}

function handleAnotherClick() {
  alert('Another click!');
}

const button = createElement.button({
  textContent: 'Click Me!',
  onClick: [handleClick, handleAnotherClick], // Pass an array of handlers
  onMouseOver: () => console.log('Mouse over button'),
});
document.body.appendChild(button);
```

### Applying Styles

Use the `style` property for inline CSS:

```typescript
import createElement from '@mtripg6666tdr/create-element';

const styledDiv = createElement.div({
  textContent: 'I am a styled div.',
  style: {
    backgroundColor: 'lightblue',
    padding: '10px',
    borderRadius: '5px',
  },
});
document.body.appendChild(styledDiv);
```

### Combining Children and Options

You can specify children within the options object as well:

```typescript
import createElement from '@mtripg6666tdr/create-element';

const nestedDiv = createElement.div({
  className: 'container',
  style: { border: '1px solid black' },
  children: [
    createElement.h2('Nested Content'),
    createElement.p('This is some text inside the container.'),
    createElement.button({ textContent: 'Action' }),
  ],
});
document.body.appendChild(nestedDiv);
```

### Using the generic `createElement` function

While `createElement.<tag>` functions are convenient, you can also use the main `createElement` function for dynamic tag names or if you prefer:

```typescript
import createElement from '@mtripg6666tdr/create-element';

const dynamicTag = 'article';
const articleElement = createElement(dynamicTag, {
  children: createElement.p('This is an article.'),
});
document.body.appendChild(articleElement);
```

---

## Contributing

Feel free to open issues or pull requests on the GitHub repository if you have suggestions or find bugs.

---

## License

This project is licensed under the MIT License.
