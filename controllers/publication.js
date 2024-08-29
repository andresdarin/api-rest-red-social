const Publication = require("../models/publication")
const fs = require('fs').promises //file system
const path = require('path')
const followService = require('../services/followServices')

//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controller/publication.js"
    })
}

//Guardar Publicacion
const save = async (req, res) => {
    try {
        //recoger datos del body
        const params = req.body;

        //si no me llegan, dar respouesta negativa
        if (!params.text) {
            return res.status(400).json({
                status: "error",
                message: "Debes enviar el texto de la publicacion"
            });
        }

        //crear y rellenar el objeto del modelo
        let newPublication = new Publication(params)
        newPublication.user = req.user.id

        //guardar objeto en base de datos
        const publicationStored = await newPublication.save();

        if (!publicationStored) {
            return res.status(400).json({
                status: "error",
                message: "No se guardó la publicación"
            });
        }

        //devolver la respuesta
        return res.status(200).json({
            status: "success",
            message: "Publicacion Guardada",
            publicationStored
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar la publicacion",
            error: error.message
        });
    }
}

//sacar una sola publicacion
const detail = async (req, res) => {
    try {
        //sacar id de publicacion de la url
        const publicationId = req.params.id

        //Find con la condicion del id
        const publicationStored = await Publication.findById(publicationId)

        if (!publicationStored) {
            return res.status(404).json({
                status: "error",
                message: "No existe la publicacion"
            });
        }

        //devolver la respuesta
        return res.status(200).json({
            status: "success",
            message: "Publicacion Guardada",
            publication: publicationStored
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al sacar la publicacion",
            error: error.message
        });
    }
}

//eliminar publicaciones
const remove = async (req, res) => {
    try {
        // Sacar el id de la publicacion a eliminar
        const publicationId = req.params.id;

        // Buscar y eliminar la publicacion
        const result = await Publication.deleteOne({ "user": req.user.id, "_id": publicationId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró la publicación o no tiene permiso para eliminarla"
            });
        }

        // Devolver la respuesta
        return res.status(200).json({
            status: "success",
            message: "Publicación eliminada",
            publicationId
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al eliminar la publicación",
            error: error.message
        });
    }
};


//Listar publicaciones de un usuario en concreto
const user = async (req, res) => {
    try {
        //sacar el id de usuario
        const userId = req.params.id

        //controlar la pagina, el numero
        let page = 1;
        if (req.params.page) {
            page = req.params.page
        }

        const itemsPerPage = 5;
        const total = await Publication.countDocuments({ user: userId });

        // find, populate, ordenar, paginar
        const publications = await Publication.find({ "user": userId })
            .sort("-created_at")
            .populate('user', '-password -role -__v -email')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);


        if (!publications || publications.length <= 0) {
            return res.status(404).json({
                status: "error",
                message: "No se encontró publicaciones"
            });
        }

        // Devolver la respuesta
        return res.status(200).json({
            status: "success",
            message: "Publicaciones del perfil del usuario",
            publications,
            page,
            pages: Math.ceil(total / itemsPerPage),
            total
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al buscar las publicaciones por usuario",
            error: error.message
        });
    }
}

//Subir ficheros
const upload = async (req, res) => {
    try {
        // Obtener la ID de la publicación
        const publicationId = req.params.id;

        // Verificar si se ha recibido un archivo
        if (!req.file) {
            return res.status(404).send({
                status: "error",
                message: "La petición no incluye una imagen"
            });
        }

        // Obtener el nombre del archivo
        let image = req.file.filename;

        // Actualizar la publicación con el nombre del archivo
        const publicationUpdated = await Publication.findByIdAndUpdate(
            publicationId,
            { file: image },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(500).json({
                status: "error",
                message: "Error al actualizar la publicación"
            });
        }

        // Enviar la respuesta
        return res.status(200).json({
            status: "success",
            publication: publicationUpdated,
            file: req.file
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}


//devolver archivos multimedia (imagenes)
const media = async (req, res) => {
    try {
        const file = req.params.file;
        const filePath = path.resolve('./uploads/publications', file);

        await fs.access(filePath);

        res.sendFile(filePath);
    } catch (error) {
        console.error(`Error al acceder al archivo: ${error.message}`);
        return res.status(404).json({
            status: 'error',
            message: 'No existe el archivo',
            error: error.message
        });
    }
};

//listar todas las publicaciones
const feed = async (req, res) => {
    try {
        //Sacar la pagina principal
        let page = 1

        if (req.params.page) {
            page = req.params.page
        }

        //sacar un array de identificadores de usuarios que yo sigo como usuario identificado
        const myFollows = await followService.followUserIds(req.user.id);

        //estableces numero de elementos por pagina
        const itemsPerPage = 5;
        const total = await Publication.countDocuments({ user: { $in: myFollows.following } });



        //find publicaciones usando el operador in, ordenar, popular, paginar
        const publications = await Publication.find({ user: { $in: myFollows.following } })
            .sort('-created_at') // Ordenar por fecha de creación, si es necesario
            .skip((page - 1) * itemsPerPage) // Saltar los documentos según la página actual
            .limit(itemsPerPage) // Limitar el número de documentos devueltos
            .populate('user', '-password -role -email -__v') // Aquí se reemplazan los ObjectId en `user` con los documentos completos de User


        if (!publications) {
            return res.status(500).json({
                status: 'error',
                message: 'No se han listado las publicaciones del feed'
            });
        }

        //devovler respuesta
        return res.status(200).json({
            status: "success",
            message: 'Feed de publicaciones',
            myFollows: myFollows.following,
            publications,
            page,
            pages: Math.ceil(total / itemsPerPage),
            total
        });
    } catch (error) {
        console.error(`Error al acceder al archivo: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'No se han listado las publicaciones del feed',
            message: error.message
        });
    }
}


//exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}