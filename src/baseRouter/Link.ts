import Fluxel from "../baseReactive.js";
import type { FluxelComponent, FluxelInternalOptionsFromNode } from "../type.js";
import { globalNavigate } from "./router.js";

export type LinkProps = Omit<FluxelInternalOptionsFromNode<HTMLAnchorElement>, "href"> & {
  href: string;
  replace?: boolean;
};

export const Link: FluxelComponent<LinkProps, HTMLAnchorElement> = (props?: LinkProps) => {
  if (!props || !props.href) {
    throw new Error("Link component requires a 'href' property.");
  }

  const replace = props.replace || false;
  const rest: Omit<LinkProps, "replace"> = Object.assign({}, props);
  // @ts-expect-error
  delete rest.replace;

  const href = rest.href || "#";

  const onclick: (((event: MouseEvent) => void) | null)[] = rest.onclick
    ? Array.isArray(rest.onclick)
      ? rest.onclick
      : [rest.onclick]
    : [];

  onclick.push((event: MouseEvent) => {
    event.preventDefault();

    globalNavigate(href, { replace: replace || false });
  });

  rest.onclick = onclick;

  return Fluxel.a(rest);
}
