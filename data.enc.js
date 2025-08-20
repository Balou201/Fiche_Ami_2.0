// encrypt-to-github.js
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

import usersData from "./data.js";

const secret = process.env.DATA_SECRET;
const json = JSON.stringify(usersData);

// --- Chiffrement AES ---
const key = crypto.createHash("sha256").update(secret).digest();
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

let encrypted = cipher.update(json, "utf8", "base64");
encrypted += cipher.final("base64");

// Fichier à mettre sur GitHub
const output = {
  iv: iv.toString("base64"),
  data: encrypted,
};

fs.writeFileSync("data.enc.js", `export default ${JSON.stringify(output, null, 2)};`);
console.log("✅ Fichier data.enc.js généré");
