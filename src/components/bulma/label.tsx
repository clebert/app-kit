import classnames from 'classnames';
import * as preact from 'preact';

export interface LabelProps {
  readonly children: preact.ComponentChildren;
  readonly size?: LabelSize;
}

export type LabelSize = 'small' | 'medium' | 'large';

/**
 * https://bulma.io/documentation/form/general/
 */
export function Label({children, size}: LabelProps): preact.JSX.Element {
  return (
    <label class={classnames({label: true, [`is-${size ?? 'size'}`]: size})}>
      {children}
    </label>
  );
}
