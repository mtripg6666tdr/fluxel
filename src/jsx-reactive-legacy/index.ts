import BaseFluxel from "../jsx-reactive";
import { jsx, Fragment } from "../jsx-runtime";
import type { ChildrenType, FluxelComponent, FluxelJSXElement } from "../type";

const Fluxel = BaseFluxel as typeof BaseFluxel & {
  jsx: {
    createElement: <P extends object>(
      type: string | FluxelComponent<any, ChildrenType>,
      props?: P,
      ...children: any[]
    ) => FluxelJSXElement,
    Fragment: typeof Fragment,
  }
}

Fluxel.jsx = {
  createElement(type, props, ...children) {
    return jsx(type, { ...props, children: children.flat(Infinity) }, null);
  },
  Fragment,
}

export { default as Fragment } from "../jsxFragment";
export { default as ensureNode } from "../jsxEnsureNode";
export type { FluxelComponent, FluxelJSXElement, MemoizeFunction } from "../type";
export default Fluxel;

export type { JSX } from "../jsx-runtime";
