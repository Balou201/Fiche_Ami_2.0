const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API Fiche Ami 2.0 🚀");
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
