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
    label: busy ? 'Traduciendo…' : 'Auto-traducir',
    onHandle: async () => {
      try {
        setBusy(true)
        // Leer draft actual
        const id = props?.id
        if (!id) throw new Error('Documento sin id')
        const doc = (props as any).draft || (props as any).published || {}
        // SEO
        const titleEs = doc?.seoTitleLoc?.es || ''
        const descEs = doc?.seoDescriptionLoc?.es || ''
        const res = await fetch('/api/translate-seo', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({titleEs, descriptionEs: descEs, dryRun: true})
        })
        const json = await res.json()
        if (res.ok && json?.result) {
          const {en, pt} = json.result as any
          const patchSEO: any = {set: {}}
          if (!doc?.seoTitleLoc?.en && en?.title) patchSEO.set['seoTitleLoc.en'] = clamp(en.title, 60)
          if (!doc?.seoDescriptionLoc?.en && en?.description) patchSEO.set['seoDescriptionLoc.en'] = clamp(en.description, 155)
          if (!doc?.seoTitleLoc?.pt && pt?.title) patchSEO.set['seoTitleLoc.pt'] = clamp(pt.title, 60)
          if (!doc?.seoDescriptionLoc?.pt && pt?.description) patchSEO.set['seoDescriptionLoc.pt'] = clamp(pt.description, 155)
          if (Object.keys(patchSEO.set).length) {
            await client.patch(id).set(patchSEO.set).commit()
          }
        }

        // Content (titleLoc, short/excerpt, bodyLoc)
        const titleContentEs = doc?.titleLoc?.es || doc?.title || ''
        const shortContentEs = (doc?.shortLoc?.es || doc?.excerptLoc?.es || doc?.short || doc?.excerpt || '') as string
        const bodyBlocksEs = doc?.bodyLoc?.es || null
        const resContent = await fetch('/api/translate-content', {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ titleEs: titleContentEs, shortEs: shortContentEs, bodyEs: bodyBlocksEs })
        })
        const j2 = await resContent.json()
        if (resContent.ok && j2?.result) {
          const {en: cen, pt: cpt} = j2.result as any
          const patchC: any = {set: {}}
          if (!doc?.titleLoc?.en && cen?.title) patchC.set['titleLoc.en'] = cen.title
          if (!doc?.titleLoc?.pt && cpt?.title) patchC.set['titleLoc.pt'] = cpt.title
          if (typeof shortContentEs === 'string') {
            if (!doc?.shortLoc?.en && cen?.short) patchC.set['shortLoc.en'] = cen.short
            if (!doc?.shortLoc?.pt && cpt?.short) patchC.set['shortLoc.pt'] = cpt.short
          } else if (doc?.excerptLoc) {
            if (!doc?.excerptLoc?.en && cen?.short) patchC.set['excerptLoc.en'] = cen.short
            if (!doc?.excerptLoc?.pt && cpt?.short) patchC.set['excerptLoc.pt'] = cpt.short
          }
          if (!doc?.bodyLoc?.en && cen?.body) patchC.set['bodyLoc.en'] = cen.body
          if (!doc?.bodyLoc?.pt && cpt?.body) patchC.set['bodyLoc.pt'] = cpt.body
          if (Object.keys(patchC.set).length) {
            await client.patch(id).set(patchC.set).commit()
          }
        }
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

            // Content auto-sync
            const titleContentEs = doc?.titleLoc?.es || doc?.title || ''
            const shortContentEs = (doc?.shortLoc?.es || doc?.excerptLoc?.es || doc?.short || doc?.excerpt || '') as string
            const bodyBlocksEs = doc?.bodyLoc?.es || null
            if (titleContentEs || shortContentEs || bodyBlocksEs) {
              const rc = await fetch('/api/translate-content', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ titleEs: titleContentEs, shortEs: shortContentEs, bodyEs: bodyBlocksEs })
              })
              const jc = await rc.json()
              if (rc.ok && jc?.result) {
                const {en: cen, pt: cpt} = jc.result as any
                const patchC: any = {set: {}}
                if (!doc?.titleLoc?.en && cen?.title) patchC.set['titleLoc.en'] = cen.title
                if (!doc?.titleLoc?.pt && cpt?.title) patchC.set['titleLoc.pt'] = cpt.title
                if (typeof shortContentEs === 'string') {
                  if (!doc?.shortLoc?.en && cen?.short) patchC.set['shortLoc.en'] = cen.short
                  if (!doc?.shortLoc?.pt && cpt?.short) patchC.set['shortLoc.pt'] = cpt.short
                } else if (doc?.excerptLoc) {
                  if (!doc?.excerptLoc?.en && cen?.short) patchC.set['excerptLoc.en'] = cen.short
                  if (!doc?.excerptLoc?.pt && cpt?.short) patchC.set['excerptLoc.pt'] = cpt.short
                }
                if (!doc?.bodyLoc?.en && cen?.body) patchC.set['bodyLoc.en'] = cen.body
                if (!doc?.bodyLoc?.pt && cpt?.body) patchC.set['bodyLoc.pt'] = cpt.body
                if (Object.keys(patchC.set).length) {
                  await client.patch(props.id!).set(patchC.set).commit()
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
