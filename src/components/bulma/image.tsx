import classnames from 'classnames';
import * as preact from 'preact';

export interface ImageProps {
  readonly dimension?: ImageDimension;
  readonly ratio?: ImageRatio;
  readonly src?: string;
  readonly isRounded?: boolean;
}

export type ImageDimension =
  | '16x16'
  | '24x24'
  | '32x32'
  | '48x48'
  | '64x64'
  | '96x96'
  | '128x128';

export type ImageRatio =
  | 'square'
  | '1by1'
  | '5by4'
  | '4by3'
  | '3by2'
  | '5by3'
  | '16by9'
  | '2by1'
  | '3by1'
  | '4by5'
  | '3by4'
  | '2by3'
  | '3by5'
  | '9by16'
  | '1by2'
  | '1by3';

/**
 * https://bulma.io/documentation/elements/image/
 */
export function Image({
  dimension,
  ratio,
  src,
  isRounded,
}: ImageProps): preact.JSX.Element {
  return (
    <figure
      class={classnames({
        image: true,
        [`is-${dimension ?? 'dimension'}`]: dimension,
        [`is-${ratio ?? 'ratio'}`]: ratio,
      })}
    >
      {src && <img class={classnames({'is-rounded': isRounded})} src={src} />}
    </figure>
  );
}
