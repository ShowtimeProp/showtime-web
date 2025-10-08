"use client"
import React, {useState} from 'react'
import {useClient} from 'sanity'
import type {DocumentActionComponent, DocumentActionProps} from 'sanity'

const apiVersion = '2023-10-01'

function clamp(s: string, max: number) {
  const t = (s || '').trim()
  if (t.length <= max) return t
  return t.slice(0, Math.max(0, max - 1)).trimEnd() + '…'
}

export const AutoTranslateAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const client = useClient({apiVersion})
  const [busy, setBusy] = useState(false)

  const isSeoDoc = ['service','solution','post','project'].includes(props.type)
  if (!isSeoDoc) return null

  return {
    disabled: busy,
    label: busy ? 'Traduciendo…' : 'Auto-traducir SEO',
    onHandle: async () => {
      try {
        setBusy(true)
        // Leer draft actual
        const id = props?.id
        if (!id) throw new Error('Documento sin id')
        const doc = (props as any).draft || (props as any).published || {}
        const titleEs = doc?.seoTitleLoc?.es || ''
        const descEs = doc?.seoDescriptionLoc?.es || ''
        if (!titleEs && !descEs) {
          alert('Completa al menos SEO Title/Description en Español antes de traducir.')
          setBusy(false)
          return
        }
        const res = await fetch('/api/translate-seo', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({titleEs, descriptionEs: descEs, dryRun: true})
        })
        const json = await res.json()
        if (!res.ok || !json?.result) {
          console.error('translate error', json)
          alert('Fallo la traducción. Revisa OPENAI_API_KEY en tu deploy.')
          setBusy(false)
          return
        }
        const {en, pt} = json.result as any
        // Solo completar si vacío para no pisar edición manual
        const patch: any = {set: {}}
        if (!doc?.seoTitleLoc?.en && en?.title) patch.set['seoTitleLoc.en'] = clamp(en.title, 60)
        if (!doc?.seoDescriptionLoc?.en && en?.description) patch.set['seoDescriptionLoc.en'] = clamp(en.description, 155)
        if (!doc?.seoTitleLoc?.pt && pt?.title) patch.set['seoTitleLoc.pt'] = clamp(pt.title, 60)
        if (!doc?.seoDescriptionLoc?.pt && pt?.description) patch.set['seoDescriptionLoc.pt'] = clamp(pt.description, 155)
        if (Object.keys(patch.set).length === 0) {
          alert('EN/PT ya tienen valores. No se hicieron cambios.')
          setBusy(false)
          return
        }
        await client.patch(id).set(patch.set).commit()
      } catch (e) {
        console.error(e)
        alert('Error aplicando traducciones')
      } finally {
        setBusy(false)
      }
    }
  }
}

export const withAutoSyncPublish = (original: DocumentActionComponent): DocumentActionComponent => {
  const Comp: DocumentActionComponent = (props) => {
    const client = useClient({apiVersion})
    const isSeoDoc = ['service','solution','post','project'].includes(props.type)
    if (!isSeoDoc) return original(props)

    const doc = (props as any).draft || (props as any).published || {}
    const autoSync = !!doc?.autoSyncSeo

    return {
      ...original(props),
      label: original(props)?.label || 'Publish',
      onHandle: async () => {
        if (autoSync) {
          try {
            const titleEs = doc?.seoTitleLoc?.es || ''
            const descEs = doc?.seoDescriptionLoc?.es || ''
            if (titleEs || descEs) {
              const res = await fetch('/api/translate-seo', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({titleEs, descriptionEs: descEs, dryRun: true})
              })
              const json = await res.json()
              if (res.ok && json?.result) {
                const {en, pt} = json.result as any
                const patch: any = {set: {}}
                if (!doc?.seoTitleLoc?.en && en?.title) patch.set['seoTitleLoc.en'] = clamp(en.title, 60)
                if (!doc?.seoDescriptionLoc?.en && en?.description) patch.set['seoDescriptionLoc.en'] = clamp(en.description, 155)
                if (!doc?.seoTitleLoc?.pt && pt?.title) patch.set['seoTitleLoc.pt'] = clamp(pt.title, 60)
                if (!doc?.seoDescriptionLoc?.pt && pt?.description) patch.set['seoDescriptionLoc.pt'] = clamp(pt.description, 155)
                if (Object.keys(patch.set).length) {
                  await client.patch(props.id!).set(patch.set).commit()
                }
              }
            }
          } catch (e) {
            console.warn('Auto-sync SEO skipped:', e)
          }
        }
        // continue original publish
        await original(props)?.onHandle?.()
      }
    }
  }
  return Comp
}
