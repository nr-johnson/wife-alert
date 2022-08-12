const express = require('express')
const path = require('path')
const app = express()
const server= require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: { origin: "*" }
})

let users= []

app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, '/public')))

app.get('/home', (req, res) => {
  res.render('index')
})

app.get('/cave', (req, res) => {
  res.render('cave')
})

io.on('connection', socket => {
  users.push(socket.id)
  console.log(`User with id: ${socket.id}`)

  socket.on("message", data => {
    switch (data.level) {
      case 1:
        socket.broadcast.emit('alert', {level: 1, message: 'Come when you can', from: data.id})
        break
      case 2:
        socket.broadcast.emit('alert', {level: 2, message: "I can't continue without you.", from: data.id})
        break
      case 3:
        socket.broadcast.emit('alert', {level: 3, message: 'I need you ASAP.', from: data.id})
        break
      case 4:
        socket.broadcast.emit('alert', {level: 4, message: 'Someone is about to die!', from: data.id})
        break
      default:
        socket.broadcast.emit('alert', data)
    }
  })

  socket.on('received', data => {
    socket.broadcast.to(data.to).emit('response', {message: `Level ${data.level} alert delivered!`})
  })
})

const PORT = process.env.PORT || 8500

server.listen(PORT, () => { console.log(`Server running on port ${PORT}`) })