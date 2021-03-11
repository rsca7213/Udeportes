const router = require('express').Router();
const config = require('../controllers/config');

router.route('/')
    .post(async (req, res) => {
        let check = await config.init(req.body);
        res.status(check.codigo).send(check.texto);   
    });

module.exports = router;