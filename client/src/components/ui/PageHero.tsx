import type { CSSProperties, ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  description: string
  backgroundImage?: string
  actions?: ReactNode
  stats?: ReactNode
  compact?: boolean
}

export default function PageHero({
  eyebrow,
  title,
  description,
  backgroundImage,
  actions,
  stats,
  compact = false,
}: PageHeroProps) {
  const style = backgroundImage
    ? ({ '--hero-image': `url("${backgroundImage}")` } as CSSProperties)
    : undefined

  return (
    <section className={`page-hero ${compact ? 'page-hero-compact' : ''}`} style={style}>
      <div className="page-hero-media" aria-hidden />
      <div className="container page-hero-content">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
        {(actions || stats) && (
          <div className="page-hero-footer">
            {actions && <div className="page-hero-actions">{actions}</div>}
            {stats && <div className="page-hero-stats">{stats}</div>}
          </div>
        )}
      </div>
    </section>
  )
}
