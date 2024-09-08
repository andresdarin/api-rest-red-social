const validator = require('validator');

const validate = (params) => {
    // Validar nombre
    let isNameValid = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3 }) &&
        validator.isAlpha(params.name, 'es-ES');

    // Validar apellido
    let isSurnameValid = !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, { min: 3 }) &&
        validator.isAlpha(params.surname, 'es-ES');

    // Validar apodo
    let isNickValid = !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, { min: 3 });

    // Validar email
    let isEmailValid = !validator.isEmpty(params.email) &&
        validator.isEmail(params.email);

    // Validar contraseña
    let isPasswordValid = !validator.isEmpty(params.password) &&
        validator.isLength(params.password, { min: 6 });

    // Validar biografía (opcional)
    let isBioValid = validator.isEmpty(params.bio) || validator.isLength(params.bio, { max: 500 });

    // Verificar si todas las validaciones son exitosas
    if (!isNameValid) {
        throw new Error('El nombre debe tener al menos 3 caracteres y solo contener letras.');
    }
    if (!isSurnameValid) {
        throw new Error('El apellido debe tener al menos 3 caracteres y solo contener letras.');
    }
    if (!isNickValid) {
        throw new Error('El apodo debe tener al menos 3 caracteres.');
    }
    if (!isEmailValid) {
        throw new Error('El correo electrónico no es válido.');
    }
    if (!isPasswordValid) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    if (!isBioValid) {
        throw new Error('La biografía, si se proporciona, no debe exceder los 500 caracteres.');
    }

    console.log('Validación superada');
};

module.exports = validate;
