exports.userSignupValidator = {
    name: {
        notEmpty:true,
        errorMessage:"Name is required"
    },

    password: {
        isStrongPassword: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        },
        errorMessage: "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
    },

    email: {
        isEmail:{
            bail:true
        },
        errorMessage:"email address is invalid"
    }
}