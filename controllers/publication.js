const Publication = require("../models/publication")

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

//Listar todas las publicaciones de un usuario
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
            .populate('user', '-password -role -__v')
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


//Listar publicaciones de un usuario en concreto

//Subir ficheros

//devolver archivos multimedia (imagenes)

//exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user
}