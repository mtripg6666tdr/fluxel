import { FluxelJSXElement } from "./type.js";

export default function ensureNode(child: FluxelJSXElement): Node {
  if(child instanceof Node){
    return child;
  }

  throw new Error("Invalid child type, expected a Node.");
}
