import type ReactiveDependency from "./reactiveDependency.js";

export type NotFunctionProps<T> = {
  [key in keyof T]: Exclude<T[key], null | undefined> extends Function
  ? never
  : key
}[keyof T];

export type FunctionProps<T> = {
  [key in keyof T]: Exclude<T[key], null | undefined> extends Function
  ? key
  : never
}[keyof T];

export type ChildrenType<T extends Node = Node> =
  | FixedLengthChildrenType<T>
  | ReactiveDependency<string[]>
  | ReactiveDependency<T[]>
  | ReactiveDependency<(string | T)[]>;
export type FixedLengthChildrenType<T extends Node = Node> =
  | string
  | T
  | ReactiveDependency<string>
  | ReactiveDependency<T>
  | (string | T | ReactiveDependency<string> | ReactiveDependency<T>)[];

export type CanBeReactiveMap<T> = { [key in keyof T]: CanBeReactive<T[key]> };
export type CanBeReactive<T> = T | ReactiveDependency<T>;

export type FluxelInternalOptions<K extends keyof HTMLElementTagNameMap, C = ChildrenType> =
  FluxelInternalOptionsFromNode<HTMLElementTagNameMap[K], C>;

export type FluxelInternalOptionsFromNode<K extends Node, C = ChildrenType> =
  & Omit<{ [key in NotFunctionProps<K>]?: CanBeReactive<K[key]> }, "children" | "style" | "textContent" | "className" | "classList" | "dataset">
  & Omit<{ [key in Exclude<FunctionProps<K>, keyof Node>]?: key extends `on${string}`
    ? K[key] | K[key][]
    : K[key] extends Function
      ? never
      : K[key] }, "toString">
  & {
    children?: C | null | undefined,
    style?: Partial<CanBeReactiveMap<CSSStyleDeclaration>> | null | undefined,
    classList?: CanBeReactive<string | DOMTokenList | (string | false | null | undefined)[] | Set<string | false | null | undefined>> | CanBeReactive<string | false | null | undefined>[] | null | undefined,
    dataset?: Record<string, string | ReactiveDependency<string>> | null | undefined,
  };

export type StateParamListenTargetEventType<T extends object> = {
  [key in keyof T]: { oldValue: T[key], newValue: T[key] }
} & { render: { property?: keyof T } };

export type StateParam<T extends object> = T & {
  render: () => void,
  use: ReactiveDependencyUse<T>,
  useWithMemo<K extends keyof T>(key: K): [ReactiveDependency<T[K]>, <MT>(factory: () => MT, deps: any[], pure?: boolean) => MT ],
  listenTarget: TypedEventTarget<StateParamListenTargetEventType<T>>,
};

export type MemoizeFunction = <MT>(factory: () => MT, deps: any[], pure?: boolean) => MT;

export interface ReactiveDependencyUse<T extends object> {
  <K extends keyof T>(key: K): ReactiveDependency<T[K]>,
  <K extends keyof T, R>(key: K, deriveFn: (v: T[K], memo: MemoizeFunction) => R): ReactiveDependency<R>,
  <K extends (keyof T)[], R>(
    key: K,
    deriveFn: (v: { [key in K[number]]: T[key] }, memo: MemoizeFunction) => R
  ): ReactiveDependency<R>,
}

export type FluxelComponent<P extends object, R extends ChildrenType | FluxelJSXElement> = (props?: P) => R;

export declare class FluxelJSXElement {}

export type HydrationMetadata = {
  getElementByEid(eid: string): HTMLElement,
  count: number,
};

export declare class TypedEventTarget<T> {
  addEventListener<K extends keyof T>(type: K, listener: (this: TypedEventTarget<T>, ev: CustomEvent<T[K]>) => any, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof T>(type: K, listener: (this: TypedEventTarget<T>, ev: CustomEvent<T[K]>) => any, options?: boolean | EventListenerOptions): void;
  dispatchEvent<K extends keyof T>(event: CustomEvent<T[K]>): boolean;
}
