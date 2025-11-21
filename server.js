import express from "express";
import cors from "cors";
import { parseStringPromise } from "xml2js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/posts", async (req, res) => {
try {
const rssUrl = "[https://lasis.bearblog.dev/feed/?type=rss](https://lasis.bearblog.dev/feed/?type=rss)";

```
const response = await fetch(rssUrl); // Node 18+ já tem fetch
if (!response.ok) throw new Error("Erro ao acessar o RSS");

const xml = await response.text();
const json = await parseStringPromise(xml, { explicitArray: false });

let items = json.rss.channel.item;

if (!Array.isArray(items)) {
  items = [items];
}

// Apenas 10 posts
items = items.slice(0, 10);

const posts = items.map((item) => ({
  title: item.title,
  link: item.link,
  pubDate: item.pubDate,
  description: item.description,
}));

res.json(posts);
```

} catch (err) {
console.error("Erro no backend:", err.message);
res.status(500).json({ error: "Erro ao carregar posts" });
}
});

app.listen(PORT, () =>
console.log(`Servidor rodando em http://localhost:${PORT}`)
);
