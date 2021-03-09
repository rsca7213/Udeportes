// Librerias requeridas
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Configuración del servidor
const app = express();
app.use(cors({ origin: 'localhost' , credentials :  true }));
app.use(express.json());
dotenv.config();

// Router
/*const main_router = require('./routes/main_router');
app.use('/api', main_router);*/

// Para producción
/*
if (process.env.NODE_ENV === 'production') {
    // Static folder
    app.use(express.static(__dirname + '/public'));

    app.get('/*', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });
}
*/

// Iniciar servidor
app.listen(process.env.SERVER_PORT, async () => {
    console.log(`Servidor ejecutandose en: ${process.env.SERVER_URL}:${process.env.SERVER_PORT}`);
});