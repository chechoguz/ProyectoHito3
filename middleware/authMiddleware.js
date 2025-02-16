const jwt = require("jsonwebtoken");
require("dotenv").config(); // Asegurar que cargamos las variables de entorno

// Middleware para autenticar las solicitudes
const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado, token no proporcionado" });
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(401).json({ error: "Formato de token inválido" });
    }

    jwt.verify(tokenParts[1], process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token inválido" });
        }

        req.user = user; // Guardamos la información del usuario en la petición
        next();
    });
};

module.exports = { authenticateToken };
