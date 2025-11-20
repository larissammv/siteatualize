const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const BASE_URL = "[https://lassis12.bearblog.dev](https://lassis12.bearblog.dev)";

async function getAllPosts() {
try {
// Pega a página principal do blog
const listPage = await axios.get(`${BASE_URL}/blog`);
const dom = new JSDOM(listPage.data);
const document = dom.window.document;

```
// Seleciona links válidos dos posts
const links = [...document.querySelectorAll("a")]
  .map(a => a.getAttribute("href"))
  .filter(href => href && href.startsWith("/") && !href.includes("blog"));

const uniqueLinks = [...new Set(links)];
const posts = [];

// Para cada link, pega conteúdo, título e data
for (const link of uniqueLinks) {
  try {
    const postUrl = BASE_URL + link;
    const postPage = await axios.get(postUrl);
    const doc = new JSDOM(postPage.data).window.document;

    const title = doc.querySelector("h1")?.textContent.trim() || "Sem título";

    // Conteúdo do post
    const contentEl = doc.querySelector("article .content");
    let cleanHTML = "";
    if (contentEl) {
      cleanHTML = contentEl.innerHTML
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .trim();
    }

    // Data de publicação
    let publishedAt = "";
    const timeEl = doc.querySelector("time[datetime]") || doc.querySelector("time");
    if (timeEl) {
      publishedAt = timeEl.getAttribute("datetime") || timeEl.textContent.trim();
    }

    posts.push({
      url: postUrl,
      title,
      description: cleanHTML,
      publishedAt
    });

    console.log("✔️ Baixado:", title);
  } catch (err) {
    console.log("❌ Erro ao processar:", link, err.message);
  }
}

// Salva no JSON
fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2), "utf8");
console.log("\nArquivo posts.json salvo com sucesso!");
```

} catch (err) {
console.error("❌ Erro ao buscar a lista de posts:", err.message);
}
}

getAllPosts();
