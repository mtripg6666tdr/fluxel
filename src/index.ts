// Importing the all HTML tag names as a string array from a generated file
import tags from "./tags__generated";

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

type CanBeArray<T> = T | T[];
type ChildrenType<T extends Node = Node> = CanBeArray<CanBeReactive<string | T>>;
type ChildrenTypeNoReactiveNodes<T extends Node = Node> = CanBeArray<string | T | ReactiveDependency<string>>;

type CanBeReactiveMap<T> = { [key in keyof T]: CanBeReactive<T[key]> };
type CanBeReactive<T> = T | ReactiveDependency<T>;

type CreateElementInternalOptions<K extends keyof HTMLElementTagNameMap> =
  CreateElementInternalOptionsFromNode<HTMLElementTagNameMap[K]>;

type CreateElementInternalOptionsFromNode<K extends Node> =
  & Omit<{ [key in NotFunctionProps<K>]?: CanBeReactive<K[key]> }, "children" | "style" | "textContent" | "className" | "classList" | "dataset">
  & { [key in Exclude<FunctionProps<K>, keyof Node>]?: key extends `on${string}`
    ? K[key] | K[key][]
    : K[key] }
  & {
    children?: ChildrenType | null | undefined,
    style?: Partial<CanBeReactiveMap<CSSStyleDeclaration>> | null | undefined,
    classList?: CanBeReactive<string | DOMTokenList | string[] | Set<string>> | CanBeReactive<string>[] | null | undefined,
    dataset?: Record<string, string | ReactiveDependency<string>> | null | undefined,
  };

function createElementInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  children?: string | (Node | string)[],
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
  options?: ChildrenType | CreateElementInternalOptions<K>
): HTMLElement {
  if (typeof tagName !== "string") {
    throw new TypeError(`Expected string for tagName, got ${typeof tagName}`);
  }

  const element = window.document.createElement(tagName);

  return applyProps(element, options);
}

function applyProps<K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  options?: ChildrenType | CreateElementInternalOptions<K>
): HTMLElement {
  let attributes: CreateElementInternalOptions<K> | null = null;
  let originalChildren: ChildrenType | null = null;
  let children: Node[] | null = null;
  let variableChildrenLength = false;
  let reactiveIndex: number[] | null = null;

  if (options) {
    if (typeof options === "string" || Array.isArray(options) || options instanceof Node || options instanceof ReactiveDependency) {
      originalChildren = options as ChildrenType<Node>;
      const childrenTransformResult = normalizeChildren(options);
      children = childrenTransformResult.children;
      variableChildrenLength = childrenTransformResult.variableChildrenLength;
      reactiveIndex = childrenTransformResult.reactiveIndex;
    } else {
      attributes = Object.assign(Object.create(null), options) as CreateElementInternalOptions<K>;

      if ("textContent" in attributes) {
        throw new TypeError("textContent is not allowed in createElement options, use children instead");
      }

      if ("children" in attributes && (attributes.children !== null && attributes.children !== undefined)) {
        originalChildren = attributes.children as ChildrenType<Node>;
        const childrenTransformResult = normalizeChildren(attributes.children);
        children = childrenTransformResult.children;
        variableChildrenLength = childrenTransformResult.variableChildrenLength;
        reactiveIndex = childrenTransformResult.reactiveIndex;
        delete attributes.children;
      }
    }
  }

  attributes = attributes || {} as CreateElementInternalOptions<K>;
  children = children || null;

  // extrct event handlers
  const eventHandlers: Map<string, Function[]> = new Map();

  for (const key in attributes) {
    if (key.startsWith("on") && attributes[key as keyof typeof attributes]) {
      const eventName = key.slice(2).toLowerCase();
      const handlers = eventHandlers.get(eventName) || [];
      eventHandlers.set(eventName, handlers);
      const fns = attributes[key as keyof typeof attributes];
      if (Array.isArray(fns)) {
        fns.forEach(fn => {
          if (typeof fn === "function") {
            handlers.push(fn);
          } else {
            throw new TypeError(`Expected function for event handler ${key}, got ${typeof fn}`);
          }
        });
      } else {
        if (typeof fns === "function") {
          handlers.push(fns);
        } else {
          throw new TypeError(`Expected function for event handler ${key}, got ${typeof fns}`);
        }
      }
      delete attributes[key as keyof typeof attributes];
    }
  }


  // extract styles
  const styles = ("style" in attributes ? attributes.style : null) as Partial<CanBeReactiveMap<CSSStyleDeclaration>> | null;
  if (styles && typeof styles === "object" && !Array.isArray(styles)) {
    for (const key in styles) {
      if (styles[key] instanceof ReactiveDependency) {
        const dep = styles[key] as ReactiveDependency<any>;
        dep.addDependency(() => {
          (element.style as any)[key] = dep.value;
        });
        styles[key] = dep.value;
      }
    }
  }
  delete attributes.style;

  // extract class names
  const classList = new Set<string>();
  const addClass = (cls: string) => {
    const trimmed = cls.trim();
    if (trimmed) classList.add(trimmed);
  };

  element.classList.forEach(cls => addClass(cls));
  if (attributes.classList) {
    const addClassList = (cls: CanBeReactive<string | DOMTokenList | string[] | Set<string>>) => {
      if (typeof cls === "string") {
        addClass(cls);
      } else if ("forEach" in cls) {
        cls.forEach(cls => addClass(cls));
      } else if (cls instanceof ReactiveDependency) {
        const dep = cls as ReactiveDependency<string | DOMTokenList | string[] | Set<string>>;
        dep.addDependency(() => {
          element.classList.forEach(cls => element.classList.remove(cls));
          classList.clear();
          addClassList(dep.value);
          classList.forEach(cls => element.classList.add(cls));
        })
        addClassList(dep.value);
      } else {
        throw new TypeError(`Expected string or iterable for 'classList', got ${typeof attributes.classList}`);
      }
    }
    const attributesClassList = attributes.classList;
    const transformedClassList = Array.isArray(attributesClassList) && attributesClassList.some(cls => cls instanceof ReactiveDependency)
      ? new ReactiveDependency<string | DOMTokenList | string[] | Set<string>>({
          get: () => attributesClassList.map(cls => cls instanceof ReactiveDependency ? cls.value : cls),
          set: () => {
            throw new TypeError("Cannot set value of classList directly");
          }
        }, dep => {
          attributesClassList.forEach(cls => cls instanceof ReactiveDependency && cls.addDependency(() => dep));
        })
      : attributes.classList as CanBeReactive<string | DOMTokenList | string[] | Set<string>>;

    addClassList(transformedClassList);

    delete attributes.classList;
  }

  if ("className" in attributes) {
    delete attributes.className;
  }

  // extract datasets
  const datasets = attributes.dataset || null as Record<string, string | ReactiveDependency<string>> | null;
  if (datasets && typeof datasets === "object" && !Array.isArray(datasets)) {
    for (const key in datasets) {
      if (datasets[key] instanceof ReactiveDependency) {
        const dep = datasets[key] as ReactiveDependency<any>;
        dep.addDependency(() => {
          element.dataset[key] = dep.value;
        });
        datasets[key] = dep.value;
      }
    }
  }
  delete (attributes as any).dataset;

  // apply extracted attributes and so on

  for (const key in attributes) {
    if (attributes[key as keyof typeof attributes] instanceof ReactiveDependency) {
      const dep = attributes[key as keyof typeof attributes] as ReactiveDependency<any>;
      dep.addDependency(() => {
        (element as any)[key] = dep.value;
      });
      (element as any)[key] = dep.value;
      delete attributes[key as keyof typeof attributes];
    }
  }

  Object.assign(element, attributes);

  if (element.style && styles) {
    Object.assign(element.style, styles);
  }

  if (element.dataset && datasets) {
    Object.assign(element.dataset, datasets);
  }

  if (classList.size > 0) {
    classList.forEach(cls => element.classList.add(cls));
  }

  if (variableChildrenLength && originalChildren) {
    (originalChildren as unknown as ReactiveDependency<ChildrenTypeNoReactiveNodes[]>).addDependency(() => {
      const currentChildren = spreadHTMLCollection(element.children);
      const newChildren = normalizeChildren(originalChildren).children;

      if(newChildren.length < currentChildren.length) {
        // removed some children
        if(newChildren.every((child, index) => currentChildren[index]?.isSameNode(child))) {
          // if the new children are the same as the first n children, we can just remove the rest
          for (let i = newChildren.length; i < currentChildren.length; i++) {
            element.removeChild(currentChildren[i]);
          }
          return;
        }else if(newChildren.every((child, index) => currentChildren[currentChildren.length - newChildren.length + index]?.isSameNode(child))) {
          // if the new children are the same as the last n children, we can just remove the rest
          for (let i = 0; i < currentChildren.length - newChildren.length; i++) {
            element.removeChild(currentChildren[i]);
          }
          return;
        }
      }else if(newChildren.length > currentChildren.length) {
        // added some children
        if(newChildren.slice(0, currentChildren.length).every((child, index) => currentChildren[index]?.isSameNode(child))) {
          // if the new children are the same as the first n children, we can just append the rest
          element.append(...newChildren.slice(currentChildren.length));
          return;
        }else if(newChildren.slice(newChildren.length - currentChildren.length).every((child, index) => currentChildren[currentChildren.length - newChildren.length + index]?.isSameNode(child))) {
          // if the new children are the same as the last n children, we can just append the rest
          element.prepend(...newChildren.slice(0, newChildren.length - currentChildren.length));
          return;
        }
      }

      // if we reach here, we need to replace all children (or append if there are no current children)
      newChildren.forEach((newChild, index) => {
        while(element.children[index] && !element.children[index].isSameNode(newChild)) {
          element.removeChild(element.children[index]);
        }
      });
      newChildren.forEach((newChild, index) => {
        if(index >= element.children.length) {
          element.appendChild(newChild);
        } else if(!element.children[index].isSameNode(newChild)) {
          element.insertBefore(newChild, element.children[index]);
        }
      });
    });
  } else if (reactiveIndex && reactiveIndex.length > 0 && originalChildren) {
    for (const index of reactiveIndex) {
      const originalChild = (
        originalChildren instanceof ReactiveDependency
          ? originalChildren
          : (originalChildren as any)[index]
      ) as ReactiveDependency<Node>;
      if (originalChild instanceof ReactiveDependency) {
        originalChild.addDependency(() => {
          const newChild = normalizeChildren(originalChild.value).children[0];
          const oldChild = element.children[index];
          if (oldChild && oldChild.isSameNode(newChild)) return;
          element.replaceChild(newChild, oldChild);
        });
        children![index] = originalChild.value;
      }
    }
  }

  if (children) {
    element.append(...children);
  }

  eventHandlers.forEach((handlers, eventName) => {
    handlers.forEach(handler => {
      element.addEventListener(eventName, handler as EventListener, { passive: true });
    });
  });

  return element;
}

function normalizeChildren(children: ChildrenType): { children: Node[], variableChildrenLength: boolean, reactiveIndex: number[] } {
  // indicates if children are fully reactive, meaning children length is variable and can change
  let variableChildrenLength = false;
  // an array of indices of children that are reactive, meaning they can change Node type but the length is fixed
  const reactiveIndex: number[] = [];

  const normalizeChildrenInternal = (children: ChildrenType, arrayDepth = 0, arrayIndex = -1): Node[] => {
    if (arrayDepth > 1) {
      throw new TypeError("Children cannot be nested more than one level deep");
    }

    if (typeof children === "string") {
      return [window.document.createTextNode(children)];
    } else if (Array.isArray(children)) {
      const result = children.flatMap((child, index) => normalizeChildrenInternal(child, arrayDepth + 1, index));
      return result;
    } else if (children instanceof Node) {
      return [children];
    } else if (children instanceof ReactiveDependency) {
      // children.value is the result of setter function, so we should evaluate it only once
      const evaluatedChildrenValue = children.value;
      if (Array.isArray(evaluatedChildrenValue)) {
        if (arrayDepth === 0) {
          variableChildrenLength = true;
        }
        return evaluatedChildrenValue.flatMap((child, index) => normalizeChildrenInternal(child, arrayDepth + 1, index));
      } else if (evaluatedChildrenValue instanceof Node) {
        if (arrayDepth === 0) {
          variableChildrenLength = true;
        }

        reactiveIndex.push(arrayIndex);

        return [evaluatedChildrenValue];
      } else {
        const textNode = window.document.createTextNode(evaluatedChildrenValue);
        children.addDependency(() => {
          textNode.textContent = String(children.value);
        });
        return [textNode];
      }
    } else {
      return [];
    }
  };

  return { children: normalizeChildrenInternal(children), variableChildrenLength, reactiveIndex };
}

createElementInternal.fragment = function <T extends Node = Node>(
  children: ChildrenType<T>,
  options: CreateElementInternalOptionsFromNode<T>,
): Node[] | ReactiveDependency<Node[]> | (Node | ReactiveDependency<Node>)[] {
  const normalizedChildrenResult = normalizeChildren(children as ChildrenType<Node>);
  const transformedChildren = normalizedChildrenResult.children;
  const variableChildrenLength = normalizedChildrenResult.variableChildrenLength;
  const reactiveIndex = normalizedChildrenResult.reactiveIndex;

  const result = transformedChildren as (Node | ReactiveDependency<Node>)[];

  result.forEach(child => {
    if (child instanceof HTMLElement) {
      applyProps(child, options);
    }
  });

  if (variableChildrenLength) {
    return (children as ReactiveDependency<ChildrenType>).derive(() => transformedChildren);
  } else if (reactiveIndex.length > 0) {
    for (const index of reactiveIndex) {
      result[index] = ((children as any)[index] as ReactiveDependency<Node>).derive(() => transformedChildren[index]);
    }
  }

  return result;
};

type StateParam<T extends object> = { [key in keyof T]: ReactiveDependency<T[key]> } & {
  render: () => void,
  use: ReactiveDependencyUse<T>,
  useWithMemo<K extends keyof T>(key: K): [ReactiveDependency<T[K]>, <MT>(factory: () => MT, deps: any[], pure?: boolean) => MT ],
};

class ReactiveDependency<T> {
  get value(): T {
    return this._accessor.get();
  }

  set value(val: T) {
    this._accessor.set(val);
  }

  constructor(private _accessor: { get: () => T, set: (val: T) => void }, public addDependency: (dep: (() => void)) => void) { }

  derive<U>(fn: (value: T) => U): ReactiveDependency<U> {
    const derivedAccessor = {
      get: () => fn(this.value),
      set: (val: U) => {
        throw new TypeError("Cannot set value of derived dependency");
      }
    };

    return new ReactiveDependency<U>(derivedAccessor, this.addDependency);
  }
}

type MemoizeFunction = <MT>(factory: () => MT, deps: any[], pure?: boolean) => MT;

interface ReactiveDependencyUse<T extends object> {
  <K extends keyof T>(key: K): ReactiveDependency<T[K]>,
  <K extends keyof T, R>(key: K, deriveFn: (v: T[K], memo?: MemoizeFunction) => R): ReactiveDependency<R>,
  <K extends (keyof T)[], R>(
    key: K,
    deriveFn: (v: { [key in K[number]]: T[key] }, memo: MemoizeFunction) => R
  ): ReactiveDependency<R>,
}

createElementInternal.reactive = function <T extends object, R extends ChildrenType>(
  initialState: T,
  renderer: (stateParam: StateParam<T>) => R,
): R {
  const stateMap = Object.create(null) as { [key in keyof T]: { dep: ReactiveDependency<T[key]>, listeners: (() => void)[] } };

  const pureState = {
    ...initialState,
    render: <K extends keyof T>(targetProperty?: K) => {
      if (targetProperty) {
        stateMap[targetProperty]?.listeners.forEach(listener => listener.call(null));
      } else {
        for (const key in stateMap) {
          stateMap[key].listeners.forEach(listener => listener.call(null));
        }
      }
    },
    use: (<K extends keyof T, R = any>(
      key: K | K[],
      deriveFn?: (v: any, memo: <MT> (factory: () => MT, deps: any[], pure?: boolean) => MT) => R
    ): ReactiveDependency<T[K]> | ReactiveDependency<R> => {
      let memoIndex = -1;
      let usedMemoCount = -1;
      const memos: { deps: any[], memoValue: any }[] = [];
      const pureMemos: Map<string, any> = new Map();
      const memoize = <MT>(factory: () => MT, deps: any[], pure = false) => {
        // If pure is true, we cache the result based on the dependencies
        if(pure){
          const key = JSON.stringify(deps);
          if (pureMemos.has(key)) {
            return pureMemos.get(key);
          }
          const value = factory();
          pureMemos.set(key, value);
          return value;
        }

        // If pure is false, we use a memoization strategy that allows for dynamic dependencies
        // we determine the corresponding memo index based on the call count
        if (memos[memoIndex]) {
          if (memos[memoIndex].deps.every((d, i) => d === deps[i])) {
            return memos[memoIndex++].memoValue;
          }
          memos[memoIndex].deps = deps;
          const newValue = memos[memoIndex].memoValue = factory();
          memoIndex++;
          return newValue;
        } else {
          memos.push({ deps, memoValue: factory() });
          return memos[memoIndex++].memoValue;
        }
      };
      const memorableDeriveFn = deriveFn ? (v: any) => {
        if(memoIndex === -1 && usedMemoCount !== -1) {
          usedMemoCount = memoIndex;
        }
        memoIndex = 0;
        const derived = deriveFn(v, memoize);
        if(usedMemoCount !== -1 && usedMemoCount !== memoIndex) {
          throw new TypeError("Memoization count mismatch, ensure memoization is used correctly");
        }
        return derived;
      } : undefined;

      if (Array.isArray(key)) {
        const entries: [K, ReactiveDependency<T[K]>][] = key.map(k => [k, pureState.use(k)]);
        return new ReactiveDependency({
          get: () => Object.fromEntries(entries.map((entry) => [entry[0], entry[1].value])),
          set: (_) => {
            throw new TypeError("Cannot set value of multiple dependencies at once");
          }
        }, (dep) => {
          let depCallPending = false;
          // Throttle the dependency calls to avoid too many updates in a single render cycle
          const throttleDep = () => {
            if (depCallPending) return;
            depCallPending = true;
            // Use setTimeout to ensure the dependent listener is called in the next event loop cycle
            window.setTimeout(() => {
              depCallPending = false;
              dep();
            }, 0);
          };
          entries.forEach((entry) => entry[1].addDependency(throttleDep));
        }).derive(memorableDeriveFn!) as ReactiveDependency<R>;
      } else {
        let dep: ReactiveDependency<T[K]> | undefined;
        if (stateMap[key as keyof typeof stateMap]) {
          dep = stateMap[key as keyof typeof stateMap].dep as unknown as ReactiveDependency<T[K]>;
        } else if (pureState[key] instanceof ReactiveDependency) {
          dep = pureState[key] as ReactiveDependency<T[K]>;
        } else {
          dep = new ReactiveDependency<T[K]>(
            {
              get: () => pureState[key],
              set: (val: any) => {
                pureState[key] = val;
              }
            },
            function addDependency(dep) {
              if (!stateMap[key].listeners.includes(dep)) {
                stateMap[key].listeners.push(dep);
              }
            }
          ) as ReactiveDependency<T[K]>;
          stateMap[key as keyof typeof stateMap] = { dep, listeners: [] } as any;
        }

        if (memorableDeriveFn) {
          return dep.derive(memorableDeriveFn) as ReactiveDependency<T[K]>;
        }

        return dep;
      }
    }) as ReactiveDependencyUse<T>,
    useWithMemo: <K extends keyof T>(key: K): [ReactiveDependency<T[K]>, MemoizeFunction] => {
      let memo: MemoizeFunction = null!;
      const dep = pureState.use(key, (v, _memo) => {
        memo = _memo!;
        return v;
      });
      dep.value; // Trigger the initial value to ensure the dependency is set up
      return [dep as ReactiveDependency<T[K]>, memo];
    }
  };

  const state: StateParam<T> = new Proxy(pureState, {
    set(target, prop, value) {
      if (prop === "render") {
        throw new TypeError("Cannot set 'render' property");
      }

      target[prop as keyof typeof target] = value;
      target.render(prop as keyof T);
      return true;
    }
  }) as StateParam<T>;

  return renderer(state);
};

function generateUniqueId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
}

function spreadHTMLCollection(collection: HTMLCollection): Element[] {
  if(typeof Array.from === "function") {
    return Array.from(collection);
  }
  const result: Element[] = [];
  for (let i = 0; i < collection.length; i++) {
    result.push(collection[i]);
  }
  return result;
}

createElementInternal.useUniqueString = function <T extends ChildrenType>(renderer: (id: string) => T): T {
  const id = generateUniqueId();
  return renderer(id);
}

createElementInternal.component = function <P extends object, S extends object, R extends ChildrenType>(
  renderer: (props: P, state: StateParam<S>) => R,
  initialState?: S | ((props: P) => S),
) {
  return (props: P = {} as P): R => {
    return createElementInternal.reactive(
      typeof initialState === "function" ? initialState(props) : (initialState || {} as S),
      state => {
        return renderer(props, state);
      }
    );
  }
}

createElementInternal.text = function (text: string): Text {
  return window.document.createTextNode(text);
}

const createElement = createElementInternal as typeof createElementInternal & {
  default: unknown,
  ReactiveDependency: typeof ReactiveDependency,
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
createElement.ReactiveDependency = ReactiveDependency;

export default createElement;
