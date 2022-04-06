const Validator = require('validator');
const isEmpty = require('../validation/is-empty');

module.exports = function validateExperienceInput(data){
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    
    
    
    if( Validator.isEmpty(data.title)){
        errors.title = 'Job title field is required';
    }

    if( Validator.isEmpty(data.company)){
        errors.company = 'Company field is required';
    }

    if( Validator.isEmpty(data.from)){
        errors.from = 'From date field is required';
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