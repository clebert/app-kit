import classnames from 'classnames';
import * as preact from 'preact';

export interface LevelProps {
  readonly leftItems?: preact.ComponentChild[];
  readonly rightItems?: preact.ComponentChild[];
  readonly isMobile?: boolean;
}

/**
 * https://bulma.io/documentation/layout/level/
 */
export function Level({
  leftItems,
  rightItems,
  isMobile,
}: LevelProps): preact.JSX.Element {
  return (
    <nav class={classnames({'level': true, 'is-mobile': isMobile})}>
      {leftItems && (
        <div class="level-left">
          {leftItems.map((item) => (
            <div class="level-item">{item}</div>
          ))}
        </div>
      )}

      {rightItems && (
        <div class="level-right">
          {rightItems.map((item) => (
            <div class="level-item">{item}</div>
          ))}
        </div>
      )}
    </nav>
  );
}
