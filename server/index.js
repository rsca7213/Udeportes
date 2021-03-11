// Librerias requeridas
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Configuración inicial del servidor
const app = express();
app.use(cors({ origin: `${process.env.CLIENT_LINK}` , credentials :  true }));
app.use(express.json());
dotenv.config();

// Inicializar enrutador de express
const routerAuth = require('./routes/routerAuth.js');
app.use('/auth', routerAuth);

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