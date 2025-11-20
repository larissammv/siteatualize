const express = require('express');
const xml2js = require('xml2js');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/posts', async (req, res) => {
  try {
    const rssUrl = 'https://lassis12.bearblog.dev/feed/?type=rss';

    const response = await fetch(rssUrl);
    if (!response.ok) throw new Error('Erro ao acessar o RSS');

    const xml = await response.text();

    // Conversor de XML → JSON
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const json = await parser.parseStringPromise(xml);

    let items = json?.rss?.channel?.item;

    if (!items) return res.json([]);

    // Garante array sempre
    if (!Array.isArray(items)) items = [items];

    // Pegar no máximo 30 posts
    const posts = items.slice(0, 30).map(item => ({
      title: item.title || "(sem título)",
      link: item.link || "",
      pubDate: item.pubDate || "",
      description: item.description || ""
    }));

    res.json(posts);

  } catch (err) {
    console.error("Erro no backend:", err);
    res.status(500).json({ error: 'Erro ao carregar posts' });
  }
});

app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));
