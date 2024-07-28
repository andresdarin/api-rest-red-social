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

//eliminar publicaciones

//Listar todas las publicaciones

//Listar publicaciones de un usuario en concreto

//Subir ficheros

//devolver archivos multimedia (imagenes)

//exportar acciones
module.exports = {
    pruebaPublication,
    save
}