// Librerias requeridas
const express = require('express');
const dotenv = require('dotenv');


// Configuración inicial del servidor
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  app.use(cors({ origin: process.env.CLIENT_LINK , credentials :  true }));
}

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
app.use('/api/posiciones', routerPosiciones);
const routerEstadisticas = require('./routes/routerEstadisticas.js');
app.use('/api/estadisticas', routerEstadisticas);
const routerCategorias = require('./routes/routerCategorias.js');
app.use('/api/categorias', routerCategorias);
const routerInscripciones = require('./routes/routerInscripciones.js');
app.use('/api/inscripciones', routerInscripciones);
const routerAsignaciones = require('./routes/routerAsignaciones.js');
app.use('/api/asignaciones', routerAsignaciones);
const routerEntrenamientos = require('./routes/routerEntrenamientos.js');
app.use('/api/entrenamientos', routerEntrenamientos);
const routerReportes = require('./routes/routerReportes.js');
app.use('/api/reportes', routerReportes);
const routerCompetencias = require('./routes/routerCompetencias.js');
app.use('/api/competencias', routerCompetencias);

// Para producción
if (process.env.NODE_ENV === 'production') {
  // Static folder
  app.use(express.static(__dirname + '/public'));
  app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });
}


// Iniciar servidor
app.listen(process.env.SERVER_PORT, async () => {
  console.log(`Servidor ejecutandose en: ${process.env.SERVER_URL}:${process.env.SERVER_PORT}`);
  console.log('Ruta del cliente: ', process.env.NODE_ENV === 'production' ? 'Produccion' : process.env.CLIENT_LINK);
});