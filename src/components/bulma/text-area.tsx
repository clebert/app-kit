import classnames from 'classnames';
import * as preact from 'preact';
import {forwardRef} from 'preact/compat';

export interface TextAreaProps {
  readonly color?: TextAreaColor;
  readonly size?: TextAreaSize;
  readonly rows?: number;
  readonly placeholder?: string;
  readonly value?: string;
  readonly hasFixedSize?: boolean;
  readonly isAutoCompleted?: boolean;
  readonly isAutoCorrected?: boolean;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly isReadOnly?: boolean;
  readonly isRequired?: boolean;
  readonly isSpellChecked?: boolean;
}

export type TextAreaColor =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export type TextAreaSize = 'small' | 'medium' | 'large';

/**
 * https://bulma.io/documentation/form/textarea/
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      color,
      size,
      rows,
      placeholder,
      value,
      hasFixedSize,
      isAutoCompleted,
      isAutoCorrected,
      isDisabled,
      isLoading,
      isReadOnly,
      isRequired,
      isSpellChecked,
    },
    ref
  ): preact.JSX.Element => {
    return (
      <div
        class={classnames({
          'control': true,
          'is-loading': isLoading,
          [`is-${size ?? 'size'}`]: isLoading && size,
        })}
      >
        <textarea
          ref={ref}
          class={classnames({
            'textarea': true,
            [`is-${color ?? 'color'}`]: color,
            [`is-${size ?? 'size'}`]: size,
            'has-fixed-size': hasFixedSize,
          })}
          rows={rows}
          placeholder={placeholder}
          value={value}
          autoComplete={isAutoCompleted ? 'on' : 'off'}
          autoCorrect={isAutoCorrected ? 'on' : 'off'}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          spellcheck={isSpellChecked}
        />
      </div>
    );
  }
);
