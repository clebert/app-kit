import classnames from 'classnames';
import * as preact from 'preact';

export interface ColumnProps {
  readonly children: preact.ComponentChildren;
  readonly size?: ColumnSize;
  readonly breakpointSizes?: ColumnBreakpointSizes;
  readonly isNarrow?: boolean;
}

export type ColumnSize =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';

export interface ColumnBreakpointSizes {
  readonly mobile?: ColumnSize;
  readonly tablet?: ColumnSize;
  readonly desktop?: ColumnSize;
  readonly widescreen?: ColumnSize;
  readonly fullHd?: ColumnSize;
}

/**
 * https://bulma.io/documentation/columns/
 */
export function Column({
  children,
  size,
  breakpointSizes = {},
  isNarrow,
}: ColumnProps): preact.JSX.Element {
  const {mobile, tablet, desktop, widescreen, fullHd} = breakpointSizes;

  return (
    <div
      class={classnames({
        'column': true,
        [`is-${size ?? 'size'}`]: size,
        [`is-${mobile ?? 'mobile'}-mobile`]: mobile,
        [`is-${tablet ?? 'tablet'}-tablet`]: tablet,
        [`is-${desktop ?? 'desktop'}-desktop`]: desktop,
        [`is-${widescreen ?? 'widescreen'}-widescreen`]: widescreen,
        [`is-${fullHd ?? 'fullHd'}-fullhd`]: fullHd,
        'is-narrow': isNarrow,
      })}
    >
      {children}
    </div>
  );
}
