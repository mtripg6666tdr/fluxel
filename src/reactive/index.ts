import BaseFluxel from "../baseReactive.js";
import type { ChildrenType, StateParam, FluxelComponent } from "../type.js";

const Fluxel = BaseFluxel as unknown as typeof BaseFluxel & {
  createStatefulComponent: <P extends object, S extends object, R extends ChildrenType>(
    renderer: (props: P, state: StateParam<S>) => R,
    initialState?: S | ((props: P) => S),
  ) => FluxelComponent<P, R>;
};

Fluxel.createStatefulComponent = function <P extends object, S extends object, R extends ChildrenType>(
  renderer: (props: P, state: StateParam<S>) => R,
  initialState?: S | ((props: P) => S),
) {
  return (props: P = {} as P): R => {
    return Fluxel.reactive<S, R>(
      typeof initialState === "function" ? initialState(props) : (initialState || {} as S),
      state => {
        return renderer(props, state);
      }
    );
  }
}

export default Fluxel;
