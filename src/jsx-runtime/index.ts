import Fluxel from "../reactive/index.js";
import type ReactiveDependency from "../reactiveDependency.js";
import type { ChildrenType, FluxelComponent, FluxelInternalOptions, FluxelJSXElement } from "../type.js";

function jsx(
  type: string | FluxelComponent<any, ChildrenType>,
  props: Record<string, any> | null,
  _key?: string | number | null | undefined,
): ChildrenType {
  if(props?.className){
    props.classList ??= [];
    props.classList.push(props.className.split(" ").filter(Boolean));
    delete props.className;
  }
  if(typeof type === "string") {
    return Fluxel.createElement(type as any, props as any);
  }else{
    return type(props);
  }
}

export { jsx, jsx as jsxs, jsx as jsxDEV };
export { default as Fragment } from "../jsxFragment.js";

type DefaultIntrinsicElements = { [key in keyof HTMLElementTagNameMap]: FluxelInternalOptions<
  key,
  // Constant length children type
  | string
  | Node
  | FluxelJSXElement
  | ReactiveDependency<string>
  | ReactiveDependency<Node>
  | ReactiveDependency<FluxelJSXElement>
  | (string | Node | FluxelJSXElement | ReactiveDependency<string> | ReactiveDependency<Node> | ReactiveDependency<FluxelJSXElement>)[]
  // Variable length children type
  | ReactiveDependency<string[]>
  | ReactiveDependency<Node[]>
  | ReactiveDependency<FluxelJSXElement[]>
  | ReactiveDependency<(string | Node | FluxelJSXElement)[]>
> };

export declare namespace JSX {
  interface IntrinsicElements extends DefaultIntrinsicElements {}

  type Element = FluxelJSXElement;

  interface ElementChildrenAttribute {
    children: unknown;
  }
}
