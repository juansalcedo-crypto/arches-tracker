export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, channel } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    // Use channel from request or fall back to env variable
    const targetChannel = channel || process.env.SLACK_CHANNEL;

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SLACK_TOKEN}`
      },
      body: JSON.stringify({
        channel: targetChannel,
        text,
        mrkdwn: true
      })
    });

    const data = await response.json();
    if (data.ok) {
      return res.status(200).json({ ok: true });
    } else {
      console.error("Slack error:", data.error, "channel:", targetChannel);
      return res.status(400).json({ ok: false, error: data.error });
    }
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
