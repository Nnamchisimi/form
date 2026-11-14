import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { sendApprovalEmail } from "../shared/emails.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

const BATCH_SIZE = 50
const DELAY_MS = 500

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const body = await req.json().catch(() => ({}))
    const dryRun = body?.dryRun === true
    const limit = typeof body?.limit === "number" ? body.limit : null
    const referenceNumber = typeof body?.referenceNumber === "string" ? body.referenceNumber : null
    const referenceNumbers = Array.isArray(body?.referenceNumbers) ? body.referenceNumbers.filter((v: any) => typeof v === "string") : null
    const ids = Array.isArray(body?.ids) ? body.ids : null

    const applyFilters = (q: any) => {
      if (referenceNumber) q = q.eq("reference_number", referenceNumber)
      else if (referenceNumbers && referenceNumbers.length > 0) q = q.in("reference_number", referenceNumbers)
      if (ids && ids.length > 0) q = q.in("id", ids)
      return q
    }

    let registrations: any[] = []
    if (limit) {
      let q = supabase
        .from("registrations")
        .select("*")
        .not("invitation_status", "in", '("Approved","Rejected")')
      q = applyFilters(q)
      const { data, error } = await q.limit(limit)
      if (error) throw error
      registrations = data || []
    } else {
      const pageSize = 1000
      let from = 0
      while (true) {
        let q = supabase
          .from("registrations")
          .select("*")
          .not("invitation_status", "in", '("Approved","Rejected")')
          .range(from, from + pageSize - 1)
        q = applyFilters(q)
        const { data, error } = await q
        if (error) throw error
        const batch = data || []
        registrations = registrations.concat(batch)
        if (batch.length < pageSize) break
        from += pageSize
      }
    }

    if (!registrations || registrations.length === 0) {
      return new Response(JSON.stringify({
        processed: 0,
        failed: 0,
        errors: [],
        message: "No eligible registrations found"
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    if (dryRun) {
      return new Response(JSON.stringify({
        dryRun: true,
        eligible: registrations.length,
        sample: registrations.slice(0, 5).map(r => ({ id: r.id, email: r.email, reference_number: r.reference_number }))
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      })
    }

    console.log(`Starting bulk approval for ${registrations.length} registrations`)

    const results = { processed: 0, failed: 0, errors: [] as any[], total: registrations.length }

    for (let i = 0; i < registrations.length; i += BATCH_SIZE) {
      const batch = registrations.slice(i, i + BATCH_SIZE)
      const batchIds = batch.map(r => r.id)

      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(registrations.length / BATCH_SIZE)}: ${batch.length} users`)

      // 1. Update status to Approved
      const { error: updateError } = await supabase
        .from("registrations")
        .update({ invitation_status: "Approved" })
        .in("id", batchIds)

      if (updateError) {
        console.error("Update error:", updateError)
        results.errors.push({ batch: Math.floor(i / BATCH_SIZE) + 1, step: "update", error: updateError.message })
        continue
      }

      // 2. Archive them (copy record + archived metadata)
      const archiveData = batch.map((r: any) => ({
        original_id: r.id,
        name: r.name,
        surname: r.surname,
        email: r.email,
        phone: r.phone,
        dob: r.dob,
        vehicle_brand: r.vehicle_brand ?? null,
        vehicle_model: r.vehicle_model,
        model_year: r.model_year,
        license_plate: r.license_plate,
        chassis_number: r.chassis_number ?? null,
        vehicle_stub: r.vehicle_stub,
        location: r.location,
        submitted_at: r.submitted_at,
        receipt_status: r.receipt_status || "Pending",
        verification_status: r.verification_status || "Pending",
        invitation_status: "Approved",
        archived_reason: "Bulk approved",
        archived_at: new Date().toISOString(),
        reference_number: r.reference_number,
        language: r.language || null,
      }))

      const { error: archiveError } = await supabase
        .from("archived_registrations")
        .insert(archiveData)

      if (archiveError) {
        console.error("Archive error:", archiveError)
        results.errors.push({ batch: Math.floor(i / BATCH_SIZE) + 1, step: "archive", error: archiveError.message })
        continue
      }

      // 3. Delete from active table
      const { error: deleteError } = await supabase
        .from("registrations")
        .delete()
        .in("id", batchIds)

      if (deleteError) {
        console.error("Delete error:", deleteError)
        results.errors.push({ batch: Math.floor(i / BATCH_SIZE) + 1, step: "delete", error: deleteError.message })
        continue
      }

      // 4. Send approval emails (with per-user details/ticket)
      for (const record of batch) {
        try {
          await sendApprovalEmail({ ...record, invitation_status: "Approved" }, undefined, record.language || "tr", null)
          results.processed++
        } catch (emailError: any) {
          console.error(`Email failed for ${record.email}:`, emailError)
          results.failed++
          results.errors.push({ email: record.email, reference_number: record.reference_number, error: emailError?.message || String(emailError) })
        }
      }

      if (i + BATCH_SIZE < registrations.length) {
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    }

    console.log(`Bulk approval complete. Processed: ${results.processed}, Failed: ${results.failed}`)

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  } catch (error: any) {
    console.error("Edge Function error:", error)
    return new Response(JSON.stringify({ error: error?.message || String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    })
  }
})