import { JSDOM } from "jsdom";
import ensureNode from "../jsxEnsureNode.js";
import type { FluxelJSXElement } from "../type.js";
import Fluxel from "../index.js";

type RenderToStringOptions = {
  reactive?: boolean,
  metadata?: string,
  pathname?: string,
  search?: string,
  hash?: string,
};

export default function renderToString(renderer: () => FluxelJSXElement | Node, options: RenderToStringOptions = {}): { dom: string, style: string } {
  const metadata = options?.metadata;
  const reactive = !!options?.reactive;
  const query = options?.search || "";
  const hash = options?.hash || "";
  const url = `http://localhost.dummy${options?.pathname || "/"}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
  const jsdom = new JSDOM("", { url });

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
      get: () => jsdom.window.Node,
      configurable: true,
      enumerable: false,
    },
    HTMLElement: {
      get: () => jsdom.window.HTMLElement,
      configurable: true,
      enumerable: false,
    },
    document: {
      get: () => document,
      configurable: true,
      enumerable: false,
    },
    location: {
      get: () => jsdom.window.location,
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
    location: {
      value: null,
      configurable: true,
      enumerable: false,
    },
  });

  Fluxel.forwardStyleCache = fsc;

  return { dom: nodeToString(node), style };
}
