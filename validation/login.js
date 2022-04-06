const Validator = require('validator');
const isEmpty = require('../validation/is-empty');

module.exports = function validateLoginInput(data){
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    
    
    
    if( !Validator.isEmail(data.email)){
        errors.email = 'Email is invalid'
    }
    if( Validator.isEmpty(data.email)){
        errors.email = 'Email field is required'
    }
    if( !Validator.isLength(data.password, {min: 6, max: 30})){
        errors.password = 'Password must be between 6 and 30 characters'
    }
    if( Validator.isEmpty(data.password)){
        errors.password = 'Password field is required'
    }
    // if( Validator.isEmpty(data.password2)){
    //     errors.password2 = 'confirm Password field is required'
    // }
    // if(!Validator.equals(data.password, data.password2)){
    //     errors.password2 = 'Passwords must match'
    // }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}