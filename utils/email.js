const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1)Create a transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //Activate in your gmail "less secure app" option when using your email for testing

  //2)Define the email options
  const mailOptions = {
    from: 'Addo Michael <xyz@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  //3)Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
