import Swal from 'sweetalert2'
import axios from 'axios'
import { actualizarAvance } from '../funciones/avance'

const tareas = document.querySelector('.listado-pendientes')

if (tareas) {
  tareas.addEventListener('click', e => {
    if (e.target.classList.contains('fa-check-circle')) {
      const icono = e.target
      const idTarea = icono.parentElement.parentElement.dataset.tarea
      const url = `${location.origin}/tareas/${idTarea}`

      axios.patch(url, { params: { idTarea } })
        .then(function (respuesta) {
          if (respuesta.status === 200) {
            icono.classList.toggle('completo')
            actualizarAvance();
          }
        })
    } else if (e.target.classList.contains('fa-trash')) {
      const icono = e.target
      const tareaHtml = icono.parentElement.parentElement
      const idTarea = tareaHtml.dataset.tarea

      Swal.fire({
        title: 'Deseas borrar esta Tarea?',
        text: "Un tarea eliminada no se puede recuperar!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, borrarlo!',
        cancelButtonText: "No, cancelar"
      }).then((respuesta) => {
        if (respuesta.isConfirmed) {
          const url = `${location.origin}/tareas/${idTarea}`

          axios.delete(url, { params: { idTarea } })
            .then(function (respuesta) {
              if (respuesta.status === 200) {
                  tareaHtml.parentElement.removeChild(tareaHtml)
                  Swal.fire(
                    'Tarea eliminada!',
                    respuesta.data,
                    'success'
                  ).then(() => {
                    actualizarAvance();
                  })
                  
              }
            })
        }
      })
    }
  })
}

export default tareas