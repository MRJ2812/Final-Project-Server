// Nodemailer + Ethernal.mail

const nodemailer = require("nodemailer");

const sendMail = async (req, res) => {
    const mail = req.body;

    const subject = mail.subject;
    const email = mail.email;
    const message = mail.message;


    let testAccount = await nodemailer.createTestAccount();

    // connect with the smtp
    let transporter = await nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: 'trace.stokes@ethereal.email',
            pass: 'ZH6sUQakZgAK234MjN'
        }
    });

    let info = await transporter.sendMail({
        from: email, // sender address
        to: "iam@gmail.com", // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
        // html: "<b>Hello YT Thapa</b>", // html body
    });

    // console.log("Message sent: %s", info.messageId);
    res.json({ success: true, messageId: info.messageId });
};

module.exports = sendMail;