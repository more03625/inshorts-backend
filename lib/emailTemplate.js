const helper = require('../lib/helper');
const getEmailTemplate = (name, data) => {
    var template = ""
    switch(name) {
        case "register":
            template = {
                subject: "Registered successfully",
                body: "<p>" +
                "Hello " + data.name + "," + 
                "<p>" +
                "Your contact details are successfully registered. Thank you for registering." + 
                "<p>" +
                "Regards," +
                "<br>" +
                "Team"
            }
            break;
        case "login_otp":
            template = {
                subject: "Login OTP",
                body: "<p>" +
                "Hello " + data.name + "," + 
                "<p>" +
                data.otp + " is your One Time Password. Please complete your OTP verification for login. OTP is Valid for 10 min." +
                "<p>" +
                "Regards," +
                "<br>" +
                "Team ItsEZE"
            }        
            break;
        case "verify_otp":
            template = {
                subject: "Verifed successfully",
                body:"<p>" +
                "Hello " + data.name + "," + 
                "<p>" +
                "Your details are successfully verified." + 
                "<p>" +
                "Regards," +
                "<br>" +
                "Team"
            }
            break;
        case "invite_users":
            template = {
                subject: "Event Invitation",
                body:"<p>" +
                "Hello," + 
                "<p>" +
                "Click below to check event details:<br>" + 
                "<a href=" + process.env.baseUrl + "#/resetPasswordUser/" + "> Click here</a>" +
                "<p>" +
                "<p>" +
                "Regards," +
                "<br>" +
                "Team"
            }
            break;
        default:
            template = ""
    }
    let mailData = {
        email: data.email,
        subject: template.subject,
        body: template.body
    };
    helper.sendEmail(mailData);
}

module.exports = {
    getEmailTemplate
}