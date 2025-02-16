const request = require("supertest");
const app = require("../server");

let testEmail = `test${Date.now()}@example.com`; // Generar email único
let testPassword = "123456";

// Test 1: Verificar que el servidor responde en "/"
test("GET / debe responder con 'API funcionando correctamente'", async () => {
  const res = await request(app).get("/");
  expect(res.statusCode).toBe(200);
  expect(res.text).toBe("API funcionando correctamente");
});

// Test 2: Registrar un nuevo usuario antes de probar login
test("POST /auth/register debe registrar un usuario", async () => {
  const res = await request(app).post("/auth/register").send({
    nombre: "Test",
    apellido: "Usuario",
    email: testEmail, // Usar email generado
    password: testPassword,
    descripcion: "Cuenta de prueba",
    imagen: "/img/test.jpg",
  });

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("message", "Usuario registrado exitosamente");
});

// Test 3: Intentar login con credenciales incorrectas
test("POST /auth/login con datos incorrectos debe devolver error 401", async () => {
  const res = await request(app).post("/auth/login").send({
    email: testEmail, // Usar email del usuario registrado
    password: "incorrecta",
  });

  expect(res.statusCode).toBe(401);
  expect(res.body).toHaveProperty("error", "Contraseña incorrecta"); // Esperar el mensaje correcto
});

// Test 4: Obtener productos (sin autenticación)
test("GET /products debe devolver la lista de productos", async () => {
  const res = await request(app).get("/products");
  
  expect(res.statusCode).toBe(200);
  expect(res.body).toBeInstanceOf(Array);
});
