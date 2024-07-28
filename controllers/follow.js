const Follow = require('../models/follow')
const User = require('../models/user');

const mongoosePaginate = require('mongoose-pagination')

const followService = require('../services/followServices')

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
const following = async (req, res) => {
    try {
        // Sacar el id del usuario identificado
        let userId = req.user.id;

        // Comprobar si me llega el id por parámetro en url
        if (req.params.id) {
            userId = req.params.id;
        }

        // Comprobar si me llega la página, si no llega será la página 1
        let page = 1;
        if (req.params.page) {
            page = req.params.page;
        }

        // Cuantos usuarios por página quiero mostrar
        const itemsPerPage = 5;

        // Buscar follows, popular datos de los usuarios y paginar con mongoose paginate
        const follows = await Follow.find({ user: userId })
            .populate('user followed', '-password -role -__v')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        // Obtener el total de documentos para la paginación
        const total = await Follow.countDocuments({ user: userId });

        // Ver seguidores en común
        // Sacar un array de los ids de los usuarios que me siguen y siguen a la persona que estoy visitando el perfil
        let followUserIds = followService.followUserIds(req.user.id);


        return res.status(200).send({
            status: 'success',
            message: 'Listado de usuarios a los que estoy siguiendo',
            follow: follows,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: (await followUserIds).following,
            user_follow_me: (await followUserIds).followers
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al obtener la lista de usuarios seguidos',
            error: error.message
        });
    }
}



//Listado de usuarios que me siguen 
const followers = async (req, res) => {
    try {
        // Sacar el id del usuario identificado
        let userId = req.user.id;

        // Comprobar si me llega el id por parámetro en url
        if (req.params.id) {
            userId = req.params.id;
        }

        // Comprobar si me llega la página, si no llega será la página 1
        let page = 1;
        if (req.params.page) {
            page = req.params.page;
        }

        // Cuantos usuarios por página quiero mostrar
        const itemsPerPage = 5;

        // Buscar follows, popular datos de los usuarios y paginar con mongoose paginate
        const follows = await Follow.find({ followed: userId })
            .populate('user followed', '-password -role -__v')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        // Obtener el total de documentos para la paginación
        const total = await Follow.countDocuments({ user: userId });

        let followUserIds = followService.followUserIds(req.user.id);


        return res.status(200).send({
            status: 'success',
            message: 'Listado de usuarios a los que me siguen',
            follow: follows,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: (await followUserIds).following,
            user_follow_me: (await followUserIds).followers
        });
    } catch (error) {
        return res.status(500).send({
            status: 'error',
            message: 'Error al obtener la lista de usuarios seguidos',
            error: error.message
        });
    }
}

//exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}