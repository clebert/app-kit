import classnames from 'classnames';
import * as preact from 'preact';
import {TextColor} from './text';

export interface TitleProps {
  readonly children?: preact.ComponentChildren;
  readonly color?: TextColor;
  readonly backgroundColor?: TextColor;
  readonly size?: TitleSize;
  readonly isSpaced?: boolean;
  readonly isSubtitle?: boolean;
}

export type TitleSize = '1' | '2' | '3' | '4' | '5' | '6';

/**
 * https://bulma.io/documentation/elements/title/
 */
export function Title({
  children,
  color,
  backgroundColor,
  size,
  isSpaced,
  isSubtitle,
}: TitleProps): preact.JSX.Element {
  return (
    <p
      class={classnames({
        'title': !isSubtitle,
        'subtitle': isSubtitle,
        [`has-text-${color ?? 'color'}`]: color,

        [`has-background-${
          backgroundColor ?? 'backgroundColor'
        }`]: backgroundColor,

        [`is-${size ?? 'size'}`]: size,
        'is-spaced': isSpaced,
      })}
    >
      {children}
    </p>
  );
}
