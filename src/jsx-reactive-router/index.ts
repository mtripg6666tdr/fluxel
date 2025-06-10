import BaseFluxel from "../jsx-reactive/index.js";
import { createRouter as baseCreateRouter, useRouter as baseUseRouter, globalNavigate } from "../baseRouter/index.js";
import { Link as baseLink, type LinkProps } from "../baseRouter/Link.js";
import type { Router as BaseRouter, RouteConfig, RouterOptions, UseRouter } from "../baseRouter/router.js";
import type { FluxelComponent, FluxelJSXElement, StateParam } from "../type.js";

const Fluxel = BaseFluxel as unknown as typeof BaseFluxel & {
  createRouter: typeof createRouter;
  useRouter: typeof useRouter;
  globalNavigate: typeof globalNavigate;
  Link: typeof Link;
};

export type Router = Omit<BaseRouter, "Provider"> &{
  Provider: FluxelComponent<{ classList?: string[] }, FluxelJSXElement>,
};

const createRouter = baseCreateRouter as unknown as (config: RouteConfig, options?: RouterOptions) => Router;
const useRouter = baseUseRouter as unknown as UseRouter<Router>;
const Link = baseLink as unknown as FluxelComponent<LinkProps, FluxelJSXElement>;

Fluxel.createRouter = createRouter;
Fluxel.useRouter = useRouter;
Fluxel.globalNavigate = globalNavigate;
Fluxel.Link = Link;

export { createRouter, useRouter, globalNavigate, Link };
export default Fluxel;
