const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const BASE_URL = "https://lassis12.bearblog.dev";

async function fetchPosts() {
  const listPage = await axios.get(`${BASE_URL}/blog`);
  const dom = new JSDOM(listPage.data);
  const document = dom.window.document;

  const links = [...document.querySelectorAll("a")]
    .map(a => a.getAttribute("href"))
    .filter(href => href && href.startsWith("/") && !href.includes("blog"));

  const uniqueLinks = [...new Set(links)];
  const posts = [];

  for (const link of uniqueLinks) {
    try {
      const postUrl = BASE_URL + link;
      const postPage = await axios.get(postUrl);
      const doc = new JSDOM(postPage.data).window.document;

      const title = doc.querySelector("h1")?.textContent.trim() || "Sem título";
      const contentEl = doc.querySelector("article .content");
      let description = contentEl ? contentEl.innerHTML.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").trim() : "";

      let publishedAt = "";
      const timeEl = doc.querySelector("time[datetime]") || doc.querySelector("time");
      if (timeEl) publishedAt = timeEl.getAttribute("datetime") || timeEl.textContent.trim();

      posts.push({ url: postUrl, title, description, publishedAt });
    } catch (err) {
      console.log("Erro ao processar:", link, err.message);
    }
  }

  return posts;
}

module.exports = fetchPosts;
