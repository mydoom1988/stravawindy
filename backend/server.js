
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let refresh_token = process.env.REFRESH_TOKEN;
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
      athlete_id = response.data.athlete.id;

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
