-- Active: 1729559052990@@127.0.0.1@5432@memes_store
-- Active: 1729559052990@@127.0.0.1@5432@postgres
CREATE DATABASE memes_store;

\c memes_store;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    descripcion TEXT DEFAULT 'Escribe algo sobre ti...',
    imagen TEXT,
    telefono VARCHAR(20),
    rol VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    imagen TEXT NOT NULL
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id),
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL
);

