import { JSDOM } from "jsdom";
import ensureNode from "../jsxEnsureNode.js";
import type { FluxelJSXElement } from "../type.js";
import Fluxel from "../index.js";

export default function renderToString(renderer: () => FluxelJSXElement | Node, reactive?: boolean, metadata?: string): { dom: string, style: string } {
  const jsdom = new JSDOM();
  reactive = !!reactive;

  const renderingContext = {
    createElementCount: 0,
  };

  const document = new Proxy(jsdom.window.document, {
    get(target, p) {
      if (p === "createElement"){
        return (tagName: string, props: any) => {
          const element = target.createElement(tagName, props);
          if(reactive){
            element.dataset["fluxelEid"] = (renderingContext.createElementCount++).toString();
          }
          return element;
        }
      }
      return (target as any)[p];
    }
  });

  Object.defineProperties(global, {
    Node: {
      get() {
        return jsdom.window.Node;
      },
      configurable: true,
      enumerable: false,
    },
    HTMLElement: {
      get() {
        return jsdom.window.HTMLElement;
      },
      configurable: true,
      enumerable: false,
    },
    document: {
      get() {
        return document;
      },
      configurable: true,
      enumerable: false,
    },
  });

  const fsc = Fluxel.forwardStyleCache;
  Fluxel.forwardStyleCache = [];

  function nodeToString(node: Node): string {
    if("dataset" in node && node.dataset instanceof jsdom.window.DOMStringMap) {
      node.dataset.fluxelSsr = "true";
      node.dataset.fluxelMetadata = metadata || "";

      if(reactive){
        node.dataset.fluxelECount = renderingContext.createElementCount.toString();
      }
    }
    const container = jsdom.window.document.createElement("div");
    container.appendChild(node);
    return container.innerHTML;
  }

  const node = ensureNode(renderer());
  const style = Fluxel.forwardStyleCache.join("\n");

  Object.defineProperties(global, {
    Node: {
      value: null,
      configurable: true,
      enumerable: false,
    },
    HTMLElement: {
      value: null,
      configurable: true,
      enumerable: false,
    },
    document: {
      value: null,
      configurable: true,
      enumerable: false,
    },
  });

  Fluxel.forwardStyleCache = fsc;

  return { dom: nodeToString(node), style };
}
