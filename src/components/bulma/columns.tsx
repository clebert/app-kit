import classnames from 'classnames';
import * as preact from 'preact';

export interface ColumnsProps {
  readonly children: preact.ComponentChildren;
  readonly gap?: ColumnsGap;
  readonly breakpointGaps?: ColumnsBreakpointGaps;
  readonly isCentered?: boolean;
  readonly isDesktop?: boolean;
  readonly isGapless?: boolean;
  readonly isMobile?: boolean;
  readonly isMultiline?: boolean;
  readonly isVCentered?: boolean;
  readonly isVariable?: boolean;
}

export type ColumnsGap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export interface ColumnsBreakpointGaps {
  readonly mobile?: ColumnsGap;
  readonly tablet?: ColumnsGap;
  readonly desktop?: ColumnsGap;
  readonly widescreen?: ColumnsGap;
  readonly fullHd?: ColumnsGap;
}

/**
 * https://bulma.io/documentation/columns/
 */
export function Columns({
  children,
  gap,
  breakpointGaps = {},
  isCentered,
  isDesktop,
  isGapless,
  isMobile,
  isMultiline,
  isVCentered,
  isVariable,
}: ColumnsProps): preact.JSX.Element {
  const {mobile, tablet, desktop, widescreen, fullHd} = breakpointGaps;

  return (
    <div
      class={classnames({
        'columns': true,
        [`is-${gap ?? 'gap'}`]: gap,
        [`is-${mobile ?? 'mobile'}-mobile`]: mobile,
        [`is-${tablet ?? 'tablet'}-tablet`]: tablet,
        [`is-${desktop ?? 'desktop'}-desktop`]: desktop,
        [`is-${widescreen ?? 'widescreen'}-widescreen`]: widescreen,
        [`is-${fullHd ?? 'fullHd'}-fullhd`]: fullHd,
        'is-centered': isCentered,
        'is-desktop': isDesktop,
        'is-gapless': isGapless,
        'is-mobile': isMobile,
        'is-multiline': isMultiline,
        'is-vcentered': isVCentered,
        'is-variable': isVariable,
      })}
    >
      {children}
    </div>
  );
}
