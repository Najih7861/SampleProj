import { useEffect, useState } from 'react'

interface Props {
  images: string[]
  alt: string
  intervalMs?: number
}

// Auto-advancing image slideshow. Dots let the user jump to a specific photo.
export default function PlaceSlideshow({ images, alt, intervalMs = 4000 }: Props) {
  const [index, setIndex] = useState(0)
  const count = images.length
  const activeIndex = count > 0 ? index % count : 0

  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs)
    return () => clearInterval(id)
  }, [count, intervalMs])

  if (count === 0) {
    return <div className="slideshow slideshow-empty" aria-hidden />
  }

  return (
    <div className="slideshow">
      {images.map((src, i) => (
        <img
          key={`${src}-${i}`}
          src={src}
          alt={`${alt} photo ${i + 1}`}
          className={`slide ${i === activeIndex ? 'slide-active' : ''}`}
          loading="lazy"
        />
      ))}
      {count > 1 && (
        <div className="slideshow-dots">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              className={`slideshow-dot ${i === activeIndex ? 'slideshow-dot-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
