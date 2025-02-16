const express = require("express");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
const router = express.Router();

// Procesar pedido (checkout)
router.post("/", authenticateToken, async (req, res) => {
    const usuario_id = req.user.id;
    const { productos } = req.body; // Asegurar que el request body tenga `productos`

    if (!productos || productos.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
    }

    try {
        console.log("Recibiendo pedido para el usuario:", usuario_id);
        console.log("Productos:", productos);

        // Crear un nuevo pedido
        const nuevoPedido = await pool.query(
            "INSERT INTO pedidos (usuario_id, total) VALUES ($1, 0) RETURNING id",
            [usuario_id]
        );

        const pedido_id = nuevoPedido.rows[0].id;

        // Insertar productos en detalle_pedidos
        let totalPedido = 0;
        for (const item of productos) {
            const producto = await pool.query(
                "SELECT precio FROM productos WHERE id = $1",
                [item.productId]
            );

            if (producto.rows.length === 0) {
                return res.status(404).json({ error: "Producto no encontrado." });
            }

            const precio = producto.rows[0].precio;
            totalPedido += precio * item.cantidad;

            await pool.query(
                "INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad) VALUES ($1, $2, $3)",
                [pedido_id, item.productId, item.cantidad]
            );
        }

        // Actualizar el total del pedido
        await pool.query(
            "UPDATE pedidos SET total = $1 WHERE id = $2",
            [totalPedido, pedido_id]
        );

        console.log("Pedido procesado con éxito:", pedido_id);
        res.status(201).json({ message: "Pedido procesado con éxito", pedido_id });
    } catch (error) {
        console.error("Error al procesar el pedido:", error);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
});

module.exports = router;