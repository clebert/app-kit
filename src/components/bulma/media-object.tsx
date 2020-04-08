import * as preact from 'preact';

export interface MediaObjectProps {
  readonly children: preact.ComponentChildren;
  readonly left?: preact.ComponentChildren;
  readonly right?: preact.ComponentChildren;
}

/**
 * https://bulma.io/documentation/layout/media-object/
 */
export function MediaObject({
  children,
  left,
  right,
}: MediaObjectProps): preact.JSX.Element {
  return (
    <article class="media">
      {left && <div class="media-left">{left}</div>}

      <div class="media-content" style={{'overflow-x': 'initial'}}>
        {children}
      </div>

      {right && <div class="media-right">{right}</div>}
    </article>
  );
}
