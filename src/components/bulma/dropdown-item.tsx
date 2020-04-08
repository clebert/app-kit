import classnames from 'classnames';
import * as preact from 'preact';

export interface DropdownItemProps {
  readonly children: preact.ComponentChildren;
  readonly href?: string;
  readonly isActive?: boolean;

  onClick?(event: preact.JSX.TargetedEvent<HTMLElement, MouseEvent>): void;
}

/**
 * https://bulma.io/documentation/components/dropdown/
 */
export function DropdownItem({
  children,
  href,
  isActive,
  onClick,
}: DropdownItemProps): preact.JSX.Element {
  const className = classnames({'dropdown-item': true, 'is-active': isActive});

  return href ? (
    <a class={className} href={href} onClick={onClick}>
      {children}
    </a>
  ) : (
    <div class={className} onClick={onClick}>
      {children}
    </div>
  );
}
