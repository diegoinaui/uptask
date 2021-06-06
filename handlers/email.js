const nodemailer = require('nodemailer')
const pug = require('pug')
const juice = require('juice')
const { htmlToText } = require('html-to-text')
const util = require('util')
const emailConfig = require('../config/email')
const { actualizarPassword } = require('../controllers/authController')

let transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
})

const generarHTML = (archivo, opciones = {}) => {
  const html = pug.renderFile(
    `${__dirname}/../views/emails/${archivo}.pug`,
    opciones
  )
  return juice(html)
}

exports.enviar = async (opciones) => {
  const html = generarHTML(opciones.archivo, opciones)
  let opcionesEmail = {
    from: 'UpTask <no-reply@uptask.com>',
    to: opciones.usuario.email,
    subject: opciones.subject,
    text: htmlToText(html, {}),
    html
  }

  const enviarEmail = util.promisify(transporter.sendMail, transporter)

  return enviarEmail.call(transporter, opcionesEmail)
}