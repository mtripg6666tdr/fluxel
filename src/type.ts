import type ReactiveDependency from "./reactiveDependency";

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

export type NarrowReturnType<T extends (...args: any[]) => any, Return> = T extends (...args: infer R) => infer OldReturn
  ? Return extends OldReturn
  ? (...args: R) => Return
  : never
  : never;

export type CanBeArray<T> = T | T[];
export type ChildrenType<T extends Node = Node> = CanBeArray<CanBeReactive<string | T>>;
export type ChildrenTypeNoReactiveNodes<T extends Node = Node> = CanBeArray<string | T | ReactiveDependency<string>>;

export type CanBeReactiveMap<T> = { [key in keyof T]: CanBeReactive<T[key]> };
export type CanBeReactive<T> = T | ReactiveDependency<T>;

export type FluxelInternalOptions<K extends keyof HTMLElementTagNameMap> =
  FluxelInternalOptionsFromNode<HTMLElementTagNameMap[K]>;

export type FluxelInternalOptionsFromNode<K extends Node> =
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

export type StateParam<T extends object> = { [key in keyof T]: ReactiveDependency<T[key]> } & {
  render: () => void,
  use: ReactiveDependencyUse<T>,
  useWithMemo<K extends keyof T>(key: K): [ReactiveDependency<T[K]>, <MT>(factory: () => MT, deps: any[], pure?: boolean) => MT ],
};

export type MemoizeFunction = <MT>(factory: () => MT, deps: any[], pure?: boolean) => MT;

export interface ReactiveDependencyUse<T extends object> {
  <K extends keyof T>(key: K): ReactiveDependency<T[K]>,
  <K extends keyof T, R>(key: K, deriveFn: (v: T[K], memo?: MemoizeFunction) => R): ReactiveDependency<R>,
  <K extends (keyof T)[], R>(
    key: K,
    deriveFn: (v: { [key in K[number]]: T[key] }, memo: MemoizeFunction) => R
  ): ReactiveDependency<R>,
}
