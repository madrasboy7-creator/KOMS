import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

interface ManagedImageProps {
  src?: string
  alt: string
  className?: string
  fallback: string
}

export function ManagedImage({ src, alt, className = '', fallback }: ManagedImageProps) {
  const [failed, setFailed] = useState(false)
  useEffect(() => { setFailed(false) }, [src])
  if (!src || failed) return <span className={`sp-image-fallback ${className}`} aria-label={alt}>{fallback}</span>
  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
}

export function ImageField({ label, value, fallback, onChange }: { label: string; value?: string; fallback: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(value)

  useEffect(() => setPreview(value), [value])

  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    onChange(localUrl)
  }

  return <div className="sp-image-field">
    <ManagedImage src={preview} alt={`${label} preview`} fallback={fallback} />
    <div><strong>{label}</strong><small>JPG, PNG or WebP · Preview only until storage is connected</small><button type="button" onClick={() => inputRef.current?.click()}><Icon name="upload" size={17} />Choose image</button></div>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectFile} />
  </div>
}
