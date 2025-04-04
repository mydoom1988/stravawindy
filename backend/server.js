
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const client_id = "152627";
const client_secret = "683cee5c2f3f39bcecbc36a6ba8e17daf094bc00";
let refresh_token = "01a98a31fd2a27be1e5d3b76be45cd13d19b963e";
let access_token = null;
let expires_at = 0;
let athlete_id = null;

app.get("/token", async (req, res) => {
  const now = Math.floor(Date.now() / 1000);

  if (!access_token || now >= expires_at) {
    console.log("🔄 Refreshing Strava access token...");
    try {
      const response = await axios.post("https://www.strava.com/oauth/token", null, {
        params: {
          client_id,
          client_secret,
          grant_type: "refresh_token",
          refresh_token,
        },
      });

      access_token = response.data.access_token;
      refresh_token = response.data.refresh_token;
      expires_at = response.data.expires_at;

      if (response.data.athlete && response.data.athlete.id) {
        athlete_id = response.data.athlete.id;
      } else {
        // fallback
        const me = await axios.get("https://www.strava.com/api/v3/athlete", {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        athlete_id = me.data.id;
      }

      console.log("✅ Token refreshed.");
    } catch (err) {
      console.error("❌ Error refreshing token:", err.response?.data || err.message);
      return res.status(500).json({ error: "Token refresh failed" });
    }
  }

  res.json({ access_token, athlete_id });
});

app.listen(3000, () => {
  console.log("🔌 Token server running at http://localhost:3000");
});
