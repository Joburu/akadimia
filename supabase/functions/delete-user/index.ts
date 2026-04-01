import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { userId } = await req.json()
  if (!userId) return new Response(JSON.stringify({error:"No userId"}),{status:400})

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Delete from auth.users (cascades to profiles via FK)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return new Response(JSON.stringify({error:error.message}),{status:500})

  return new Response(JSON.stringify({success:true}),{
    headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}
  })
})
