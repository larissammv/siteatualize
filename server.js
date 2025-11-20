// server.js
const express = require("express");
const cors = require("cors");
const fetchPosts = require("./fetchPosts");

const app = express();
app.use(cors());

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await fetchPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Também aceita /posts (sem /api)
app.get("/posts", async (req, res) => {
  try {
    const posts = await fetchPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
