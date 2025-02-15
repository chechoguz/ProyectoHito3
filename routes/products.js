const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// 🔹 Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM productos");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// 🔹 Crear un producto (solo admin)
router.post("/", async (req, res) => {
    const { titulo, descripcion, precio, imagen } = req.body;

    try {
        await pool.query(
            "INSERT INTO productos (titulo, descripcion, precio, imagen) VALUES ($1, $2, $3, $4)",
            [titulo, descripcion, precio, imagen]
        );
        res.status(201).json({ message: "Producto creado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al crear producto" });
    }
});

// 🔹 Eliminar un producto (solo admin)
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM productos WHERE id = $1", [id]);
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar producto" });
    }
});

module.exports = router;
