import express from "express";
import cors from "cors";
import xml2js from "xml2js";
import cheerio from "cheerio";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const BASE = "https://lassis12.bearblog.dev";
const RSS_RSS = `${BASE}/feed/?type=rss`;
const RSS_ATOM = `${BASE}/feed/?type=atom`;
const LIST_URL = `${BASE}/blog/`;
const DESIRED = 30;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

let cache = { ts: 0, posts: [] };

async function tryFetchUrlText(url) {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok) throw new Error(`fetch ${url} status ${r.status}`);
  return r.text();
}

async function fetchFromRss() {
  try {
    const xml = await tryFetchUrlText(RSS_RSS);
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const parsed = await parser.parseStringPromise(xml);
    let items = parsed?.rss?.channel?.item || [];

    // try atom if rss empty
    if (!items || (Array.isArray(items) && items.length === 0)) {
      const xml2 = await tryFetchUrlText(RSS_ATOM);
      const parsed2 = await parser.parseStringPromise(xml2);
      items = parsed2?.feed?.entry || [];
      // normalize atom entries to rss-like fields
      if (Array.isArray(items)) {
        return items.map(it => ({
          title: it.title || "(sem título)",
          link: (it.link && (it.link.href || it.link)) || "",
          pubDate: it.updated || it.published || "",
          description: it["content"] || it.summary || ""
        })).slice(0, DESIRED);
      }
    }

    if (!Array.isArray(items)) items = [items];

    const posts = items.map(item => ({
      title: (item.title && (typeof item.title === "object" ? item.title._ : item.title)) || "(sem título)",
      link: item.link || item.guid || "",
      pubDate: item.pubDate || item.pubdate || "",
      description: item["content:encoded"] || item.description || ""
    }));

    return posts.slice(0, DESIRED);
  } catch (err) {
    console.warn("RSS fetch failed:", err.message || err);
    return [];
  }
}

function absolutize(href) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return BASE.replace(/\/$/, "") + href;
  return BASE.replace(/\/$/, "") + "/" + href;
}

async function scrapeListAndPosts(limit = DESIRED) {
  try {
    const html = await tryFetchUrlText(LIST_URL);
    const $ = cheerio.load(html);
    const links = [];

    // encontrar links na listagem (varias possibilidades)
    $("ul.blog-posts li a").each((i, el) => {
      const href = $(el).attr("href");
      if (href) links.push(absolutize(href));
    });

    // fallback: procurar articles com a tag <a>
    if (links.length === 0) {
      $("article a").each((i, el) => {
        const href = $(el).attr("href");
        if (href) links.push(absolutize(href));
      });
    }

    // dedupe e limitar
    const uniq = [...new Set(links)].slice(0, limit);

    const posts = [];
    for (const link of uniq) {
      try {
        const page = await tryFetchUrlText(link);
        const $$ = cheerio.load(page);

        // tentar extrair título (varias estratégias)
        let title = $$("h1").first().text().trim()
          || $$("h2").first().text().trim()
          || $$("meta[property='og:title']").attr("content")
          || link.split("/").filter(Boolean).pop() || "(sem título)";

        // data
        let pubDate = $$("time").first().attr("datetime")
          || $$("time").first().text().trim()
          || $$("meta[property='article:published_time']").attr("content")
          || "";

        // conteúdo principal: checar article, .content, .post, .entry-content
        let description = $$("article").first().html()
          || $$(".content").first().html()
          || $$(".post-content").first().html()
          || $$(".entry-content").first().html()
          || $$(".post").first().html()
          || $$(".blog-post").first().html()
          || "";

        // se só tiver parágrafos, pegar texto
        if (!description) description = $$("p").map((i,e)=> $$(e).html()).get().join("\n");

        posts.push({
          title: title || "(sem título)",
          link,
          pubDate,
          description: description || ""
        });
      } catch (err) {
        console.warn("failed fetch post", link, err.message || err);
      }
    }

    return posts.slice(0, limit);
  } catch (err) {
    console.warn("scrapeListAndPosts failed:", err.message || err);
    return [];
  }
}

app.get("/posts", async (req, res) => {
  try {
    // cache check
    if (Date.now() - cache.ts < CACHE_TTL_MS && cache.posts.length > 0) {
      return res.json(cache.posts);
    }

    // 1) try rss/atom first
    let posts = await fetchFromRss();

    // 2) if not enough, try scraping list + individual posts
    if (!posts || posts.length < DESIRED) {
      const scraped = await scrapeListAndPosts(DESIRED);
      // merge dedup by link preferring RSS description when present
      const map = new Map();
      posts = posts || [];
      for (const p of posts) {
        const key = (p.link || p.title).toString();
        map.set(key, p);
      }
      for (const s of scraped) {
        const key = (s.link || s.title).toString();
        if (!map.has(key)) map.set(key, s);
      }
      posts = Array.from(map.values()).slice(0, DESIRED);
    }

    // final fallback: if still empty, return empty array
    cache = { ts: Date.now(), posts };
    res.json(posts);
  } catch (err) {
    console.error("final error /posts:", err);
    res.status(500).json({ error: "Erro ao carregar posts" });
  }
});

app.get("/", (_req, res) => res.send("backend rodando 💗"));

app.listen(PORT, () => console.log(`server listening on ${PORT}`));
