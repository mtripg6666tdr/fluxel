import type FluxelType from "../index.js";
import type { ChildrenType } from "../type.js";

export default function hFactory(Fluxel: typeof FluxelType) {
  return function h(
    type: string | ((props: any) => any),
    props: Record<string, any> | null,
    ...children: any[]
  ): ChildrenType {
    if(typeof type === "string") {
      return Fluxel.createElement(type as any, { ...props, children });
    }else{
      return type(props);
    }
  }
}
