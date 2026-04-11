import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileUrl, assignmentTitle, instructions, maxMarks } = await req.json()
    const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')

    if (!ANTHROPIC_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Fetch PDF from storage
    const pdfRes = await fetch(fileUrl)
    if (!pdfRes.ok) {
      return new Response(JSON.stringify({ error: 'Could not fetch PDF' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }
    const pdfBuffer = await pdfRes.arrayBuffer()
    const b64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: b64 }
            },
            {
              type: 'text',
              text: `You are an academic examiner. Grade this student submission.\n\nAssignment: ${assignmentTitle}\nInstructions: ${instructions||'Complete the assignment as instructed.'}\nMax Marks: ${maxMarks}\n\nReturn ONLY this JSON: {"marks": NUMBER, "feedback": "STRING"}`
            }
          ]
        }]
      })
    })

    const data = await res.json()
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Anthropic error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const txt = data.content?.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') || '{}'
    const clean = txt.replace(/```json|```/g, '').trim()
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')
    const parsed = start >= 0 && end > start ? JSON.parse(clean.slice(start, end + 1)) : {}

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
