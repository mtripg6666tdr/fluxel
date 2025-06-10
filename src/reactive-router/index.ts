import BaseFluxel from "../reactive/index.js";
import { createRouter, useRouter, globalNavigate, Link  } from "../baseRouter/index.js";

const Fluxel = BaseFluxel as unknown as typeof BaseFluxel & {
  createRouter: typeof createRouter;
  useRouter: typeof useRouter;
  globalNavigate: typeof globalNavigate;
  Link: typeof Link;
};

Fluxel.createRouter = createRouter;
Fluxel.useRouter = useRouter;
Fluxel.globalNavigate = globalNavigate;
Fluxel.Link = Link;

export default Fluxel;
export * from "../baseRouter/index.js";
