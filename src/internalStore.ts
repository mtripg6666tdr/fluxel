export const targetListenerMap = new WeakMap<HTMLElement | Text, Set<() => void>>();

export function cleanupTargetListenerRecursive(element: HTMLElement | Text): void {
  targetListenerMap.get(element)?.forEach(cleanup => cleanup());
  targetListenerMap.delete(element);

  element.childNodes.forEach(child => cleanupTargetListenerRecursive(child as HTMLElement | Text));
}
