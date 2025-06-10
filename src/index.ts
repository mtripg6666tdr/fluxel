import { cleanupTargetListenerRecursive } from "./internalStore.js";
import ReactiveDependency from "./reactiveDependency.js";
import tags from "./tags__generated.js";
import type { FluxelInternalOptions, ChildrenType, CanBeReactiveMap, CanBeReactive, FixedLengthChildrenType, FluxelInternalOptionsFromNode, HydrationMetadata } from "./type.js";

function getFluxelHydrationMetadata(): HydrationMetadata | null {
  if (typeof window !== "undefined" && "fluxelH" in window) {
    return window.fluxelH as HydrationMetadata;
  } else {
    return null;
  }
}

function fluxelInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: FluxelInternalOptions<K>
): HTMLElementTagNameMap[K];
function fluxelInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ChildrenType,
): HTMLElementTagNameMap[K];
function fluxelInternal<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ChildrenType | FluxelInternalOptions<K>
): HTMLElement {
  if (typeof tagName !== "string") {
    throw new TypeError(`Expected string for tagName, got ${typeof tagName}`);
  }

  const hydrationMetadata: HydrationMetadata | null = getFluxelHydrationMetadata();
  const element = hydrationMetadata
    ? hydrationMetadata.getElementByEid(`${hydrationMetadata.count++}`) as HTMLElementTagNameMap[K]
    : document.createElement(tagName);

  return applyProps(element, options);
}

function applyProps<K extends keyof HTMLElementTagNameMap>(
  element: HTMLElementTagNameMap[K],
  options?: ChildrenType | FluxelInternalOptions<K>
): HTMLElement {
  const isHydrating = !!getFluxelHydrationMetadata();
  let attributes: FluxelInternalOptions<K> | null = null;
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
      attributes = Object.assign(Object.create(null), options) as FluxelInternalOptions<K>;

      if ("textContent" in attributes) {
        throw new TypeError("textContent is not allowed");
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

  attributes = attributes || {} as FluxelInternalOptions<K>;
  children = children || null;

  // extrct event handlers
  const eventHandlers: Map<string, Function[]> = new Map();

  for (const key in attributes) {
    if (key.startsWith("on") && attributes[key as keyof typeof attributes]) {
      const eventName = key.slice(2).toLowerCase();
      const handlers = eventHandlers.get(eventName) || [];
      eventHandlers.set(eventName, handlers);
      const fns: unknown = attributes[key as keyof typeof attributes]!;
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
  const styles = Object.assign(Object.create(null), "style" in attributes ? attributes.style : null) as Partial<CanBeReactiveMap<CSSStyleDeclaration>> | null;
  if (styles && typeof styles === "object" && !Array.isArray(styles)) {
    for (const key in styles) {
      if (styles[key] instanceof ReactiveDependency) {
        const dep = styles[key] as ReactiveDependency<any>;
        dep.addDependency(element, () => {
          (element.style as any)[key] = dep.value;
        });
        styles[key] = dep.value;
      }
    }
  }
  delete attributes.style;

  // extract class names
  const classList = new Set<string>();
  const addClass = (cls: string | false | null | undefined) => {
    if(!cls) return;
    const trimmed = cls.trim();
    if (!trimmed) return;
    classList.add(trimmed);
  };

  element.classList.forEach(cls => addClass(cls));
  if (attributes.classList) {
    const addClassList = (cls: CanBeReactive<string | DOMTokenList | (string | false | null | undefined)[] | Set<string | false | null | undefined>>) => {
      if (typeof cls === "string") {
        addClass(cls);
      } else if ("forEach" in cls) {
        cls.forEach(cls => addClass(cls));
      } else if (cls instanceof ReactiveDependency) {
        const dep = cls as ReactiveDependency<string | DOMTokenList | string[] | Set<string>>;
        dep.addDependency(element, () => {
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
      ? new ReactiveDependency<string | DOMTokenList | (string | false | null | undefined)[] | Set<string | false | null | undefined>>({
          get: () => attributesClassList.map(cls => cls instanceof ReactiveDependency ? cls.value : cls),
          set: () => {
            throw new TypeError("Cannot set value of classList directly");
          }
        }, (targetObj, dep) => {
          attributesClassList.forEach(cls => cls instanceof ReactiveDependency && cls.addDependency(targetObj, () => dep));
        })
      : attributes.classList as CanBeReactive<string | DOMTokenList | (string | false | null | undefined)[] | Set<string | false | null | undefined>>;

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
        dep.addDependency(element, () => {
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
      dep.addDependency(element, () => {
        (element as any)[key] = dep.value;
      });
      if(!isHydrating){
        (element as any)[key] = dep.value;
      }
      delete attributes[key as keyof typeof attributes];
    }
  }

  if(!isHydrating){
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
  }

  if (variableChildrenLength && originalChildren) {
    (originalChildren as unknown as ReactiveDependency<FixedLengthChildrenType[]>).addDependency(element, () => {
      const currentChildren = spreadHTMLCollection(element.childNodes);
      const newChildren = normalizeChildren(originalChildren).children;
      const currentChildrenMap = arrayToMap(currentChildren);
      const newChildrenMap = arrayToMap(newChildren);

      if (currentChildren.length === newChildren.length && currentChildren.every((child, index) => child.isSameNode(newChildren[index]))) {
        return; // No changes needed
      }

      const mostEfficientFixedElementIndex = currentChildren.reduce((prev, current, index) => {
        const newChildrenAtIndex = newChildrenMap.get(current) ?? -1;
        if (newChildrenAtIndex < 0) return prev;
        let reusable = new Set<number>([index]);
        let currentPointer = index;
        for (let i = newChildrenAtIndex + 1; i < newChildren.length; i++) {
          const currentChildrenAtIndex = currentChildrenMap.get(newChildren[i]) ?? -1;
          if (currentChildrenAtIndex < currentPointer) {
            continue;
          }
          reusable.add(currentChildrenAtIndex);
          currentPointer = currentChildrenAtIndex;
        }
        if (reusable.size > prev.size) {
          return reusable;
        }
        return prev;
      }, new Set<number>());

      const deleteElements = new Set<Node>();

      if (mostEfficientFixedElementIndex.size !== currentChildren.length) {
        for (let i = currentChildren.length - 1; i >= 0; i--) {
          if (!mostEfficientFixedElementIndex.has(i)) {
            const deleteElement = currentChildren[i];
            element.removeChild(deleteElement);
            deleteElements.add(deleteElement);
          }
        }
      }

      if(element.childNodes.length === newChildren.length) return;

      newChildren.forEach((newChild, index) => {
        deleteElements.delete(newChild);
        if (!element.childNodes[index]) {
          element.appendChild(newChild);
        } else if (element.childNodes[index] !== newChild) {
          element.insertBefore(newChild, element.childNodes[index]);
        }
      });

      deleteElements.forEach(element => cleanupTargetListenerRecursive(element as HTMLElement | Text));
    });
  } else if (reactiveIndex && reactiveIndex.length > 0 && originalChildren) {
    for (const index of reactiveIndex) {
      const originalChild = (
        originalChildren instanceof ReactiveDependency
          ? originalChildren
          : (originalChildren as any)[index]
      ) as ReactiveDependency<Node>;
      if (originalChild instanceof ReactiveDependency) {
        originalChild.addDependency(element, () => {
          const newChild = normalizeChildren(originalChild.value).children[0];
          const oldChild = element.childNodes[index];
          if (oldChild === newChild) return;
          element.replaceChild(newChild, oldChild);
          cleanupTargetListenerRecursive(oldChild as HTMLElement);
        });
        children![index] = originalChild.value;
      }
    }
  }

  if (children) {
    if (isHydrating) {
      children.forEach((child, index) => {
        if(child instanceof Text) {
          element.replaceChild(child, element.childNodes[index]!);
        }
      });
    } else {
      element.append(...children);
    }
  }

  eventHandlers.forEach((handlers, eventName) => {
    handlers.forEach(handler => {
      element.addEventListener(eventName, handler as EventListener);
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
      return [document.createTextNode(children)];
    } else if (Array.isArray(children)) {
      children = children.flat(Infinity);
      const childrenLength = children.length;
      const result = children.flatMap((child, index) => normalizeChildrenInternal(child, arrayDepth + (childrenLength === 1 ? 0 : 1), index));
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
        return evaluatedChildrenValue.flat(Infinity).flatMap((child, index) => normalizeChildrenInternal(child, arrayDepth + 1, index));
      } else if (evaluatedChildrenValue instanceof Node) {
        if (arrayDepth === 0) {
          variableChildrenLength = true;
        }

        reactiveIndex.push(arrayIndex);

        return [evaluatedChildrenValue];
      } else {
        const textNode = document.createTextNode(evaluatedChildrenValue);
        children.addDependency(textNode, () => {
          textNode.textContent = String((children as ReactiveDependency<any>).value);
        });
        return [textNode];
      }
    } else {
      return [];
    }
  };

  return { children: normalizeChildrenInternal(children), variableChildrenLength, reactiveIndex };
}

fluxelInternal.fragment = function <T extends Node = Node, C extends ChildrenType<T> = ChildrenType<T>>(
  children: C,
  options: FluxelInternalOptionsFromNode<T>,
): C extends ReactiveDependency<infer _> ? ReactiveDependency<Node[]> : (Node | ReactiveDependency<Node>)[] {
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
    return (children as ReactiveDependency<ChildrenType>).derive(() => transformedChildren) as any;
  } else if (reactiveIndex.length > 0) {
    for (const index of reactiveIndex) {
      result[index] = ((children as any)[index] as ReactiveDependency<Node>).derive(() => transformedChildren[index]);
    }
  }

  return result as any;
};

function getFluxelStyleElement(): HTMLStyleElement {
  const style = document.querySelector("style[data-fluxel]") as HTMLStyleElement | null;
  if(style) return style;
  const styleElement = document.createElement("style");
  styleElement.dataset.fluxel = "true";
  document.head.appendChild(styleElement);
  return styleElement;
}

fluxelInternal.forwardStyle = function(style: string): void {
  if(getFluxelHydrationMetadata()) return;
  if(!fluxelInternal.forwardStyleCache.includes(style)) {
    fluxelInternal.forwardStyleCache.push(style);
    if (typeof window !== "undefined") {
      getFluxelStyleElement().textContent += style;
    }
  }
};
fluxelInternal.forwardStyleCache = [] as string[];

function generateUniqueId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
}

function spreadHTMLCollection(collection: HTMLCollection | NodeListOf<ChildNode>): Node[] {
  if(typeof Array.from === "function") {
    return Array.from(collection);
  }
  const result: Node[] = [];
  for (let i = 0; i < collection.length; i++) {
    result.push(collection[i]);
  }
  return result;
}

function arrayToMap<T>(array: T[]): Map<T, number> {
  const map = new Map<T, number>();
  array.forEach((item, index) => {
    map.set(item, index);
  });
  return map;
}

fluxelInternal.useUniqueString = function <T extends ChildrenType>(renderer: (id: string) => T): T {
  const id = generateUniqueId();
  return renderer(id);
}

fluxelInternal.createComponent = function <P extends object, R extends ChildrenType>(
  renderer: (props: P) => R,
) {
  return (props: P = {} as P): R => {
    return renderer(props);
  }
}

fluxelInternal.createElement = fluxelInternal;

interface TagFluxel<TAG extends keyof HTMLElementTagNameMap> {
  (options: ChildrenType): HTMLElementTagNameMap[TAG];
  (options: FluxelInternalOptions<TAG>): HTMLElementTagNameMap[TAG];
  (): HTMLElementTagNameMap[TAG];
}

const Fluxel = fluxelInternal as typeof fluxelInternal & {
  [TAG in keyof HTMLElementTagNameMap]: TagFluxel<TAG>;
};

tags.forEach(tag => {
  Fluxel[tag] = (options?: any) => {
    return fluxelInternal(tag, options) as any;
  };
});

export default Fluxel;

export { ReactiveDependency };

export type { FluxelComponent } from "./type.js";
