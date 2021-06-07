const passport = require('passport')
const Usuarios = require('../models/Usuarios')
const crypto = require('crypto')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const bcrypt = require('bcrypt-nodejs')
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local',
  {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
  }
)

exports.usuarioAutenticado = (req, res, next) => {
  if (req.isAuthenticated())
    return next()

  return res.redirect('/iniciar-sesion')
}

exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/iniciar-sesion')
  })
}

exports.enviarToken = async (req, res) => {
  const email = req.body.email
  const usuario = await Usuarios.findOne({ where: { email } })

  if (!usuario) {
    req.flash('error', 'No existe esa cuenta')
    res.redirect('/restablecer')
  }

  usuario.token = crypto.randomBytes(20).toString('hex')
  usuario.expiracion = Date.now() + 3600000

  await usuario.save()

  const resetUrl = `${req.headers.origin}/${usuario.token}`

  await enviarEmail.enviar({
    usuario,
    subject: 'Password Reset',
    resetUrl,
    archivo: 'restablecerPassword'
  })

  req.flash('correcto', 'Se envió un mensaje a tu correo')
  res.redirect('/iniciar-sesion')
}

exports.validarToken = async (req, res) => {
  const token = req.params.token
  const usuario = await Usuarios.findOne({ where: { token } })

  if (!usuario) {
    req.flash('error', 'No Válido')
    res.redirect('/restablecer')
  }

  res.render(
    'resetPassword',
    {
      nombrePagina: 'Restablecer Contraseña'
    }
  )
}

exports.actualizarPassword = async (req, res) => {
  const token = req.params.token
  const password = req.body.password

  const usuario = await Usuarios.findOne(
    {
      where: {
        token,
        expiracion: {
          [Op.gte]: Date.now()
        }
      }
    }
  )

  if (!usuario) {
    req.flash('error', 'No Válido')
    res.redirect('/restablecer')
  }

  usuario.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
  usuario.token = null
  usuario.expiracion = null

  await usuario.save()

  req.flash('correcto', 'Tu password se ha modificado correctamente')
  res.redirect('/iniciar-sesion')
}