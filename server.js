import express from "express";
import fetch from "node-fetch";
import xml2js from "xml2js";

const app = express();
const PORT = process.env.PORT || 3000;

const RSS_URL = "https://lassis12.bearblog.dev/feed.xml";

app.get("/", (req, res) => {
  res.send("Backend da Lassis funcionando 💗");
});

app.get("/posts", async (req, res) => {
  try {
    const xml = await fetch(RSS_URL).then(r => r.text());

    const json = await xml2js.parseStringPromise(xml, {
      trim: true,
      explicitArray: false
    });

    const items = json.rss.channel.item;

    const posts = items.map(post => ({
      title: post.title,
      link: post.link,
      pubDate: post.pubDate,
      description: post.description || ""
    }));

    res.json(posts);

  } catch (err) {
    console.error("ERRO AO PROCESSAR:", err);
    res.status(500).json({ error: "Erro ao carregar posts" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
