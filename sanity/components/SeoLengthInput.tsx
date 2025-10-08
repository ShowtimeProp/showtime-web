import React, { useMemo, useState, useEffect } from 'react'
import type { StringInputProps } from 'sanity'
import { PatchEvent, set } from 'sanity'

// Works for both string and text, and for localized objects by placing one per-language input.
// Reads thresholds and max from schemaType.options
// options example: { max: 60, kind: 'title' | 'description' }

function colorFor(len: number, kind: 'title' | 'description') {
  if (kind === 'title') {
    if (len >= 50 && len <= 60) return '#16a34a' // green
    if ((len >= 40 && len < 50) || (len > 60 && len <= 70)) return '#f59e0b' // orange
    return '#ef4444' // red
  }
  // description
  if (len >= 140 && len <= 155) return '#16a34a'
  if ((len >= 120 && len < 140) || (len > 155 && len <= 170)) return '#f59e0b'
  return '#ef4444'
}

export default function SeoLengthInput(props: StringInputProps) {
  const { onChange, value, schemaType, renderDefault } = props
  const max = (schemaType?.options as any)?.max ?? 60
  const kind: 'title' | 'description' = (schemaType?.options as any)?.kind ?? 'title'

  // clamp on paste/type
  const [internal, setInternal] = useState<string>(value || '')
  useEffect(() => {
    setInternal((value || '').slice(0, max))
  }, [value, max])

  const len = internal?.length || 0
  const color = useMemo(() => colorFor(len, kind), [len, kind])

  const handleChange: React.ChangeEventHandler<HTMLInputElement & HTMLTextAreaElement> = (e) => {
    const v = (e.target.value || '').slice(0, max)
    setInternal(v)
    onChange(PatchEvent.from(set(v)))
  }

  const InputTag = schemaType.type?.name === 'text' || schemaType.name === 'text' ? 'textarea' : 'input'
  const rows = kind === 'description' ? 3 : 1

  return (
    <div style={{ position: 'relative' }}>
      {renderDefault({
        ...props,
        elementProps: {
          ...(props as any).elementProps,
          onChange: handleChange,
          value: internal,
          rows,
        },
      })}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ height: 2, background: color, width: '100%', borderRadius: 1 }} />
        <div style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{len}/{max}</div>
      </div>
    </div>
  )
}
