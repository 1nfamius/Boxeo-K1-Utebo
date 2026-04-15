// api/combates-index.js
// Devuelve solo las noticias de tipo "combate" con sus campos parseados
const fs = require("fs");
const path = require("path");

function parseFrontmatter(texto) {
  const match = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  match[1].split("\n").forEach(linea => {
    const [clave, ...valor] = linea.split(": ");
    if (clave && valor.length) {
      data[clave.trim()] = valor.join(": ").trim().replace(/^"(.*)"$/, "$1");
    }
  });
  return data;
}

module.exports = (req, res) => {
  try {
    const dir = path.join(process.cwd(), "content", "noticias");
    if (!fs.existsSync(dir)) return res.status(200).json([]);

    const archivos = fs.readdirSync(dir).filter(f => f.endsWith(".md"));

    const combates = archivos
      .map(archivo => {
        const texto = fs.readFileSync(path.join(dir, archivo), "utf-8");
        const data = parseFrontmatter(texto);
        if (!data || data.tipo !== "combate") return null;
        return {
          titulo:       data.titulo       || "",
          peleador:     data.peleador     || "",
          rival:        data.rival        || "",
          lugar:        data.lugar        || "",
          hora:         data.hora_combate || "20:00",
          fecha:        data.fecha_combate || data.fecha || "",
          imagen:       data.imagen       || "",   // imagen destacada = cartelera
          resumen:      data.resumen      || "",
        };
      })
      .filter(c => c !== null)
      // Solo futuros o de hoy
      .filter(c => {
        if (!c.fecha) return false;
        const fechaEvento = new Date(c.fecha + "T" + c.hora);
        return fechaEvento >= new Date(Date.now() - 86400000); // margen 24h
      })
      .sort((a, b) => new Date(a.fecha + "T" + a.hora) - new Date(b.fecha + "T" + b.hora));

    res.status(200).json(combates);
  } catch (err) {
    res.status(500).json({ error: "Error leyendo combates" });
  }
};