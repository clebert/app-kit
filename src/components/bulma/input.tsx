import classnames from 'classnames';
import * as preact from 'preact';
import {forwardRef} from 'preact/compat';

export interface InputProps {
  readonly type?: InputType;
  readonly color?: InputColor;
  readonly size?: InputSize;
  readonly placeholder?: string;
  readonly value?: string;
  readonly isAutoCompleted?: boolean;
  readonly isAutoCorrected?: boolean;
  readonly isDisabled?: boolean;
  readonly isExpanded?: boolean;
  readonly isLoading?: boolean;
  readonly isReadOnly?: boolean;
  readonly isRequired?: boolean;
  readonly isRounded?: boolean;
  readonly isSpellChecked?: boolean;
  readonly isStatic?: boolean;

  onInput?(event: preact.JSX.TargetedEvent<HTMLInputElement, Event>): void;

  onKeyUp?(
    event: preact.JSX.TargetedEvent<HTMLInputElement, KeyboardEvent>
  ): void;
}

export type InputType = 'text' | 'password' | 'email' | 'tel' | 'url';
export type InputColor = 'primary' | 'info' | 'success' | 'warning' | 'danger';
export type InputSize = 'small' | 'medium' | 'large';

/**
 * https://bulma.io/documentation/form/input/
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      color,
      size,
      placeholder,
      value,
      isAutoCompleted,
      isAutoCorrected,
      isDisabled,
      isExpanded,
      isLoading,
      isReadOnly,
      isRequired,
      isRounded,
      isSpellChecked,
      isStatic,
      onInput,
      onKeyUp,
    },
    ref
  ): preact.JSX.Element => {
    return (
      <div
        class={classnames({
          'control': true,
          'is-loading': isLoading,
          [`is-${size ?? 'size'}`]: isLoading && size,
          'is-expanded': isExpanded,
        })}
      >
        <input
          ref={ref}
          class={classnames({
            'input': true,
            [`is-${color ?? 'color'}`]: color,
            [`is-${size ?? 'size'}`]: size,
            'is-rounded': isRounded,
            'is-static': isStatic,
          })}
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={isAutoCompleted ? 'on' : 'off'}
          autoCorrect={isAutoCorrected ? 'on' : 'off'}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          spellcheck={isSpellChecked}
          onInput={onInput}
          onKeyUp={onKeyUp}
        />
      </div>
    );
  }
);
