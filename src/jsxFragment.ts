import Fluxel from "./index.js";
import type { ChildrenType, FluxelInternalOptionsFromNode, FluxelJSXElement } from "./type.js";

type FragmentProps<T> = T extends Node
  ? FluxelInternalOptionsFromNode<T> & { children: T | T[] | FluxelJSXElement | FluxelJSXElement[] }
  : Record<string, any> & { children: T | T[] | FluxelJSXElement | FluxelJSXElement[] }

const Fragment = Fluxel.createComponent(
  <T>(props: FragmentProps<T>): ChildrenType => {
    const options = Object.assign({}, props) as Omit<FragmentProps<T>, 'children'> & { children?: FragmentProps<T>['children'] };
    const children = options.children;
    delete options.children;

    return Fluxel.fragment(
      children as any,
      options as any,
    );
  }
);

export default Fragment;
