import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

const BEAR_URL = "https://lassis12.bearblog.dev";

app.get("/posts", async (req, res) => {
  try {
    const response = await fetch(BEAR_URL);
    const html = await response.text();

    const $ = cheerio.load(html);

    const posts = [];

    $(".post-item").each((i, el) => {
      if (i >= 10) return false; // limita a 10 posts

      const title = $(el).find("a").text().trim();
      const url = $(el).find("a").attr("href");
      const description = $(el).find("p").text().trim();

      posts.push({
        title,
        url: BEAR_URL + url,
        description,
      });
    });

    res.json(posts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao carregar posts" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server rodando na porta " + PORT));
