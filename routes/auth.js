const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

// Registrar usuario
router.post("/register", async (req, res) => {
    const { nombre, apellido, email, password, descripcion, imagen } = req.body;

    // Verificar que los datos sean correctos
    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ error: "Todos los campos obligatorios deben completarse" });
    }

    try {
        // Verificar si el correo ya está registrado
        const emailExistente = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
        if (emailExistente.rows.length > 0) {
            return res.status(409).json({ error: "El correo electrónico ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO usuarios (nombre, apellido, email, password, descripcion, imagen) VALUES ($1, $2, $3, $4, $5, $6)",
            [nombre, apellido, email, hashedPassword, descripcion || "Escribe algo sobre ti...", imagen || "/img/default-profile.jpg"]
        );

        res.status(201).json({ message: "Usuario registrado exitosamente" });

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                descripcion: user.descripcion,
                imagen: user.imagen,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Obtener perfil del usuario autenticado
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, nombre, apellido, telefono, descripcion, imagen FROM usuarios WHERE id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.rows[0]); // Enviar toda la información del usuario
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ error: "Error al obtener perfil" });
    }
});

// Ruta para actualizar el perfil del usuario
router.put("/update", authenticateToken, async (req, res) => {
    const { id } = req.user; // ID del usuario autenticado obtenido del token
    const { nombre, apellido, telefono, descripcion, foto } = req.body;

    try {
        const result = await pool.query(
            "UPDATE usuarios SET nombre = $1, apellido = $2, telefono = $3, descripcion = $4, imagen = $5 WHERE id = $6 RETURNING *",
            [nombre, apellido, telefono, descripcion, foto, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.rows[0]); // Enviar los datos actualizados
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ error: "Error al actualizar perfil" });
    }
});

module.exports = router;
