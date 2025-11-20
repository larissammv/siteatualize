import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// Página do BearBlog que sempre funciona
const BEARBLOG_URL = "https://lassis12.bearblog.dev/blog";

app.get("/", (req, res) => {
  res.send("Backend da Lassis funcionando 💗");
});

app.get("/posts", async (req, res) => {
  try {
    const html = await fetch(BEARBLOG_URL).then(r => r.text());
    const $ = cheerio.load(html);

    const posts = [];

    $("article").each((i, el) => {
      const title = $(el).find("h2").text().trim();
      const link = $(el).find("a").attr("href");
      const date = $(el).find("time").text().trim();
      const description = $(el).find(".content").html() || "";

      posts.push({
        title,
        link: `https://lassis12.bearblog.dev${link}`,
        pubDate: new Date(date).toISOString(),
        description
      });
    });

    // Ordenar do mais novo para o mais antigo
    posts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    res.json(posts);

  } catch (err) {
    console.error("ERRO AO PROCESSAR:", err);
    res.status(500).json({ error: "Erro ao carregar posts" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
