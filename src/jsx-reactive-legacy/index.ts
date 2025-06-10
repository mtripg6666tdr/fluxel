import BaseFluxel from "../jsx-reactive/index.js";
import { jsx, Fragment } from "../jsx-runtime/index.js";
import type { ChildrenType, FluxelComponent, FluxelJSXElement } from "../type.js";

const Fluxel = BaseFluxel as unknown as typeof BaseFluxel & {
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
    return jsx(type, { ...props, children: children.flat(Infinity) }, null) as unknown as FluxelJSXElement;
  },
  Fragment,
}

export { default as Fragment } from "../jsxFragment.js";
export { default as ensureNode } from "../jsxEnsureNode.js";
export type { FluxelComponent, FluxelJSXElement, MemoizeFunction } from "../type.js";
export default Fluxel;

export type { JSX } from "../jsx-runtime/index.js";
