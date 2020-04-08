import classnames from 'classnames';
import * as preact from 'preact';

export interface TagsProps {
  readonly children: preact.ComponentChildren;
  readonly hasAddons?: boolean;
}

/**
 * https://bulma.io/documentation/elements/tag/
 */
export function Tags({children, hasAddons}: TagsProps): preact.JSX.Element {
  return (
    <div class="control">
      <div class={classnames({'tags': true, 'has-addons': hasAddons})}>
        {children}
      </div>
    </div>
  );
}
