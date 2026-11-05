import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import OpenAI from "openai";
import { narrations } from "./narrations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_AUDIO_MODEL || "gpt-audio-1.5";
const voice = process.env.OPENAI_AUDIO_VOICE || "coral";
const cacheDir = path.join(__dirname, ".cache", "audio");
const pending = new Map();

app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public"), {
  etag: true,
  maxAge: "1h"
}));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    voiceConfigured: Boolean(process.env.OPENAI_API_KEY),
    slides: narrations.length,
    model,
    voice
  });
});

async function generateAudio(slideIndex) {
  const text = narrations[slideIndex];
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ text, model, voice }))
    .digest("hex")
    .slice(0, 24);
  const file = path.join(cacheDir, `${slideIndex}-${hash}.wav`);

  try {
    return await fs.readFile(file);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (!process.env.OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY não configurada no servidor.");
    error.status = 503;
    throw error;
  }

  const key = `${slideIndex}:${hash}`;
  if (pending.has(key)) return pending.get(key);

  const task = (async () => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model,
      modalities: ["text", "audio"],
      audio: { voice, format: "wav" },
      store: false,
      messages: [
        {
          role: "system",
          content: "Você é Vera, apresentadora brasileira do KallTec. Leia o texto fornecido exatamente como está, sem acrescentar, remover, resumir ou responder. Use português do Brasil, voz feminina adulta, natural e acolhedora, ritmo rápido e dinâmico, tom profissional levemente informal, pausas curtas e dicção clara. Pronuncie KallTec como Cal Téc e SOAP como sóap."
        },
        {
          role: "user",
          content: `Leia exatamente este texto:\n\n${text}`
        }
      ]
    });

    const encoded = response.choices?.[0]?.message?.audio?.data;
    if (!encoded) throw new Error("A API não retornou áudio para a narração.");

    const audio = Buffer.from(encoded, "base64");
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(file, audio);
    return audio;
  })().finally(() => pending.delete(key));

  pending.set(key, task);
  return task;
}

app.get("/api/speech/:slide", async (req, res) => {
  const slideIndex = Number(req.params.slide);
  if (!Number.isInteger(slideIndex) || slideIndex < 0 || slideIndex >= narrations.length) {
    return res.status(404).json({ error: "Slide inválido." });
  }

  try {
    const audio = await generateAudio(slideIndex);
    res.set({
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(audio.length)
    });
    return res.send(audio);
  } catch (error) {
    console.error(`Falha ao gerar a voz do slide ${slideIndex + 1}:`, error.message);
    return res.status(error.status || 502).json({
      error: "Não foi possível preparar a narração agora."
    });
  }
});

app.get("*path", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`KallTec disponível na porta ${port}.`);
});
