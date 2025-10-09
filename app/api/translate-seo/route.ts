import { NextRequest, NextResponse } from 'next/server'

const MAX_TITLE = 60
const MAX_DESC = 155

function clamp(s: string, max: number) {
  const t = (s || '').trim()
  if (t.length <= max) return t
  return t.slice(0, Math.max(0, max - 1)).trimEnd() + '…'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as {
      titleEs?: string
      descriptionEs?: string
      dryRun?: boolean
    }

    const apiKey = process.env.OPENAI_API_KEY || ''
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const titleEs = body.titleEs?.toString() || ''
    const descriptionEs = body.descriptionEs?.toString() || ''

    // Simple prompt for EN and PT
    const messages = [
      { role: 'system', content: 'You are a professional marketing copywriter. Return strict JSON only, no prose.' },
      { role: 'user', content: `Task: Translate the following Spanish SEO fields to English (en) and Portuguese (pt).\nRules:\n- Keep title <= ${MAX_TITLE} chars and description <= ${MAX_DESC} chars.\n- Use ellipsis only if you must trim.\n- Respond ONLY with a JSON object of the shape: { "en": { "title": string, "description": string }, "pt": { "title": string, "description": string } }\n- Do not include markdown fences or commentary.\nInput:\nTitle_es: ${titleEs}\nDescription_es: ${descriptionEs}` }
    ]

    // Use OpenAI Chat Completions API (Responses API compatible fallback via v1/chat)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' as const },
      })
    })

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '')
      return NextResponse.json({ error: 'OpenAI error', details: txt }, { status: 502 })
    }

    const data = await resp.json()
    let content: string = data?.choices?.[0]?.message?.content || ''
    // Sanitize possible markdown fences or extra text
    content = content.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')

    const tryParse = (raw: string) => {
      try {
        return JSON.parse(raw)
      } catch {
        // attempt to extract the first JSON object
        const start = raw.indexOf('{')
        const end = raw.lastIndexOf('}')
        if (start !== -1 && end !== -1 && end > start) {
          const slice = raw.slice(start, end + 1)
          return JSON.parse(slice)
        }
        throw new Error('parse-failed')
      }
    }

    let out = { en: { title: '', description: '' }, pt: { title: '', description: '' } }
    let parsed: any = null
    try {
      parsed = tryParse(content)
      out.en.title = clamp(parsed?.en?.title || '', MAX_TITLE)
      out.en.description = clamp(parsed?.en?.description || '', MAX_DESC)
      out.pt.title = clamp(parsed?.pt?.title || '', MAX_TITLE)
      out.pt.description = clamp(parsed?.pt?.description || '', MAX_DESC)
    } catch {
      // Fallback: naive split
      const lines = content.split('\n').map(s => s.trim()).filter(Boolean)
      const get = (label: string) => lines.find(l => l.toLowerCase().startsWith(label))?.split(':').slice(1).join(':').trim() || ''
      out.en.title = clamp(get('en title'), MAX_TITLE)
      out.en.description = clamp(get('en description'), MAX_DESC)
      out.pt.title = clamp(get('pt title'), MAX_TITLE)
      out.pt.description = clamp(get('pt description'), MAX_DESC)
    }

    // If model returned empty strings, retry once with a simplified instruction
    const missing = (!out.en.title && !out.en.description) && (!out.pt.title && !out.pt.description) && (titleEs || descriptionEs)
    if (missing) {
      const retry = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.1,
          response_format: { type: 'json_object' as const },
          messages: [
            { role: 'system', content: 'Return strict JSON only.' },
            { role: 'user', content: JSON.stringify({
              instruction: `Translate and truncate if needed (title ${MAX_TITLE}, description ${MAX_DESC})`,
              es: { title: titleEs, description: descriptionEs }
            }) }
          ]
        })
      })
      if (retry.ok) {
        const jd = await retry.json()
        const c2 = String(jd?.choices?.[0]?.message?.content || '')
        try {
          const p2 = tryParse(c2)
          out.en.title = clamp(p2?.en?.title || out.en.title, MAX_TITLE)
          out.en.description = clamp(p2?.en?.description || out.en.description, MAX_DESC)
          out.pt.title = clamp(p2?.pt?.title || out.pt.title, MAX_TITLE)
          out.pt.description = clamp(p2?.pt?.description || out.pt.description, MAX_DESC)
        } catch {}
      }
    }

    // Final safeguard: if still empty, copy ES so the Studio can at least fill and you can editar luego
    if (!out.en.title && titleEs) out.en.title = clamp(titleEs, MAX_TITLE)
    if (!out.en.description && descriptionEs) out.en.description = clamp(descriptionEs, MAX_DESC)
    if (!out.pt.title && titleEs) out.pt.title = clamp(titleEs, MAX_TITLE)
    if (!out.pt.description && descriptionEs) out.pt.description = clamp(descriptionEs, MAX_DESC)

    return NextResponse.json({ ok: true, result: out })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
