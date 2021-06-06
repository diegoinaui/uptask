const Usuarios = require('../models/Usuarios')
const enviarEmail = require('../handlers/email')

exports.formCrearCuenta = (req, res) => {
  res.render('crearCuenta', {
    nombrePagina: 'Crear Cuenta'
  }
  )
}

exports.crearCuenta = async (req, res) => {
  const { email, password } = req.body

  try {
    await Usuarios.create({ email, password })

    const confirmarUrl = `${req.headers.host}/confirmar/${email}`

    const usuario = {
      email
    }

    await enviarEmail.enviar({
      usuario,
      subject: 'Confirma tu cuenta en UpTask',
      confirmarUrl,
      archivo: 'confirmarCuenta'
    })

    res.redirect('/iniciar-sesion')
  } catch (error) {
    console.log(error)
    req.flash(
      'error',
      error.errors.map(error => error.message)
    )

    res.render('crearCuenta', {
      mensajes: req.flash(),
      nombrePagina: 'Crea tu cuenta en Uptask',
      email,
      password
    })
  }
}

exports.formIniciarSesion = (req, res) => {
  const { error } = res.locals.mensajes

  res.render('iniciarSesion', {
    nombrePagina: 'Crear Cuenta',
    error
  }
  )
}

exports.formRestablecerPassword = (req, res) => {
  res.render('restablecer', {
    nombrePagina: 'Restablecer tu contraseña'
  })
}

exports.confirmarCuenta = async (req, res) => {
  const email = req.params.email
  const usuario = await Usuarios.findOne({ where: { email } })

  if (!usuario) {
    req.flash('error', 'No válido')
    res.redirect('/crear-cuenta')
  }

  usuario.activo = 1
  await usuario.save()

  req.flash('correcto', 'Cuenta activada correctamente')
  res.redirect('/iniciar-sesion')
}