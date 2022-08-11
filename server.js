const express = require('express')
const path = require('path')
const app = express()
const server= require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: { origin: "*" }
})

app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, '/public')))

app.get('/home', (req, res) => {
  res.render('index')
})

app.get('/cave', (req, res) => {
  res.render('cave')
})

io.on('connection', socket => {
  console.log('New log in')
  socket.on("message", data => {
    socket.broadcast.emit('alert', 'Warning! The wife wants you!')
  })
})

const PORT = process.env.PORT || 8000

server.listen(PORT, () => { console.log(`Server running on port ${PORT}`) })