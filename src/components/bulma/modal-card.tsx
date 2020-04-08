import * as preact from 'preact';

export interface ModalCardProps {
  readonly children: preact.ComponentChildren;
  readonly title: preact.ComponentChildren;
  readonly header?: preact.ComponentChildren;
  readonly footer?: preact.ComponentChildren;

  onBackgroundClick?(
    event: preact.JSX.TargetedEvent<HTMLElement, MouseEvent>
  ): void;
}

/**
 * https://bulma.io/documentation/components/modal/
 */
export function ModalCard({
  children,
  title,
  header,
  footer,
  onBackgroundClick,
}: ModalCardProps): preact.JSX.Element {
  return (
    <div class="modal is-active">
      <div class="modal-background" onClick={onBackgroundClick} />

      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{title}</p>
          {header}
        </header>

        <section class="modal-card-body">{children}</section>
        <footer class="modal-card-foot">{footer}</footer>
      </div>
    </div>
  );
}
