const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Crear un nuevo producto
router.post("/", async (req, res) => {
    const { titulo, descripcion, precio, imagen } = req.body; // imagen ahora es un enlace (URL)
    try {
        const result = await pool.query(
            "INSERT INTO productos (titulo, descripcion, precio, imagen) VALUES ($1, $2, $3, $4) RETURNING *",
            [titulo, descripcion, precio, imagen] // Guardar directamente el enlace
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: "Error al crear producto" });
    }
});

// Actualizar producto
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, precio, imagen } = req.body;
    try {
        const result = await pool.query(
            "UPDATE productos SET titulo = $1, descripcion = $2, precio = $3, imagen = $4 WHERE id = $5 RETURNING *",
            [titulo, descripcion, precio, imagen, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: "Error al actualizar producto" });
    }
});

// Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM productos");
        res.json(result.rows); // Enviar productos al frontend
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// Eliminar un producto (solo administradores)
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query("DELETE FROM productos WHERE id = $1 RETURNING *", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "Error al eliminar producto" });
    }
});


module.exports = router;
