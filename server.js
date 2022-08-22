require('dotenv').config()

const express = require('express')
const path = require('path')
const app = express()
const server= require('http').createServer(app)
const URL = require('url')
const io = require('socket.io')(server, {
  cors: { origin: "*" }
})

let caveOn = false

app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, '/public')))

app.get('/', (req, res) => {
  res.render('index', {
    url: process.env.URL
  })
})

app.get('/cave', (req, res) => {
  res.render('cave', {
    url: process.env.URL
  })
})

io.on('connection', socket => {
  let urlPath = URL.parse(socket.handshake.headers.referer).pathname
  if(urlPath == '/') {
    console.log("Home Online")
    urlPath = 'home'
    socket.emit('home-on')
  } else if(urlPath == '/cave') {
    console.log("Cave Online")
    urlPath = 'cave'
    socket.emit('cave-on')
    caveOn = true
  }
  

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
      case 0:
        socket.broadcast.emit('alert', data)
    }
  })

  socket.on('received', data => {
    socket.broadcast.to(data.to).emit('response', {level: data.level, message: `Level ${data.level} alert delivered!`})
  })
  socket.on('ping', data => {
    socket.broadcast.to(data.from).emit('ping', data)
  })
  socket.on('acknowledged', data => {
    data.message = 'Alert has been acknowledged.'
    socket.broadcast.to(data.from).emit('acknowledged', data)
  })

  urlPath == 'home' && setInterval(() => {
    caveOn ? socket.emit('cave-on') : socket.emit('off', 'cave')
  }, 4000)

  socket.on('disconnect', () => {
    console.log(`${urlPath}-off`)
    if(urlPath != 'cave') return
    caveOn = false
  })

})



const PORT = process.env.PORT || 8500

server.listen(PORT, () => { console.log(`Server running on port ${PORT}`) })
