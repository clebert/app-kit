import classnames from 'classnames';
import * as preact from 'preact';

export interface SectionProps {
  readonly children: preact.ComponentChildren;
  readonly spacing?: SectionSpacing;
}

export type SectionSpacing = 'medium' | 'large';

/**
 * https://bulma.io/documentation/layout/section/
 */
export function Section({children, spacing}: SectionProps): preact.JSX.Element {
  return (
    <section
      class={classnames({
        section: true,
        [`is-${spacing ?? 'spacing'}`]: spacing,
      })}
    >
      {children}
    </section>
  );
}
