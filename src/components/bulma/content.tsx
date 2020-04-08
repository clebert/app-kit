import classnames from 'classnames';
import * as preact from 'preact';

export interface ContentProps {
  readonly children: preact.ComponentChildren;
  readonly size?: ContentSize;
  readonly isHidden?: HiddenContentBreakpoint;
}

/**
 * https://bulma.io/documentation/modifiers/responsive-helpers/#hide
 */
export type HiddenContentBreakpoint =
  | 'mobile'
  | 'tablet-only'
  | 'desktop-only'
  | 'widescreen-only'
  | 'touch'
  | 'tablet'
  | 'desktop'
  | 'widescreen'
  | 'fullHd';

export type ContentSize = 'small' | 'medium' | 'large';

/**
 * https://bulma.io/documentation/elements/content/
 */
export function Content({
  children,
  size,
  isHidden,
}: ContentProps): preact.JSX.Element {
  return (
    <div
      class={classnames({
        content: true,
        [`is-${size ?? 'size'}`]: size,
        [`is-hidden-${isHidden?.toLowerCase() ?? 'isHidden'}`]: isHidden,
      })}
    >
      {children}
    </div>
  );
}
