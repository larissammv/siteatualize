const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const BASE_URL = "https://lassis12.bearblog.dev";

async function getAllPosts() {
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
            const postDom = new JSDOM(postPage.data);
            const doc = postDom.window.document;

            const title = doc.querySelector("h1,h2,h3")?.textContent.trim();
            const content = doc.querySelector("main, article, .content, body")?.innerHTML.trim();

            posts.push({
                url: postUrl,
                title,
                description: content
            });

            console.log("✔️ Baixado:", title);
        } catch (e) {
            console.log("Erro ao processar:", link);
        }
    }

    // SALVAR EM posts.json
    fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2), "utf8");
    console.log("\nArquivo posts.json salvo com sucesso!");
}

getAllPosts();
