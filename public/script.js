const socket = io('http://localhost:8000', {
    withCredentials: true
})

const sendMessage = (event, form) => {
    event.preventDefault()
    socket.emit('message', 'alert')
}

socket.on('chat-message', data => {
    console.log(data)
})

socket.on('alert', data => {
    document.getElementById('message').innerHTML = data
})