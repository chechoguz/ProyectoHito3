const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./config/db");
const authRoutes = require("./routes/auth"); 
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ruta principal de prueba
app.get("/", (req, res) => {
    res.send("API funcionando correctamente");
});

// Rutas
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);

// Solo conectar a la base de datos si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
    pool.connect()
        .then(() => console.log("Conexión a PostgreSQL exitosa"))
        .catch(err => console.error("Error de conexión:", err));
}

// Cerrar la conexión cuando Jest termine los tests
if (process.env.NODE_ENV === "test") {
    afterAll(async () => {
        await pool.end();
    });
}

// Solo iniciar el servidor si el archivo es ejecutado directamente
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

// Exportar `app` para las pruebas con `supertest`
module.exports = app;
