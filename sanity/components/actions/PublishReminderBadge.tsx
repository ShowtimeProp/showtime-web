"use client"
import type {DocumentBadgeComponent, DocumentBadgeProps} from 'sanity'

export const PublishReminderBadge: DocumentBadgeComponent = (props: DocumentBadgeProps) => {
  // Mostrar si hay cambios en draft que no están publicados
  const hasDraft = Boolean((props as any).draft)
  if (!hasDraft) return null
  return {
    label: 'Draft',
    title: 'Tienes cambios en borrador. Recuerda Publicar para verlos en el sitio.',
    color: 'warning',
  }
}
