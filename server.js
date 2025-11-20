const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

app.get("/posts", (req, res) => {
  try {
    const data = fs.readFileSync("./posts.json", "utf8");
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    console.error("Erro lendo posts.json:", err);
    res.status(500).json({ error: "Erro ao carregar posts" });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando na porta " + PORT));
