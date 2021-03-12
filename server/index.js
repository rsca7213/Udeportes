// Librerias requeridas
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Configuración inicial del servidor
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
dotenv.config();
app.use(cors({ origin: process.env.CLIENT_LINK , credentials :  true }));
// Inicializar enrutador de express
const routerAuth = require('./routes/routerAuth.js');
app.use('/auth', routerAuth);
const routerConfig = require('./routes/routerConfig.js');
app.use('/init', routerConfig);
const routerCreacionUsuarios = require('./routes/routerGestionEntrenadores.js');
app.use('/entrenadores', routerCreacionUsuarios);
const routerPerfil = require('./routes/routerPerfil.js');
app.use('/perfil', routerPerfil);

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