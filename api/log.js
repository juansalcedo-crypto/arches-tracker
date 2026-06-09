const SUPA_URL = "https://watgvezsgppjvusotuge.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdGd2ZXpzZ3BwanZ1c290dWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODExMzgsImV4cCI6MjA5NjI1NzEzOH0.U1vPzCzCPKHozbdvIV6n2_67UqB3etUSFc9yKoyE0SU";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { person, teamId, projects } = req.body;
    if (!person || !projects) return res.status(400).json({ error: "Missing data" });

    const logDate = new Date().toISOString().split("T")[0];

    // Delete today's existing logs for this person first
    await fetch(`${SUPA_URL}/rest/v1/daily_logs?date=eq.${logDate}&person=eq.${encodeURIComponent(person)}`, {
      method: "DELETE",
      headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` }
    });

    const rows = projects.map(proj => ({
      date: logDate,
      person,
      team_id: teamId || null,
      project: proj.name,
      priority: proj.prio || "P2",
      db_search:    proj.counts?.db_search    || 0,
      li_search:    proj.counts?.li_search    || 0,
      expansion:    proj.counts?.expansion    || 0,
      cold_call:    proj.counts?.cold_call    || 0,
      connections:  proj.counts?.connections  || 0,
      inmail:       proj.counts?.inmail       || 0,
      emails:       proj.counts?.emails       || 0,
      sms:          proj.counts?.sms          || 0,
      company_call: proj.counts?.company_call || 0,
      proposals:    proj.counts?.proposals    || 0,
      int_sched:    proj.counts?.int_sched    || 0,
      int_done:     proj.counts?.int_done     || 0,
      other:        proj.counts?.other        || 0,
      actions_done: proj.actionsDone || 0,
      pct:          proj.pct || 0,
      action_notes: proj.notes || {},  // ← notes per action
    }));

    const response = await fetch(`${SUPA_URL}/rest/v1/daily_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPA_KEY,
        "Authorization": `Bearer ${SUPA_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(rows)
    });

    if (response.ok) return res.status(200).json({ ok: true });
    const err = await response.text();
    return res.status(400).json({ ok: false, error: err });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
