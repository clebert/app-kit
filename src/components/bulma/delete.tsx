import classnames from 'classnames';
import * as preact from 'preact';

export interface DeleteProps {
  readonly size?: DeleteSize;

  onClick?(event: preact.JSX.TargetedEvent<HTMLElement, MouseEvent>): void;
}

export type DeleteSize = 'small' | 'medium' | 'large';

/**
 * https://bulma.io/documentation/elements/delete/
 */
export function Delete({size, onClick}: DeleteProps): preact.JSX.Element {
  return (
    <a
      class={classnames({delete: true, [`is-${size ?? 'size'}`]: size})}
      onClick={onClick}
    />
  );
}
