const socket = io('https://staging.nrjohnson.net', {
    withCredentials: true
})

const btns = document.querySelectorAll('.alert-btn')
btns.length > 0 && btns.forEach(btn => {
    btn.addEventListener('click', event => {
        const level = parseInt(btn.getAttribute('data-level'))
        socket.emit('message', {level: level, id: socket.id})
    })
})

function sendMessage(event, form) {
    event.preventDefault()
    socket.emit('message', 'alert')
    document.getElementById('homeMessage').innerHTML = 'Sending...'
}

socket.on('chat-message', data => {
    console.log(data)
})

let soundTimeout

socket.on('alert', data => {
    const message = document.getElementById('message')
    clearTimeout(soundTimeout)
    if(message) {
        const sound = document.getElementById('wifeAlert')
        message.innerHTML = data.message 
        socket.emit('received', {level: data.message, to: data.from})
        sound.play()
        soundTimeout = window.setTimeout(() => {
            sound.pause()
            sound.currentTime = 0
        }, 20000)
    }
})

let timeout

socket.on('response', data => {
    timeout && clearInterval(timeout)
    const message = document.getElementById('homeMessage')
    message.innerHTML = data.message
    timeout = window.setTimeout(() => {
        document.getElementById('homeMessage').innerHTML = ''
    }, 5000)
})

function toggleCustomMessage(show) {
    const form = document.getElementById('customForm')
    if(show) {
        form.classList.add('show')
    } else {
        form.classList.remove('show')
        document.getElementById('customText').value = ''
    }
}

function sendCustomMessage(event, input) {
    event.preventDefault()
    socket.emit('message', {message: input.value, level: 0, from: socket.id})
    toggleCustomMessage(false)
}