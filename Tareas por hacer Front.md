# Tareas pendientes

Este documento contiene las tareas que consideramos relevantes. Está todo
dividido por sencciones para que no tenga perdida.

## Frontend

### Miscelaneos

- [x] Añadir pagina Galería.
- [x] **Optimizar imagenes pasando las mismas a WEBP (Usar github como
  hosting).**

### index

- [ ] Hacer que los datos sean dinamicos | Revisar Hero Banner.

### Nosotros

- [ ] Al botón "vamos", falta modal de contacto al equipo de desarrollo.

### Login/Register

- [x] **animación de carga en los botones de inicio de sesion y registrarse**

### Pag Reservas

- [x] arreglar colores del modal cambiar cancha

#### Paso 1

- [x] centrar los pasos y todos los divs
- [x] quitar metodo de pago y pasarlo al modal de pago
- [x] (opcional) si no se ocurre nuevo campo separar nombre y apellido

#### Paso 2

- [ ] Arreglar tamaño de los seleccionadores de hora

#### Paso 3

- [x] cambiar el texto del botón por ir a pagar

#### **Paso 4 Modal de pago**

- [x] **diseño libre para mauricio**

#### Paso 5 - reservado

- [ ] añadir sección del qr para la ubicación de la cancha con textos
  descriptivos

## PERFIL USUARIO

- [ ] ***agregar panel de reservas pendientes donde se pueda cancelar una
  reserva***
- [ ] agregar en el historial de reservas opción para calificar la cancha de 1 a
  5
- [ ] añadir boton de editar perfil

## ADMIN

## Dashboard

- [ ] que la información se llene del back
- [x] ***hacer que el boton de cerrar sesion funcione***
- [ ] agregar seccion en el sidebard para mi perfil del administrador
- [ ] ***cambiar "Resumen Ejecutivo del Dashboard" por "historial de
  reservas"***

## Reservas

- [ ] Que la etiqueta de las reservas tenga mas informacion sobre la reserva y
  botones de cancelar reserva.
- [ ] Boton de pago para la reserva: para saber si se ha hecho el pago restante
  y pasar la reserva a historial de reservas que esta en el dashboard
- [ ] Que se de mas información acorde a la cancha y con los estilos del modal
  de la cancha

### Canchas

- [ ] quitar categoria y dejar solo deporte
- [ ] quitar estado del modal de crear nueva cancha
- [ ] cambiar placeholder Nombre del Espacio: Ej: sintetica #1, Deporte: ej:
  Futbol 11
- [x] agregar ubicacion a la cancha (select de sedes integrado)

## Cliente

- [x] quitar boton de editar cliente

### Gestión

- [x] sección en el sidebar para gestionar sedes/ubicaciones (CRUD de sedes implementado)

## SEDES (Completado)

- [x] CRUD completo de sedes en panel administrador
- [x] Sidebar: Sedes antes de Canchas
- [x] Cards con labels: Ubicación, Dirección, Descripción
- [x] Modal crear sede
- [x] Modal editar sede
- [x] Modal ver detalle sede
- [x] Eliminar sede (toggle estado)

## Fixes realizados en esta sesion

- [x] Tokens expirados: apiClient.js limpia sesion en 401 y 403
- [x] Sedes no se reflejaban en canchas: re-renderizar canchas despues de CRUD sedes
- [x] Scroll al fondo: funcion conScrollPreservado() preserva posicion
- [x] Orden de items: findAll() con ORDER BY id ASC en locations y fields
- [x] Layout: Sedes antes de Canchas en sidebar y secciones HTML
- [x] Labels: "Sede:" cambiado a "Ubicación:" en cards, modales y formularios
- [x] Descripcion en cards: flex-direction column con gap para mejor legibilidad
