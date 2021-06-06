const Proyectos = require('../models/Proyectos')
const Tareas = require('../models/Tareas')

exports.proyectosHome = async (req, res) => {
  const usuarioId = res.locals.usuario.id
  const proyectos = await Proyectos.findAll({ where: { usuarioId } })

  res.render('index', {
    nombrePagina: 'Proyectos',
    proyectos
  })
}

exports.formularioProyecto = async (req, res) => {
  const usuarioId = res.locals.usuario.id
  const proyectos = await Proyectos.findAll({ where: { usuarioId } })

  res.render('nuevoProyecto', {
    nombrePagina: 'Nuevo Proyecto',
    proyectos
  }
  )
}

exports.nuevoProyecto = async (req, res) => {
  const { nombre } = req.body

  let errores = []
  if (!nombre) {
    errores.push({ 'texto': 'Agregar un nombre al proyecto' })
  }

  if (errores.length) {
    const usuarioId = res.locals.usuario.id
    const proyectos = await Proyectos.findAll({ where: { usuarioId } })

    res.render(
      'nuevoProyecto', { nombrePagina: 'Nuevo Proyecto', errores, proyectos })
  } else {
    const usuarioId = res.locals.usuario.id
    await Proyectos.create({ nombre, usuarioId })
    res.redirect('/')
  }
}

exports.proyectoPorUrl = async (req, res, next) => {
  const usuarioId = res.locals.usuario.id
  const url = req.params.url

  const proyectosPromise = Proyectos.findAll({ where: { usuarioId } })

  const proyectoPromise = Proyectos.findOne(
    {
      where: {
        url,
        usuarioId
      }
    }
  )

  const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise])

  if (!proyecto) return next()

  const tareas = await Tareas.findAll({
    where: {
      proyectoId: proyecto.id
    }
  })

  res.render('tareas', {
    nombrePagina: 'Tareas del proyecto',
    proyectos,
    proyecto,
    tareas
  })
}

exports.formularioEditar = async (req, res, next) => {
  const usuarioId = res.locals.usuario.id

  const proyectosPromise = Proyectos.findAll(
    {
      where: {
        usuarioId
      }
    })

  const proyectoPromise = Proyectos.findOne(
    {
      where: {
        id: req.params.id
      }
    }
  )

  const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise])

  if (!proyecto) return next()

  res.render('nuevoProyecto', {
    nombrePagina: 'Editar Proyecto',
    proyectos,
    proyecto
  })
}

exports.actualizarProyecto = async (req, res) => {
  const { nombre } = req.body

  let errores = []
  if (!nombre) {
    errores.push({ 'texto': 'Agregar un nombre al proyecto' })
  }

  if (errores.length) {
    const proyectos = await Proyectos.findAll()

    res.render(
      'nuevoProyecto', { nombrePagina: 'Nuevo Proyecto', errores, proyectos })
  } else {
    await Proyectos.update(
      {
        nombre: nombre
      },
      {
        where: {
          id: req.params.id
        }
      })
    res.redirect('/')
  }
}

exports.eliminarProyecto = async (req, res, next) => {
  const { urlProyecto } = req.query
  await Proyectos.destroy(
    {
      where: {
        url: urlProyecto
      }
    })

  if (!resultado) {
    next()
  }

  res.status(200).send('Proyecto Eliminado Correctamente')
}