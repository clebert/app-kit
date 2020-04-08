import classnames from 'classnames';
import * as preact from 'preact';

export interface HeroProps {
  readonly children: preact.ComponentChildren;
  readonly color?: HeroColor;
  readonly size?: HeroSize;
  readonly isBold?: boolean;
}

export type HeroColor =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'light'
  | 'dark';

export type HeroSize = 'medium' | 'large' | 'fullHeight';

/**
 * https://bulma.io/documentation/layout/hero/
 */
export function Hero({
  children,
  color,
  size,
  isBold,
}: HeroProps): preact.JSX.Element {
  return (
    <section
      class={classnames({
        'hero': true,
        [`is-${color ?? 'color'}`]: color,
        [`is-${size?.replace('fullHeight', 'fullheight') ?? 'size'}`]: size,
        'is-bold': isBold,
      })}
    >
      <div class="hero-body">{children}</div>
    </section>
  );
}
