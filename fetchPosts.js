// fetchPosts.js
const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const BASE_URL = "https://lassis12.bearblog.dev";

async function fetchPosts() {
  try {
    const listPage = await axios.get(`${BASE_URL}/blog`);
    const dom = new JSDOM(listPage.data);
    const document = dom.window.document;

    // Pega links dos posts (dentro da lista de blog)
    const links = [...document.querySelectorAll("ul.blog-posts a")]
      .map(a => a.getAttribute("href"))
      .filter(href => href && href.startsWith("/"));

    const uniqueLinks = [...new Set(links)];
    const posts = [];

    for (const link of uniqueLinks) {
      try {
        const postUrl = BASE_URL + link;
        const postPage = await axios.get(postUrl);
        const doc = new JSDOM(postPage.data).window.document;

        // Título
        const title = doc.querySelector("h1")?.textContent.trim() || "Sem título";

        // Conteúdo do post
        const contentEl = doc.querySelector("main") || doc.querySelector("article");
        let cleanHTML = "";
        if (contentEl) {
          cleanHTML = contentEl.innerHTML
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<h1[\s\S]*?<\/h1>/gi, "") // remove h1 duplicado
            .trim();
        }

        // Data de publicação
        let publishedAt = "";
        const timeEl = doc.querySelector("time[datetime]") || doc.querySelector("time");
        if (timeEl) {
          publishedAt = timeEl.getAttribute("datetime") || timeEl.textContent.trim();
        }

        posts.push({ url: postUrl, title, description: cleanHTML, publishedAt });
      } catch (err) {
        console.error("Erro no post:", link, err.message);
      }
    }

    return posts;
  } catch (err) {
    throw new Error("Erro ao buscar posts: " + err.message);
  }
}

module.exports = fetchPosts;
