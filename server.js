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
// Fetch nativo do Node 18+
const response = await fetch(rssUrl);
if (!response.ok) throw new Error("Erro ao acessar o RSS: " + response.status);

const xml = await response.text();
const json = await parseStringPromise(xml, { explicitArray: false });

let items = json.rss.channel.item;
if (!items) items = [];
if (!Array.isArray(items)) items = [items];

const posts = items
  .slice(0, 10)
  .map(item => ({
    title: item.title || "",
    link: item.link || "",
    pubDate: item.pubDate || "",
    description: item.description || ""
  }));

res.json(posts);
```

} catch (err) {
console.error("Erro no backend:", err.message);
res.status(500).json({ error: "Erro ao carregar posts" });
}
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
