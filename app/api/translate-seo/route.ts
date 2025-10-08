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
      { role: 'system', content: 'You are a professional marketing copywriter. Translate keeping meaning, tone, and brevity for SEO. Return JSON with keys en and pt only.' },
      { role: 'user', content: `Translate the following Spanish SEO fields to English (en) and Portuguese (pt). Keep title <= ${MAX_TITLE} chars and description <= ${MAX_DESC} chars. Use ellipsis if needed.\nTitle (es): ${titleEs}\nDescription (es): ${descriptionEs}` }
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
        temperature: 0.3,
      })
    })

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '')
      return NextResponse.json({ error: 'OpenAI error', details: txt }, { status: 502 })
    }

    const data = await resp.json()
    const content: string = data?.choices?.[0]?.message?.content || ''

    let out = { en: { title: '', description: '' }, pt: { title: '', description: '' } }
    try {
      const parsed = JSON.parse(content)
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

    return NextResponse.json({ ok: true, result: out })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
