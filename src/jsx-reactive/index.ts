import BaseFluxel from "../baseReactive.js";
import type { ChildrenType, StateParam, FluxelComponent, FluxelJSXElement } from "../type.js";

const Fluxel = BaseFluxel as unknown as Omit<typeof BaseFluxel, "createComponent"> & {
  createComponent: <P extends object>(
    renderer: (props: P) => FluxelJSXElement,
  ) => FluxelComponent<P, FluxelJSXElement>;
  createStatefulComponent: <P extends object, S extends object>(
    renderer: (props: P, state: StateParam<S>) => FluxelJSXElement,
    initialState?: S | ((props: P) => S),
  ) => FluxelComponent<P, FluxelJSXElement>;
  ensureNode: (child: FluxelJSXElement) => FluxelJSXElement;
};

Fluxel.createStatefulComponent = function <P extends object, S extends object>(
  renderer: (props: P, state: StateParam<S>) => FluxelJSXElement,
  initialState?: S | ((props: P) => S),
) {
  return (props: P = {} as P): FluxelJSXElement => {
    return Fluxel.reactive(
      typeof initialState === "function" ? initialState(props) : (initialState || {} as S),
      state => {
        return renderer(props, state) as unknown as ChildrenType;
      }
    ) as unknown as FluxelJSXElement;
  }
}

export { default as Fragment } from "../jsxFragment.js";
export { default as ensureNode } from "../jsxEnsureNode.js";
export type { FluxelComponent, FluxelJSXElement, MemoizeFunction } from "../type.js";
export default Fluxel;
