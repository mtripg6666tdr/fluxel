import type { FluxelJSXElement } from "./type.js";

export default function ensureNode(child: Node | FluxelJSXElement): Node {
  if(child instanceof Node){
    return child;
  }

  throw new Error("Invalid child type, expected a Node.");
}
