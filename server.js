const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require("cors");
app.use(cors());

app.get("/posts", (req, res) => {
  try {
    const raw = fs.readFileSync("posts.json", "utf8");
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Não foi possível carregar os posts." });
  }
});

app.get("/", (req, res) => {
  res.send("Backend funcionando! Use /posts para pegar os posts.");
});

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
