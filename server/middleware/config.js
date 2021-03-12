const bd = require('../conexion');

async function verifyUsers (req, res, next) {
    let check = await bd.query('SELECT COUNT(*) FROM usuarios');

    if (check.rows[0].count == 0) {
        req.body.config = true;
    } else {
        req.body.config = false;
    }
    next();
}

module.exports = verifyUsers;