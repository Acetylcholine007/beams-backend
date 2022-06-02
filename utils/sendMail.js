const nodemailer = require("nodemailer");

module.exports = {
  sendMail: (email, subject, htmlTemplate, text) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "FloodBuoy Team",
      to: email,
      subject: subject,
      html: htmlTemplate,
      text: text,
    };

    transporter.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(">>>>>>>>>", error);
      } else {
        console.log("Successfully sent email.");
      }
    });
  },
  sendMailPromise: (email, subject, htmlTemplate, text) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "FloodBuoy Team",
      to: email,
      subject: subject,
      html: htmlTemplate,
      text: text,
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
          reject("Failed to send email");
        } else {
          resolve("Notification email sent");
        }
      });
    });
  },
};
