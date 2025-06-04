import Fluxel from ".";
import type { ChildrenType, FluxelInternalOptionsFromNode, FluxelJSXElement } from "./type";

type FragmentProps<T> = T extends Node
  ? FluxelInternalOptionsFromNode<T> & { children: T | T[] | FluxelJSXElement | FluxelJSXElement[] }
  : Record<string, any> & { children: T | T[] | FluxelJSXElement | FluxelJSXElement[] }

const Fragment = Fluxel.createComponent(
  <T>(props: FragmentProps<T>): ChildrenType => {
    const { children, ...options } = props;

    return Fluxel.fragment(
      children as any,
      options as any,
    );
  }
);

export default Fragment;
