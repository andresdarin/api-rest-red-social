const Follow = require('../models/follow')
const User = require('../models/user');

//Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controller/follow.js"
    })
}

//Accion de guardar un follow (accion de Seguir)

//Accion de borrar un follow (dejar de seguir)

//Lista de usuarios a los que estoy siguiendo

//Listado de usuarios que me siguen

//exportar acciones
module.exports = {
    pruebaFollow
}