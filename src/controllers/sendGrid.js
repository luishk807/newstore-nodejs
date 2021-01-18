const config = require('../config');
const sendGrid = require('@sendgrid/mail');
sendGrid.setApiKey(config.sendGrid.key);

const sendContactEmail = (from, subject, message) => {
  const msg = {
    to: config.email.contact, // Change to your recipient
    from: config.email.contact, // Change to your verified sender
    subject: `Email from customer: ${subject}`,
    text: `${message}`,
    html: `<p>Name: ${from}</p><p>Message: ${message}</p>`,
  }
  let result = null;
  return sendGrid.send(msg).then(() => {
    return true;
  })
  .catch((error) => {
    return false;
  })
}

const sendOrderEmail = (from, cartArray, subject, message) => {
  const msg = {
    to: config.email.contact, // Change to your recipient
    from: config.email.contact, // Change to your verified sender
    subject: `Email from customer: ${subject}`,
    text: `${message}`,
    html: `<p>Name: ${from}</p><p>Message: ${message}</p>`,
  }
  let result = null;
  return sendGrid.send(msg).then(() => {
    return true;
  })
  .catch((error) => {
    return false;
  })
}

module.exports = {
  sendContactEmail,
  sendOrderEmail
}