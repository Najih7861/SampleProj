import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div' | 'section'
  /** When true the card lifts on hover (use for clickable cards). */
  interactive?: boolean
  /** Wrap children in a padded body. */
  padding?: boolean
  children: ReactNode
}

export default function Card({
  as: Tag = 'article',
  interactive = false,
  padding = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const classes = ['card', interactive ? '' : 'card-static', className].filter(Boolean).join(' ')
  return (
    <Tag className={classes} {...rest}>
      {padding ? <div className="card-body">{children}</div> : children}
    </Tag>
  )
}
