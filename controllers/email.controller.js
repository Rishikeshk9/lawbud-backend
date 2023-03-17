const sendgridTransport = require("nodemailer-sendgrid-transport");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API,
    },
  })
);

exports.sendEmail = async (req, res) => {
  try {
    const { email, message, subject } = req.body;
    if (email) {
      transporter
        .sendMail({
          to: email,
          from: process.env.SERVICE_EMAIL,
          subject: `${subject}`,
          html: `
              <p>${message}</p>
              `,
        })
        .then(() => {
          res.status(200).json({
            status: "success",
            message: "invite details updated successfully",
          });
        });
    }
  } catch (error) {
    return res.json({
      status: "error sending email",
    });
  }
};
