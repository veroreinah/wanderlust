require("dotenv").config();

const mjml = require('mjml');
const hbs = require('handlebars');
const fs = require('fs');
const path = require('path');
const { transporter } = require("./transporter");

const sendMail = (to, subject, data, template) => {
  const templatePath = path.join(__dirname, `./templates/${template}.mjml`);
  const templateFile = fs.readFileSync(templatePath, "utf8");
  const { html } = mjml(templateFile, {});
  const templateData = hbs.compile(html);
  const compiledHTML = templateData(data);

  return transporter.sendMail({
      from: `"Wanderlust" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: compiledHTML
    })
    .then(info => console.log(info))
    .catch(error => console.log(error));
};

module.exports = { sendMail };