import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// muito importante: aceitar SDP bruto vindo do navegador
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

app.get("/", (req, res) => {
  res.send("Jarvis WebRTC server online.");
});

const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime",
  audio: {
    output: {
      voice: "alloy"
    }
  },
  instructions:
    "Você é Jarvis. Responda em português do Brasil. Seja elegante, direto, preciso e calmo."
});

app.post("/session", async (req, res) => {
  try {
    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    const response = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: fd
    });

    const sdp = await response.text();

    if (!response.ok) {
      return res.status(response.status).send(sdp);
    }

    res.send(sdp);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao criar sessão WebRTC",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor WebRTC rodando na porta", PORT);
});