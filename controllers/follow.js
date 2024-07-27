const Follow = require('../models/follow')
const User = require('../models/user');

//Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controller/follow.js"
    })
}

//Accion de guardar un follow (accion de Seguir)
const save = async (req, res) => {
    try {
        //conseguir datos por body
        const params = req.body;

        //sacar id del usuario identificado
        const identity = req.user;

        //crear objeto con modelo follow
        let userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        });

        //guardar objeto en base de datos
        const followStored = await userToFollow.save();

        if (!followStored) {
            return res.status(500).json({
                status: "error",
                message: 'no se ha podido seguir al usuario'
            });
        }

        return res.status(200).send({
            status: 'success',
            identity: req.user,
            userToFollow
        })

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }

}

const unfollow = async (req, res) => {
    try {
        // Recoger el id del usuario identificado
        const userId = req.user.id;

        // Recoger el id del usuario que sigo y quiero dejar de seguir
        const followedId = req.params.id;

        // Buscar la coincidencia y eliminar
        const followRemoved = await Follow.findOneAndDelete({
            user: userId,
            followed: followedId
        });

        if (!followRemoved) {
            return res.status(404).send({
                status: 'error',
                message: 'No se ha encontrado el follow para eliminar'
            });
        }

        return res.status(200).send({
            status: 'success',
            message: 'Follow eliminado correctamente',
            followRemoved
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
}

//Lista de usuarios a los que estoy siguiendo

//Listado de usuarios que me siguen

//exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow
}