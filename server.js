const io = require('socket.io')(8000)

io.on('connection', socket => {
  socket.emit('message', "Hello there!")  
})