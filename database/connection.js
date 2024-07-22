const mongoose = require("mongoose");

const connection = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/mi_redsocial");

        console.log("Conectado correctamente a bd: mi_redsocial")

    } catch (error) {
        console.log(error);
        throw new error("No se ha podido conectar a la base de datos!")
    }
}

module.exports = connection