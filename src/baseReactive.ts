import BaseFluxel from "./index.js";
import ReactiveDependency from "./reactiveDependency.js";
import type { ChildrenType, StateParam, ReactiveDependencyUse, MemoizeFunction, FluxelComponent, TypedEventTarget, StateParamListenTargetEventType } from "./type.js";

const Fluxel = BaseFluxel as typeof BaseFluxel & {
  reactive: <T extends object, R extends ChildrenType>(
    initialState: T,
    renderer: (stateParam: StateParam<T>) => R,
  ) => R;
  schedule: (fn: () => void) => void;
};

Fluxel.reactive = function <T extends object, R extends ChildrenType>(
  initialState: T,
  renderer: (stateParam: StateParam<T>) => R,
): R {
  const stateMap = Object.create(null) as { [key in keyof T]: { dep: ReactiveDependency<T[key]>, listeners: (() => void)[] } };

  const pureState = {
    ...initialState,
    render: <K extends keyof T>(targetProperty?: K) => {
      pureState.listenTarget.dispatchEvent(new CustomEvent("render", { detail: { property: targetProperty } }) as any);
      if (targetProperty) {
        stateMap[targetProperty]?.listeners.forEach(listener => listener.call(null));
      } else {
        for (const key in stateMap) {
          stateMap[key].listeners.forEach(listener => listener.call(null));
        }
      }
    },
    use: (<K extends keyof T, R = any>(
      key: K | K[],
      deriveFn?: (v: any, memo: <MT> (factory: () => MT, deps: any[], pure?: boolean) => MT) => R
    ): ReactiveDependency<T[K]> | ReactiveDependency<R> => {
      let memoIndex = -1;
      let usedMemoCount = -1;
      const memos: { deps: any[], memoValue: any }[] = [];
      let usedPureMemos: Map<string, any> = new Map();
      let pureMemos: Map<string, any> = new Map();
      const memoize = <MT>(factory: () => MT, deps: any[], pure = false) => {
        // If pure is true, we cache the result based on the dependencies
        if(pure){
          const key = JSON.stringify(deps);
          if (pureMemos.has(key)) {
            const usedValue = pureMemos.get(key);
            usedPureMemos.set(key, usedValue);
            return usedValue;
          }
          const value = factory();
          usedPureMemos.set(key, value);
          return value;
        }

        // If pure is false, we use a memoization strategy that allows for dynamic dependencies
        // we determine the corresponding memo index based on the call count
        if (memos[memoIndex]) {
          if (memos[memoIndex].deps.every((d, i) => d === deps[i])) {
            return memos[memoIndex++].memoValue;
          }
          memos[memoIndex].deps = deps;
          const newValue = memos[memoIndex].memoValue = factory();
          memoIndex++;
          return newValue;
        } else {
          memos.push({ deps, memoValue: factory() });
          return memos[memoIndex++].memoValue;
        }
      };

      const memorableDeriveFn = deriveFn ? (v: any) => {
        if(memoIndex === -1 && usedMemoCount !== -1) {
          usedMemoCount = memoIndex;
        }
        memoIndex = 0;
        usedPureMemos = new Map();
        const derived = deriveFn(v, memoize);
        if(usedMemoCount !== -1 && usedMemoCount !== memoIndex) {
          throw new TypeError("Memoization count mismatch, ensure memoization is used correctly");
        }
        pureMemos = usedPureMemos;
        return derived;
      } : undefined;

      if (Array.isArray(key)) {
        const entries: [K, ReactiveDependency<T[K]>][] = key.map(k => [k, pureState.use(k)]);
        return new ReactiveDependency({
          get: () => Object.fromEntries(entries.map((entry) => [entry[0], entry[1].value])),
          set: (_) => {
            throw new TypeError("Cannot set value of multiple dependencies at once");
          }
        }, (dep) => {
          let depCallPending = false;
          // Throttle the dependency calls to avoid too many updates in a single render cycle
          const throttleDep = () => {
            if (depCallPending) return;
            depCallPending = true;
            // Use setTimeout to ensure the dependent listener is called in the next event loop cycle
            window.setTimeout(() => {
              depCallPending = false;
              dep();
            }, 0);
          };
          entries.forEach((entry) => entry[1].addDependency(throttleDep));
        }).derive(memorableDeriveFn!) as ReactiveDependency<R>;
      } else {
        let dep: ReactiveDependency<T[K]> | undefined;
        if (stateMap[key as keyof typeof stateMap]) {
          dep = stateMap[key as keyof typeof stateMap].dep as unknown as ReactiveDependency<T[K]>;
        } else if (pureState[key] instanceof ReactiveDependency) {
          dep = pureState[key] as ReactiveDependency<T[K]>;
        } else {
          dep = new ReactiveDependency<T[K]>(
            {
              get: () => pureState[key],
              set: (val: any) => {
                pureState[key] = val;
              }
            },
            function addDependency(dep) {
              if (!stateMap[key].listeners.includes(dep)) {
                stateMap[key].listeners.push(dep);
              }
            }
          ) as ReactiveDependency<T[K]>;
          stateMap[key as keyof typeof stateMap] = { dep, listeners: [] } as any;
        }

        if (memorableDeriveFn) {
          return dep.derive(memorableDeriveFn) as ReactiveDependency<T[K]>;
        }

        return dep;
      }
    }) as ReactiveDependencyUse<T>,
    useWithMemo: <K extends keyof T>(key: K): [ReactiveDependency<T[K]>, MemoizeFunction] => {
      let memo: MemoizeFunction = null!;
      const dep = pureState.use(key, (v, _memo) => {
        memo = _memo!;
        return v;
      });
      dep.value; // Trigger the initial value to ensure the dependency is set up
      return [dep as ReactiveDependency<T[K]>, memo];
    },
    listenTarget: new EventTarget() as TypedEventTarget<StateParamListenTargetEventType<T>>,
  };

  const state: StateParam<T> = new Proxy(pureState, {
    set(target, prop, value) {
      if (prop === "render") {
        throw new TypeError("Cannot set 'render' property");
      }

      const oldValue = target[prop as keyof typeof target];
      target[prop as keyof typeof target] = value;
      target.listenTarget.dispatchEvent(new CustomEvent(prop as string, { detail: { oldValue, newValue: value } }) as any);
      target.render(prop as keyof T);
      return true;
    }
  }) as StateParam<T>;

  return renderer(state);
};

Fluxel.schedule = function (fn: () => void): void {
  if(typeof window !== "undefined"){
    setTimeout(fn, 0);
  }
}

export default Fluxel;
