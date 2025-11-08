// server.js
const express = require('express');
const xml2js = require('xml2js'); // converter RSS XML em JSON
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir que o frontend acesse
app.use(cors());

app.get('/posts', async (req, res) => {
  try {
    const rssUrl = 'https://lassis12.bearblog.dev/feed/?type=rss';
    
    // Node 18+ tem fetch nativo
    const response = await fetch(rssUrl);
    if (!response.ok) throw new Error(`Erro ao acessar o feed: ${response.status}`);

    const xml = await response.text();

    // Converter RSS XML para JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const json = await parser.parseStringPromise(xml);

    let items = json.rss.channel.item;

    // Garantir que items seja sempre um array
    if (!Array.isArray(items)) items = [items];

    // Transformar em formato mais fácil para frontend
    const posts = items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description
    }));

    res.json(posts);
  } catch (err) {
    console.error('Erro no backend:', err.message);
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

app.listen(PORT, () => console.log(`Backend rodando em http://localhost:${PORT}`));
