const MIN_LENGTH = 3

const validateForm = () => {
    const nameElement = document.getElementById('nameField');
    const errorElement = document.getElementById('errorField');

    let validity = checkNameValidity(nameElement.value);

    if(!validity.valid) {
        errorElement.innerHTML = validity.message;
    } else {
        localStorage.setItem("name", nameElement.value);
    }

    return validity.valid;
};

const checkNameValidity = (name) => {
    if (name === '') return {message: 'Please insert your name', valid: false}
    if (name.length < MIN_LENGTH) return {message: 'Your name must be more than 3 characters long', valid: false};
    if (name[0] !== name[0].toUpperCase()) return {message: 'Your name must begin in uppercase', valid: false};
    return {message: 'Name is valid', valid: true};
};