export default class ReactiveDependency<T> {
  get value(): T {
    return this._accessor.get();
  }

  set value(val: T) {
    this._accessor.set(val);
  }

  constructor(private _accessor: { get: () => T, set: (val: T) => void }, public addDependency: (dep: (() => void)) => void) { }

  derive<U>(fn: (value: T) => U): ReactiveDependency<U> {
    const derivedAccessor = {
      get: () => fn(this.value),
      set: (val: U) => {
        throw new TypeError("Cannot set value of derived dependency");
      }
    };

    return new ReactiveDependency<U>(derivedAccessor, this.addDependency);
  }
}
