import classnames from 'classnames';
import * as preact from 'preact';

export interface TextProps {
  readonly children?: preact.ComponentChildren;
  readonly color?: TextColor;
  readonly backgroundColor?: TextColor;
  readonly href?: string;
  readonly tabIndex?: number;
}

export type TextColor =
  | 'white'
  | 'black'
  | 'light'
  | 'dark'
  | 'primary'
  | 'info'
  | 'link'
  | 'success'
  | 'warning'
  | 'danger'
  | 'black-bis'
  | 'black-ter'
  | 'grey-darker'
  | 'grey-dark'
  | 'grey'
  | 'grey-light'
  | 'grey-lighter'
  | 'white-ter'
  | 'white-bis';

/**
 * https://bulma.io/documentation/modifiers/color-helpers/
 */
export function Text({
  children,
  color,
  backgroundColor,
  href,
  tabIndex,
}: TextProps): preact.JSX.Element {
  const className = classnames({
    [`has-text-${color ?? 'color'}`]: color,
    [`has-background-${backgroundColor ?? 'backgroundColor'}`]: backgroundColor,
  });

  return href ? (
    <a class={className} href={href} tabIndex={tabIndex}>
      {children}
    </a>
  ) : (
    <span class={className} tabIndex={tabIndex}>
      {children}
    </span>
  );
}
