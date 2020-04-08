import classnames from 'classnames';
import * as preact from 'preact';

export interface ButtonProps {
  readonly children?: preact.ComponentChildren;
  readonly type?: 'button' | 'submit' | 'reset';
  readonly color?: ButtonColor;
  readonly size?: ButtonSize;
  readonly isDisabled?: boolean;
  readonly isInverted?: boolean;
  readonly isLight?: boolean;
  readonly isLoading?: boolean;
  readonly isOutlined?: boolean;
  readonly isRounded?: boolean;
  readonly isStatic?: boolean;

  onClick?(
    event: preact.JSX.TargetedEvent<HTMLButtonElement, MouseEvent>
  ): void;
}

export type ButtonColor =
  | 'black'
  | 'dark'
  | 'white'
  | 'text'
  | 'primary'
  | 'link'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * https://bulma.io/documentation/elements/button/
 */
export function Button({
  children,
  type = 'button',
  color,
  size,
  isDisabled,
  isInverted,
  isLight,
  isLoading,
  isOutlined,
  isRounded,
  isStatic,
  onClick,
}: ButtonProps): preact.JSX.Element {
  return (
    <div class="control">
      <button
        type={type}
        class={classnames({
          'button': true,
          [`is-${color ?? 'color'}`]: color,
          [`is-${size ?? 'size'}`]: size,
          'is-inverted': isInverted,
          'is-light': isLight,
          'is-loading': isLoading,
          'is-outlined': isOutlined,
          'is-rounded': isRounded,
          'is-static': isStatic,
        })}
        disabled={isDisabled}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
}
