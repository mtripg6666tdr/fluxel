import type { FluxelJSXElement, HydrationMetadata } from "../../type.js";

export default function hydrate(renderer: () => FluxelJSXElement | Node, element: HTMLElement): void {
  if(!element){
    throw new Error("Element is not provided. Ensure you are passing a valid HTMLElement.");
  }

  if(!element.dataset.fluxelSsr) element = element.querySelector("&>[data-fluxel-ssr]") as HTMLElement;

  if(element.dataset.fluxelSsr !== "true") {
    throw new Error("Element is not a Fluxel SSR element. Ensure you are using the correct element.");
  }else if(element.dataset.fluxelHydrated === "true") {
    console.warn("Element is already hydrated. Skipping hydration.");
    return;
  }

  const maxEcount = Number(element.dataset.fluxelECount);

  if(isNaN(maxEcount)) {
    throw new Error("Essential data attribute 'data-fluxel-e-count' is missing or invalid. Ensure you are rendering the element with reactive option set to true.");
  }

  const hydrationMetadata: HydrationMetadata = {
    count: 0,
    getElementByEid: (eid: string): HTMLElement => {
      const eidStr = `${eid}`;
      if(element.dataset.fluxelEid === eidStr) {
        return element;
      }
      const el = element.querySelector(`[data-fluxel-eid="${eidStr}"]`);
      if(!el) {
        throw new Error(`Element with eid ${eid} not found. Ensure the renderer matches the SSR output.`);
      }
      return el as HTMLElement;
    }
  };

  Object.defineProperty(window, "fluxelH", { value: hydrationMetadata, configurable: true, enumerable: false });

  try{
    renderer();
  }
  catch(e){
    console.error("Error during hydration:", e);
    throw Object.assign(new Error("Hydration failed. Ensure you are using the correct renderer and element."), { cause: e});
  }

  element.dataset.fluxelHydrated = "true";

  if(hydrationMetadata.count !== maxEcount) {
    console.error(`Hydration count mismatch. Expected ${maxEcount}, but got ${hydrationMetadata.count}. Ensure you are using the correct renderer. This can happen if the renderer does not match the SSR output or if the element has been modified after SSR. Hydration process was completed, but something might be wrong.`);
  }

  // clean up
  Object.defineProperty(window, "fluxelH", { value: null, configurable: true, enumerable: false });
}
