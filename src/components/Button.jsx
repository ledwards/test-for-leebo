import './Button.css'

/**
 * Reusable Button Component
 *
 * Usage:
 *   <Button variant="primary" onClick={handleClick}>Save</Button>
 *   <Button variant="danger" size="sm">Delete</Button>
 *   <Button variant="back" onClick={goBack}>← Back</Button>
 *
 * Props:
 *   - variant: 'primary' | 'danger' | 'back' | 'secondary' | 'ghost' | 'discord'
 *   - size: 'sm' | 'md' | 'lg' (default: 'md')
 *   - disabled: boolean
 *   - className: string - additional classes
 *   - children: button content
 *   - ...rest: passed to underlying button element
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    disabled ? 'btn--disabled' : '',
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
