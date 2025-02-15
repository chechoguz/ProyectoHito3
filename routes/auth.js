const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
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


module.exports = router;
