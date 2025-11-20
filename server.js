const express = require("express");
const cors = require("cors");
const fetchPosts = require("./fetchPosts"); // seu script que baixa/retorna posts

const app = express();

// Habilita CORS para permitir que seu front-end acesse a API
app.use(cors());

// Rota da API para retornar posts
app.get("/api/posts", async (req, res) => {
try {
const posts = await fetchPosts(); // função que pega os posts mais recentes
res.json(posts);
} catch (err) {
console.error("Erro ao buscar posts:", err.message);
res.status(500).json({ error: err.message });
}
});

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
