import { Children, cloneElement, isValidElement } from 'react'
import { createPortal } from 'react-dom'

export default function AdminModal({
  children,
  zIndex = 'z-50',
  padding = 'p-4',
  backdropClassName = 'bg-ink/60',
}) {
  const panel = Children.only(children)

  if (!isValidElement(panel)) return null

  const panelClasses = panel.props.className ?? ''
  const hasFlexLayout = panelClasses.split(/\s+/).includes('flex')

  return createPortal(
    <div className={`fixed inset-0 ${zIndex} overflow-y-auto ${backdropClassName} ${padding}`}>
      <div className="grid min-h-[100dvh] place-items-center">
        {cloneElement(panel, {
          role: panel.props.role ?? 'dialog',
          'aria-modal': panel.props['aria-modal'] ?? 'true',
          className: `${panelClasses} min-h-0 max-h-[calc(100dvh-2rem)] ${hasFlexLayout ? '' : 'overflow-y-auto'}`.trim(),
        })}
      </div>
    </div>,
    document.body,
  )
}
