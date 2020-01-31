const mongoose = require('mongoose');
// plugin para validar
const uniqueValidator = require('mongoose-unique-validator');

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};

//creamos nuevo squema de mongodb
let Schema = mongoose.Schema;
//instanciamos la clase para crear un nuevo esquema y asignamos los atributos
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

// metodo para convertir de json a objeto y no mostrar en la respuesta la passwd
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

// valida los atributos unique: true
usuarioSchema.plugin( uniqueValidator, { message: '{PATH} debe ser único'} );

// exporto el modelo el cual se llamara Usuario y tendra el esquema de usuarioSchema
module.exports = mongoose.model( 'Usuario', usuarioSchema );