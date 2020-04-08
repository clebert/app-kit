import classnames from 'classnames';
import * as preact from 'preact';

export interface TagProps {
  readonly children?: preact.ComponentChildren;
  readonly color?: TagColor;
  readonly size?: TagSize;
  readonly href?: string;
  readonly isDelete?: boolean;
  readonly isLight?: boolean;
  readonly isRounded?: boolean;

  onClick?(event: preact.JSX.TargetedEvent<HTMLElement, MouseEvent>): void;
}

export type TagColor =
  | 'black'
  | 'dark'
  | 'white'
  | 'primary'
  | 'link'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export type TagSize = 'medium' | 'large';

/**
 * https://bulma.io/documentation/elements/tag/
 */
export function Tag({
  children,
  color,
  size,
  href,
  isDelete,
  isLight,
  isRounded,
  onClick,
}: TagProps): preact.JSX.Element {
  const className = classnames({
    'tag': true,
    [`is-${color ?? 'color'}`]: color,
    [`is-${size ?? 'size'}`]: size,
    'is-delete': isDelete,
    'is-light': isLight,
    'is-rounded': isRounded,
  });

  return href ? (
    <a class={className} href={href} onClick={onClick}>
      {children}
    </a>
  ) : (
    <span class={className} onClick={onClick}>
      {children}
    </span>
  );
}
