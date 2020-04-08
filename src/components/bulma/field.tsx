import classnames from 'classnames';
import * as preact from 'preact';

export interface FieldProps {
  readonly children: preact.ComponentChildren;
  readonly alignment?: FieldAlignment;
  readonly hasAddons?: boolean;
  readonly isDisabled?: boolean;
  readonly isGrouped?: boolean | 'multiline';
}

export type FieldAlignment = 'centered' | 'right';

/**
 * https://bulma.io/documentation/form/general/#form-field
 */
export function Field({
  children,
  alignment,
  hasAddons,
  isDisabled,
  isGrouped,
}: FieldProps): preact.JSX.Element {
  const fieldElement = (
    <div
      class={classnames({
        'field': true,
        'has-addons': hasAddons,
        [`has-addons-${alignment ?? 'alignment'}`]: hasAddons && alignment,
        'is-grouped': isGrouped,
        [`is-grouped-${alignment ?? 'alignment'}`]: isGrouped && alignment,
        'is-grouped-multiline': isGrouped === 'multiline',
      })}
    >
      {children}
    </div>
  );

  return isDisabled ? (
    <fieldset disabled>{fieldElement}</fieldset>
  ) : (
    fieldElement
  );
}
