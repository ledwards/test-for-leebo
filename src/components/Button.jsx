import './Button.css'

/**
 * Reusable Button Component
 *
 * Usage:
 *   <Button variant="primary" onClick={handleClick}>Save</Button>
 *   <Button variant="danger" size="sm">Delete</Button>
 *   <Button variant="back" onClick={goBack}>← Back</Button>
 *   <Button variant="icon">🔍</Button>
 *   <Button variant="toggle" active={isActive}>Sort</Button>
 *   <Button variant="primary" textOnly>Add All</Button>
 *
 * Props:
 *   - variant: 'primary' | 'danger' | 'back' | 'secondary' | 'discord' | 'icon' | 'toggle' | 'interactive'
 *   - size: 'sm' | 'md' | 'lg' (default: 'md')
 *   - disabled: boolean
 *   - active: boolean - for toggle variant, shows active state
 *   - textOnly: boolean - renders as text-only button (no background/border)
 *   - className: string - additional classes
 *   - children: button content
 *   - ...rest: passed to underlying button element
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  active = false,
  textOnly = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled ? 'btn--disabled' : '',
    active ? 'btn--active' : '',
    textOnly ? 'btn--text-only' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
