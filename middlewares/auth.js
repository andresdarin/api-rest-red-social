const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// Middleware de autenticación
exports.auth = (req, res, next) => {
    // Comprobar si la petición tiene la cabecera de autenticación
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La petición no tiene la cabecera de autenticación"
        });
    }

    // Limpiar el token (eliminar comillas si es necesario)
    let token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        // Decodificar el token
        let payload = jwt.decode(token, secret);

        // Comprobar la expiración del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
            });
        }

        // Agregar datos del usuario al request
        req.user = payload;

        // Pasar a la siguiente acción
        return next();

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token inválido",
            error: error.message
        });
    }
}
