//importar modulos
const jwt = require('jwt-simple')
const moment = require('moment')

//importar clave secreta
const libjwt = require('../services/jwt');
const secret = libjwt.secret;

//funcion de autenticacion
exports.auth = (req, res, next) => {
    //comprobar si me llega la cabecera de autenticacion
    if (!req.headers.authorization) {
        return res.status(400).send({
            status: 'error',
            message: "La peticion no tiene la cabecera de autenticacion"
        })
    }

    //Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '') //elimina los caracteres estos, y los reemplaza por nada

    //Decodificar el token
    try {
        let payload = jwt.decode(token, secret);

        ///comprbar la expiracion del token
        if (payload.exp <= moment().unix) {
            return res.status(401).send({
                status: 'error',
                message: "Token expirado",
                error: error.message
            })
        }
        //agregar datos de usuario a la request
        req.user = payload
    } catch (error) {
        return res.status(400).send({
            status: 'error',
            message: "La peticion no tiene la cabecera de autenticacion",
            error: error.message
        })
    }

    //pasar a la ejecucion de la ruta
    next();
}

