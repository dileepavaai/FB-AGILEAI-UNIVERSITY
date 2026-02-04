const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid");

const createTransporter = () => {
  return nodemailer.createTransport(
    sgTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    })
  );
};

module.exports.sendEmail = async ({
  to,
  templateId,
  dynamicTemplateData,
  subject,
}) => {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: '"Agile AI University" <insights@agileai.university>',
    to,
    subject, // still required even for dynamic templates
    templateId,
    dynamicTemplateData,
  });
};