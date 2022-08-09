const socket = io('http://locahost:3000')

socket.on('message', data => {
    console.log(data)
})