import classnames from 'classnames';
import * as preact from 'preact';

export interface DropdownProps {
  readonly children: preact.ComponentChildren;
  readonly triggerButton: preact.JSX.Element;
  readonly isActive?: boolean;
  readonly isHoverable?: boolean;
  readonly isRight?: boolean;
  readonly isUp?: boolean;
}

/**
 * https://bulma.io/documentation/components/dropdown/
 */
export function Dropdown({
  children,
  triggerButton,
  isActive,
  isHoverable,
  isRight,
  isUp,
}: DropdownProps): preact.JSX.Element {
  return (
    <div class="control">
      <div
        class={classnames({
          'dropdown': true,
          'is-active': isActive,
          'is-hoverable': isHoverable,
          'is-right': isRight,
          'is-up': isUp,
        })}
      >
        <div class="dropdown-trigger">{triggerButton}</div>

        <div class="dropdown-menu">
          <div class="dropdown-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
