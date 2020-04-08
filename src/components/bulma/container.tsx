import classnames from 'classnames';
import * as preact from 'preact';

export interface ContainerProps {
  readonly children: preact.ComponentChildren;
  readonly isFluid?: boolean;
  readonly isFullHd?: boolean;
  readonly isWidescreen?: boolean;
}

/**
 * https://bulma.io/documentation/layout/container/
 */
export function Container({
  children,
  isFluid,
  isFullHd,
  isWidescreen,
}: ContainerProps): preact.JSX.Element {
  return (
    <div
      class={classnames({
        'container': true,
        'is-fluid': isFluid,
        'is-fullhd': isFullHd,
        'is-widescreen': isWidescreen,
      })}
    >
      {children}
    </div>
  );
}
