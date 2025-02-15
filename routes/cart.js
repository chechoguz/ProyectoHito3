const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Agregar producto al carrito
router.post("/add", async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;

    try {
        await pool.query(
            "INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad) VALUES ($1, $2, $3)",
            [usuario_id, producto_id, cantidad]
        );
        res.status(201).json({ message: "Producto agregado al carrito" });
    } catch (error) {
        res.status(500).json({ error: "Error al agregar al carrito" });
    }
});

// Obtener productos del carrito
router.get("/:usuario_id", async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM detalle_pedidos WHERE pedido_id = $1",
            [usuario_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
});

module.exports = router;
