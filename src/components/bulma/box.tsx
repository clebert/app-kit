import * as preact from 'preact';

export interface BoxProps {
  readonly children: preact.ComponentChildren;
}

/**
 * https://bulma.io/documentation/elements/box/
 */
export function Box({children}: BoxProps): preact.JSX.Element {
  return <div class="box">{children}</div>;
}
