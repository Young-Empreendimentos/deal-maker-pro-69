import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: roleCheck } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin").maybeSingle();
    if (!roleCheck) return new Response(JSON.stringify({ error: "Apenas administradores podem criar usuários" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { email, password, nome, role } = await req.json();
    if (!email || !password) return new Response(JSON.stringify({ error: "E-mail e senha são obrigatórios" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) return new Response(JSON.stringify({ error: createError.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userId = newUser.user.id;

    // Set profile name
    await supabaseAdmin.from("user_profiles").upsert({ user_id: userId, nome: nome || "" });

    // Set role
    if (role && role !== "user") {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
