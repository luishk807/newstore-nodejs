const config = require('../../config');
const { getAdminEmail } = require('../../utils');
const sendGrid = require('@sendgrid/mail');
sendGrid.setApiKey(config.sendGrid.key);

const sendContactEmail = (clientEmail, subject, message) => {
  const toEmail = getAdminEmail('contact');
  const msg = {
    to: toEmail, // Change to your recipient
    from: toEmail, // Change to your verified sender
    subject: `Email from customer: ${subject}`,
    text: `${message}`,
    html: `<p>Name: ${clientEmail}</p><p>Message: ${message}</p>`,
  }
  let result = null;
  console.log("heee", msg)
  return sendGrid.send(msg).then(() => {
    return {
      status:true,
      message: 'Email Sent'
    }
  })
  .catch((error) => {
    // return false;
    return {
      status: false,
      message: error
    }
  })
}

module.exports = {
  sendContactEmail
}