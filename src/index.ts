import tags from "./tags__generated";

// type NotFunctionProps<T> = {
//   [key in keyof T]: Exclude<T[key], null | undefined> extends Function
//     ? never
//     : key extends keyof Node
//       ? never
//       : key
// }[keyof T];

type NotFunctionProps<T> = {
  [key in keyof T]: Exclude<T[key], null | undefined> extends Function
    ? never
    : key
}[keyof T];

type FunctionProps<T> = {
  [key in keyof T]: Exclude<T[key], null | undefined> extends Function
    ? key
    : never
}[keyof T];

type NarrowReturnType<T extends (...args: any[]) => any, Return> = T extends (...args: infer R) => infer OldReturn
  ? Return extends OldReturn
    ? (...args: R) => Return
    : never
  : never;

type CreateElementInternalOptions<K extends keyof HTMLElementTagNameMap> =
  & Omit<{ [key in NotFunctionProps<HTMLElementTagNameMap[K]>]?: HTMLElementTagNameMap[K][key] }, "children" | "style">
  & { [key in Exclude<FunctionProps<HTMLElementTagNameMap[K]>, keyof Node>]?: key extends `on${string}`
    ? HTMLElementTagNameMap[K][key] | HTMLElementTagNameMap[K][key][]
    : HTMLElementTagNameMap[K][key] }
  & {
      children?: string | HTMLElement[] | Node[] | null | undefined,
      style?: Partial<CSSStyleDeclaration> | null | undefined,
  };

function createElementInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  children?: string | HTMLElement[],
): HTMLElementTagNameMap[K];
function createElementInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: CreateElementInternalOptions<K>
): HTMLElementTagNameMap[K];
function createElementInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: HTMLElement,
): HTMLElementTagNameMap[K];
function createElementInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: string | HTMLElement | HTMLElement[] | CreateElementInternalOptions<K>
): HTMLElement {
  let attributes: CreateElementInternalOptions<K> | null = null;
  let children: Node[] | null = null;

  function normalizeChildren(children: string | Node | Node[]): Node[] {
    if (typeof children === "string") {
      return [window.document.createTextNode(children)];
    } else if (Array.isArray(children)) {
      return children.flatMap(child => normalizeChildren(child));
    } else if (children instanceof HTMLElement) {
      return [children];
    } else {
      return [];
    }
  }

  if(options){
    if(typeof options === "string" || Array.isArray(options) || options instanceof Node){
      children = normalizeChildren(options);
    }else{
      attributes = Object.assign({}, options) as CreateElementInternalOptions<K>;

      if (attributes.children) {
        children = normalizeChildren(attributes.children);
        delete attributes.children;
      }
    }
  }

  attributes = attributes || {} as CreateElementInternalOptions<K>;
  children = children || [];

  const eventHandlers: Map<string, Function[]> = new Map();

  for(const key in attributes){
    if(key.startsWith("on") && attributes[key as keyof typeof attributes]){
      const eventName = key.slice(2).toLowerCase();
      const handlers = eventHandlers.get(eventName) || [];
      eventHandlers.set(eventName, handlers);
      const fns = attributes[key as keyof typeof attributes];
      if(Array.isArray(fns)){
        fns.forEach(fn => {
          if(typeof fn === "function"){
            handlers.push(fn);
          }else{
            throw new TypeError(`Expected function for event handler ${key}, got ${typeof fn}`);
          }
        });
      }else{
        if(typeof fns === "function"){
          handlers.push(fns);
        }else{
          throw new TypeError(`Expected function for event handler ${key}, got ${typeof fns}`);
        }
      }
      delete attributes[key as keyof typeof attributes];
    }
  }

  const styles = ("style" in attributes ? attributes.style : null) as Partial<CSSStyleDeclaration> | null;
  delete attributes.style;

  const newElement = window.document.createElement(tagName);
  Object.assign(newElement, attributes);

  if(newElement.style && styles){
    Object.assign(newElement.style, styles);
  }

  newElement.append(...children);

  eventHandlers.forEach((handlers, eventName) => {
    handlers.forEach(handler => {
      newElement.addEventListener(eventName, handler as EventListener);
    });
  });

  return newElement;
}

interface a { a: "a", b: "b" }
type A = { [key in keyof a]: string };

const createElement = createElementInternal as typeof createElementInternal & {
  default: unknown,
} & { [key in keyof HTMLElementTagNameMap]: NarrowReturnType<
  (
    options?: string | HTMLElement | HTMLElement[] | CreateElementInternalOptions<key>
  ) => HTMLElementTagNameMap[key],
  HTMLElementTagNameMap[key]
> };

tags.forEach(tag => {
  createElement[tag] = (options?: any) => {
    return createElementInternal(tag, options) as any;
  };
});

createElement.default = createElement;
export = createElement as typeof createElement & { default: typeof createElement };
