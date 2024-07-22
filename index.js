//importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require('cors');

//Mensaje de bienvenida
console.log("API NODE para red social arrancada")

// conexion a la bdd
connection();

//crear servidor node
const app = express();
const puerto = 3900;

//configurar cors (usar un middleware, que es algo que se ejecuta antes que cualquier otra cosa, se usa para convertir datos, body parse etc, todo lo que hace falta que se ejecute previo a todo)
app.use(cors());

//convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({ extended: true })) //cualquier dato que llegue con el formato urlencoded lo convierte en un objeto usable por javascript, o sea un objeto.js

//cargar config de rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

//ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "nombre": "Andres",
            "web": "andresdarinweb.uy"
        }
    )
})

//poner servidor a escuchar peticions http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto: ", puerto);
});

