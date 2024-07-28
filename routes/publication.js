const express = require('express');
const router = express.Router();
const PublicationController = require('../controllers/publication')
const check = require('../middlewares/auth')

//Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication)
router.post("/save", check.auth, PublicationController.save)

//Exportar router
module.exports = router;