const express = require('express');
const router = express.Router();
const multer = require('multer') //se encarga de poder subir los archivos al servidor, o sea procesar los archivos que envian las peticiones ajax, asincronas o del cliente
const UserController = require('../controllers/user')
const check = require('../middlewares/auth')

//Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname)
    }
});

const uploads = multer({ storage }); //storage: storage, es lo mismo

//Definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUser)
router.post("/register", UserController.register) //siempre una ruta que guarde algo va por post
router.post("/login", UserController.login)
router.get("/profile/:id", check.auth, UserController.profile)
router.get("/list/:page?", check.auth, UserController.list)
router.put("/update", check.auth, UserController.update)
router.post("/upload", [check.auth, uploads.single('image')], UserController.upload)
router.get("/avatar/:file", UserController.avatar)
router.get("/counters/:id", check.auth, UserController.counters)

//Exportar router
module.exports = router;