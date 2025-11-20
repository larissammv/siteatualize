import express from "express";
import fetch from "node-fetch";
import xml2js from "xml2js";

const app = express();
const PORT = process.env.PORT || 3000;

// Feed RSS do seu BearBlog (retorna 40 posts)
const RSS_URL = "https://lassis12.bearblog.dev/feed/";

app.get("/", (req, res) => {
  res.send("Backend da Lassis funcionando 💗");
});

app.get("/posts", async (req, res) => {
  try {
    const xml = await fetch(RSS_URL).then(r => r.text());

    const parsed = await xml2js.parseStringPromise(xml, {
      explicitArray: false,
      mergeAttrs: true
    });

    const items = parsed.rss.channel.item || [];

    const posts = items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: new Date(item.pubDate).toISOString(),
      description: item["content:encoded"] || item.description || ""
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
