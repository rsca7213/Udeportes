// Librerias requeridas
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Configuración inicial del servidor
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
dotenv.config();
console.log(process.env.CLIENT_LINK);
app.use(cors({ origin: process.env.CLIENT_LINK , credentials :  true }));
// Inicializar enrutador de express
const routerAuth = require('./routes/routerAuth.js');
app.use('/api/auth', routerAuth);
const routerConfig = require('./routes/routerConfig.js');
app.use('/api/init', routerConfig);
const routerCreacionUsuarios = require('./routes/routerEntrenadores.js');
app.use('/api/entrenadores', routerCreacionUsuarios);
const routerPerfil = require('./routes/routerPerfil.js');
app.use('/api/perfil', routerPerfil);
const routerAtletas = require('./routes/routerAtletas.js');
app.use('/api/atletas', routerAtletas);
const routerEducaciones = require('./routes/routerEducaciones.js');
app.use('/api/educaciones', routerEducaciones);
const routerDeportes = require('./routes/routerDeportes.js');
app.use('/api/deportes', routerDeportes);
const routerPosiciones = require('./routes/routerPosiciones.js');
app.use('/api/posiciones/deporte', routerPosiciones);

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