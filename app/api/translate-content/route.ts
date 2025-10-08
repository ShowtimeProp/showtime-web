import { NextRequest, NextResponse } from 'next/server'

type PTSpan = { _type: 'span'; text: string; marks?: string[] }
type PTBlock = {
  _type: 'block'
  style?: string
  markDefs?: any[]
  listItem?: string
  level?: number
  children?: PTSpan[]
}

function extractTexts(blocks: any[]): { texts: string[]; paths: Array<{ bi: number; ci: number }> } {
  const texts: string[] = []
  const paths: Array<{ bi: number; ci: number }> = []
  if (!Array.isArray(blocks)) return { texts, paths }
  blocks.forEach((b, bi) => {
    if (b && b._type === 'block' && Array.isArray(b.children)) {
      b.children.forEach((c: any, ci: number) => {
        const t = (c && c._type === 'span' ? c.text : '') || ''
        if (t) {
          texts.push(t)
          paths.push({ bi, ci })
        }
      })
    }
  })
  return { texts, paths }
}

function applyTranslations(orig: any[], paths: Array<{ bi: number; ci: number }>, translated: string[]): any[] {
  const out = JSON.parse(JSON.stringify(orig || []))
  paths.forEach((p, idx) => {
    const val = translated[idx] ?? ''
    const block = out[p.bi]
    if (block && block._type === 'block' && Array.isArray(block.children) && block.children[p.ci]) {
      block.children[p.ci].text = val
    }
  })
  return out
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      titleEs?: string
      shortEs?: string
      bodyEs?: any
    }

    const apiKey = process.env.OPENAI_API_KEY || ''
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const titleEs = body.titleEs?.toString() || ''
    const shortEs = body.shortEs?.toString() || ''
    const bodyBlocks: PTBlock[] = Array.isArray(body.bodyEs) ? body.bodyEs : []
    const { texts: bodyTexts, paths } = extractTexts(bodyBlocks)

    const sys = 'You are a professional translator for marketing content. Return strict JSON. Do not add commentary.'
    const user = {
      title: titleEs,
      short: shortEs,
      body: bodyTexts,
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `Translate the following Spanish fields to English (en) and Portuguese (pt). If a field is empty, return an empty string. Return JSON of the shape: { en: { title: string, short: string, body: string[] }, pt: { title: string, short: string, body: string[] } }. The body array must have the exact same length and order as the input array.` },
          { role: 'user', content: JSON.stringify(user) },
        ],
      }),
    })

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '')
      return NextResponse.json({ error: 'OpenAI error', details: txt }, { status: 502 })
    }

    const data = await resp.json()
    const content: string = data?.choices?.[0]?.message?.content || ''

    let out = { en: { title: '', short: '', body: [] as any[] }, pt: { title: '', short: '', body: [] as any[] } }
    try {
      const parsed = JSON.parse(content)
      const enBodyTexts: string[] = Array.isArray(parsed?.en?.body) ? parsed.en.body : []
      const ptBodyTexts: string[] = Array.isArray(parsed?.pt?.body) ? parsed.pt.body : []
      out.en.title = parsed?.en?.title || ''
      out.en.short = parsed?.en?.short || ''
      out.pt.title = parsed?.pt?.title || ''
      out.pt.short = parsed?.pt?.short || ''
      out.en.body = applyTranslations(bodyBlocks, paths, enBodyTexts)
      out.pt.body = applyTranslations(bodyBlocks, paths, ptBodyTexts)
    } catch {
      // fallback: leave body empty if parsing fails
    }

    return NextResponse.json({ ok: true, result: out })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
