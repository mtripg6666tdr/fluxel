import Fluxel, { pureStateReservedKeys } from "../baseReactive.js";
import type ReactiveDependency from "../reactiveDependency.js";
import type { ChildrenType, FluxelComponent, FluxelJSXElement, StateParam, TypedEventTarget } from "../type.js";

export type RouteConfig = { [pattern: string]: (() => string | Node) | (() => Promise<() => string | Node>) };
export type RouterMode = "history" | "hash";
export type RouterOptions = {
  basePath?: string,
  mode?: RouterMode,
  fallback?: FluxelComponent<{}, string | Node> | FluxelComponent<{}, FluxelJSXElement>,
};
export type Router = {
  mode: RouterMode,
  basePath: string,
  pathname: string,
  route: string | null,
  params: Readonly<Record<string, string>>,
  query: Readonly<StateParam<Record<string, string>>>,
  Provider: FluxelComponent<{ classList?: string[] }, string | Node>,
  navigate(path: string, options: { replace?: boolean }): void,
  deferUpdate(process: () => Promise<void>): void,
};

export const routerEventTarget = new EventTarget() as TypedEventTarget<{
  "popstate": CustomEvent,
}>;

if(typeof window !== "undefined") {
  window.addEventListener("popstate", (event) => {
    routerEventTarget.dispatchEvent(new CustomEvent("popstate", { detail: event }));
  });
  window.addEventListener("hashchange", (event) => {
    routerEventTarget.dispatchEvent(new CustomEvent("popstate", { detail: event }));
  });
}

const defaultFallback: () => HTMLDivElement = () => Fluxel.div({ dataset: { fluxelRouterFallback: "1" } })

const routerInstanceStack: Router[] = [];

const noop = () => {};

export function createRouter(config: RouteConfig, options: RouterOptions = {}): Router {
  const basePath = options.basePath || "";
  const mode = options.mode || "history";

  const regexMap: [RegExp, string][] = [];
  Object.keys(config).forEach(pattern => {
    const regex = new RegExp(`^${
      pattern
        .replace(/\/\*?$/, "")
        .replace(/(?<cap>:[^\s/]+)\?\//g, "($<cap>\/)?")
        .replace(/:(?<name>[^\s\?/]+)/g, "(?<$<name>>[^/]+)")
    }${
      pattern.endsWith("/*") ? "(/.*)?" : "/?"
    }$`);
    regexMap.push([regex, pattern]);
  });

  const generateReactiveState = (query: Record<string, string>) => {
    // Create a independent reactive state
    // If creating a reactive state is also needed in other files, it might be better to review Fluxel.reactive function
    // and create an exclusive internal function, createReactiveState for instance
    let state: StateParam<Record<string, string>> = null!;
    Fluxel.reactive(query, (_state => {
      state = _state;
    }) as (state: StateParam<Record<string, string>>) => ChildrenType);
    return state;
  };

  let onceRendered = false;
  let deferredPromise: Promise<void>[] | null = null;

  const router: Router = {
    basePath,
    pathname: "/",
    route: null!,
    params: {},
    query: null!,
    get mode() { return mode; },
    Provider(props) {
      return Fluxel.reactive<{ children: string | Node | null }, ChildrenType>({ children: null }, state => {
        const updateChildrenInternal = (route: string | null, children: string | Node) => {
          onceRendered = true;
          if (deferredPromise) {
            // If there are deferred updates, wait for them to resolve
            Promise.all(deferredPromise).then(() => {
              // Ensure the route still matches after the deferred updates
              if (!route || router.route === route) {
                state.children = children;
              }
              deferredPromise = null;
            });
            return;
          } else {
            state.children = children;
          }
        };

        const updateChildren = () => {
          const url = new URL(location.href);
          const path = mode === "history"
            ? url.pathname.replace(basePath, "")
            : url.hash.replace(/^#/, "").replace(basePath, "");
          const searchParams = new URLSearchParams(url.search);

          router.pathname = path;

          const matched = regexMap.find(regexPattern => regexPattern[0].test(path));

          if(matched){
            const regex = matched[0];
            const route = matched[1];

            const matchGroups = regex.exec(path)!.groups || {};

            if(router.route === route && JSON.stringify(router.params) === JSON.stringify(matchGroups)) {
              // If the route and params haven't changed, no need to update

              Object.keys(router.query).filter(key => !searchParams.has(key) && !pureStateReservedKeys.includes(key as any)).forEach(key => {
                (router.query as StateParam<Record<string, string>>)[key] = undefined!;
              });

              searchParams.forEach((value, key) => {
                (router.query as StateParam<Record<string, string>>)[key] = value;
              });

              return;
            }

            router.route = route;
            router.params = matchGroups;

            const query: Record<string, string> = {};
            searchParams.forEach((value, key) => {
              query[key] = value;
            });
            router.query = generateReactiveState(query);

            routerInstanceStack.push(router);
            const children = config[route]!();
            routerInstanceStack.pop();

            if (children instanceof Promise) {
              children.then(resolvedChildren => {
                config[route] = resolvedChildren;
                // Ensure the route still matches after the Promise fulfilled
                if(router.route !== route) return

                // Render the resolved component
                routerInstanceStack.push(router);
                updateChildrenInternal(route, resolvedChildren());
                routerInstanceStack.pop();
              });

              updateChildrenInternal(route, options.fallback?.() as string | Node || defaultFallback());
            } else {
              updateChildrenInternal(route, children);
            }
          } else {
            router.route = null;
            router.params = {};

            const query: Record<string, string> = {};

            searchParams.forEach((value, key) => {
              query[key] = value;
            });

            router.query = generateReactiveState(query);

            updateChildrenInternal(null, options.fallback?.() as string | Node || defaultFallback());
          }
        };

        routerEventTarget.addEventListener("popstate", () => updateChildren());

        updateChildren();

        return Fluxel.div({
          dataset: { fluxelRouter: "1" },
          classList: props?.classList || [],
          children: state.use("children", children => children
            ? children
            : options.fallback?.() || defaultFallback()
          ) as ReactiveDependency<string> | ReactiveDependency<Node>,
        });
      }) as any;
    },
    navigate(path: string, options: { replace?: boolean } = {}) {
      if(router.mode === "hash"){
        path = `#${router.basePath}${path}`;
      }

      globalNavigate(path, options);
    },
    deferUpdate(process: () => Promise<void>) {
      if(!onceRendered){
        process().catch(noop);
      } else {
        deferredPromise = deferredPromise || [];
        deferredPromise.push(process().catch(noop));
      }
    },
  };

  return router;
}

export interface UseRouter<R = Router> {
  (option?: { optional?: false }): R;
  (option?: { optional: true }): R | null;
  (option?: { optional?: boolean }): R | null;
}

export const useRouter: UseRouter = ((option?: { optional?: boolean }): Router | null => {
  const optional = option?.optional || false;
  const result = routerInstanceStack[routerInstanceStack.length - 1];

  if(!result && !optional) {
    throw new Error("No router instance found. Make sure the component is rendered within a Router Provider.");
  }

  return result || null;
}) as UseRouter;

export function globalNavigate(path: string, options: { replace?: boolean } = {}) {
  const replace = options.replace || false;

  if (replace) {
    window.history.replaceState({}, "", path);
  } else {
    window.history.pushState({}, "", path);
  }

  routerEventTarget.dispatchEvent(new CustomEvent("popstate"));
}
