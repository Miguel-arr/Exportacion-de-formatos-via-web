// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Límite alto para permitir la imagen de la firma

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Tu usuario de MySQL
    password: 'admin',
    database: 'control_trabajadores'
});

// Endpoint de Login
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    db.query('SELECT * FROM usuarios WHERE usuario = ? AND password = ?', [usuario, password], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.json({ success: true, usuarioId: results[0].id });
        } else {
            res.json({ success: false, message: 'Credenciales incorrectas' });
        }
    });
});

// Endpoint para guardar formulario y usar Python
app.post('/guardar', (req, res) => {
    const { usuarioId, altura, peso, firma } = req.body;

    // Llamamos a Python para calcular el IMC
    const pythonProcess = spawn('python', ['procesar.py', JSON.stringify({ altura, peso })]);

    pythonProcess.stdout.on('data', (data) => {
        const resultadoPython = JSON.parse(data.toString());
        const imc = resultadoPython.imc;

        // Guardamos todo en la base de datos
        const sql = 'INSERT INTO registros (usuario_id, altura, peso, imc, firma) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [usuarioId, altura, peso, imc, firma], (err, result) => {
            if (err) return res.status(500).send(err);
            res.json({ success: true, imc: imc, message: 'Registro guardado con éxito' });
        });
    });
});

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));


