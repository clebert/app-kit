import * as preact from 'preact';

export interface CheckboxProps {
  readonly children: preact.ComponentChildren;
  readonly value?: string;
  readonly isChecked?: boolean;
  readonly isDisabled?: boolean;

  onChange?(event: preact.JSX.TargetedEvent<HTMLInputElement, Event>): void;
}

/**
 * https://bulma.io/documentation/form/checkbox/
 */
export function Checkbox({
  children,
  value,
  isChecked,
  isDisabled,
  onChange,
}: CheckboxProps): preact.JSX.Element {
  return (
    <label class="checkbox" disabled={isDisabled}>
      <input
        type="checkbox"
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={onChange}
      />

      {children}
    </label>
  );
}
