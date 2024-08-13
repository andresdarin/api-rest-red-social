// Importar dependencias y modulos
const User = require('../models/user');
const Follow = require('../models/follow');
const Publication = require('../models/publication');
const jwt = require('../services/jwt')
const bcrypt = require('bcrypt');
const fs = require('fs').promises //file system
const path = require('path')
const mongoosePagination = require('mongoose-pagination');
const followService = require('../services/followServices')


// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controller/user.js",
        usuario: req.user
    });
}

// Registro de usuarios
const register = async (req, res) => {
    // Recoger datos de la petición
    let params = req.body;

    // Comprobar que llegan bien (+validación)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        // Control de usuarios duplicados
        let users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() },
            ]
        });

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "error",
                message: "El usuario ya existe",
            });
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la base de datos usando async/await
        let userStored = await user_to_save.save();

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userStored
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar el usuario",
            error: error.message
        });
    }
}

const login = async (req, res) => {
    // Recoger parámetros / datos de la petición
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Buscar en la base de datos si existe el email o usuario, incluyendo la contraseña
        let user = await User.findOne({ email: params.email }).select('name email nick password');

        if (!user) {
            return res.status(400).json({
                status: "error",
                message: "No existe el usuario"
            });
        }

        // Verificar que la contraseña almacenada esté presente
        if (!user.password) {
            return res.status(500).json({
                status: "error",
                message: "Contraseña no encontrada en la base de datos"
            });
        }

        // Comprobar su contraseña
        const passwordMatch = await bcrypt.compare(params.password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({
                status: "error",
                message: "Contraseña incorrecta"
            });
        }

        // token
        const token = jwt.createToken(user);

        // Eliminar la contraseña del objeto `user` para la respuesta
        const userResponse = user.toObject();
        delete userResponse.password; // Esto solo afecta a la respuesta


        // Devolver los datos del usuario sin la contraseña
        return res.status(200).send({
            status: 'success',
            message: 'Te identificaste correctamente',
            user: userResponse,
            token
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al realizar el login",
            error: error.message
        });
    }
}

const profile = async (req, res) => {
    try {
        // Recibir el parámetro del id de usuario por la URL
        const id = req.params.id;

        // Consulta para sacar los datos del usuario
        const userProfile = await User.findById(id).select('-password -role');
        if (!userProfile) {
            return res.status(404).json({
                status: "error",
                message: "No existe usuario"
            });
        }

        // Info de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, id);

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            user: userProfile,
            followInfo: followInfo.following,
            follower: followInfo.follower
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener el perfil del usuario",
            error: error.message
        });
    }
};



const list = async (req, res) => {
    try {
        // Controlar en qué página estamos
        let page = parseInt(req.params.page) || 1;

        // Configurar la cantidad de elementos por página
        const itemsPerPage = 5;

        // Consultar usuarios con paginación usando Mongoose
        const users = await User.find({}, '-password -email -role -__v')
            .sort('_id')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();

        const total = await User.countDocuments();

        if (!users || users.length === 0) {
            return res.status(404).json({
                status: "error",
                message: 'No hay usuarios disponibles'
            });
        }

        //info de los seguimientos
        let followUserIds = followService.followUserIds(req.user.id);

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage),
            user_following: (await followUserIds).following,
            user_follow_me: (await followUserIds).followers
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener el listado",
            error: error.message
        });
    }
};

//actualizar en el backend
const update = async (req, res) => {
    //recoger info del usuario a actualizar
    const userIdentity = req.user;
    const userToUpdate = req.body;

    //eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    //comprobar que el usuario existe
    try {
        // Control de usuarios duplicados
        let users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() },
            ]
        });

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "error",
                message: "El usuario ya existe",
            });
        }

        //si me llega la pass, cifrarla
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password;
        }

        const userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

        if (!userUpdated) {
            return res.status(500).json({
                status: "error",
                message: "Usuario no encontrado",
            });
        }

        //buscar y actualizar
        return res.status(200).json({
            status: "success",
            message: 'Usuario actualizado correctamente',
            user: userUpdated // Enviar el usuario actualizado
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar el usuario",
            error: error.message
        });
    }
};




const upload = async (req, res) => {
    try {
        //Recoger el fichero de la imagen y comprobar que existe
        if (!req.file) {
            return res.status(404).send({
                status: "error",
                message: "La petiocion no incluye una imagen",
                error: error.message
            });
        }

        //conseguir el nombre del archivo
        let image = req.file.originalname;

        //sacar la extension del archivo
        const imageSplit = image.split("\.")
        const extension = imageSplit[1].toLowerCase();

        //Comprobar extension
        if (extension !== "png" && extension !== "jpg" && extension !== "jpeg" && extension !== "gif") {

            //borrar archivo subido si no es correcto
            const filePath = req.file.path;
            const fileDeleted = fs.unlinkSync(filePath);

            //devolver respuesta negativa
            return res.status(404).send({
                status: "error",
                message: "Extension del fichero inválida"
            });

        }

        //Si es correcta, guardar imagen en la base de datos
        const userUpdated = await User.findOneAndUpdate(
            { _id: req.user.id },
            { image: req.file.filename },
            { new: true }
        );

        if (!userUpdated) {
            return res.status(500).json({
                status: "error",
                message: "Error en la subida del avatar",
                error: error.message
            });
        }
        //Devolver respuesta
        return res.status(200).json({
            status: "success",
            user: userUpdated,
            file: req.file,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar imagen",
            error: error.message
        });
    }

}

// Obtener avatar
const avatar = async (req, res) => {
    try {
        const file = req.params.file;
        const filePath = path.resolve('./uploads/avatars', file);

        await fs.access(filePath);
        res.sendFile(filePath);
    } catch (error) {
        return res.status(404).json({
            status: 'error',
            message: 'No existe la imagen'
        });
    }
};

//contador de seguidores
const counters = async (req, res) => {
    try {
        let userId = req.params.id;

        if (req.params.id) {
            userId = req.params.id
        }

        const following = await Follow.countDocuments({ 'user': userId })
        const followed = await Follow.countDocuments({ 'followed': userId })
        const publications = await Follow.countDocuments({ 'user': userId })

        //Devolver respuesta
        return res.status(200).json({
            status: "success",
            userId,
            following,
            followed,
            publications
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}

