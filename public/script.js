const socket = io('https://staging.nrjohnson.net', {
    withCredentials: true
})

let msgTimeout

// Adds event listeners and functions to all buttons on home page.
const btns = document.querySelectorAll('.alert-btn')
btns.length > 0 && btns.forEach(btn => {
    btn.addEventListener('click', event => {
        msgTimeout && clearTimeout(msgTimeout)
        const level = parseInt(btn.getAttribute('data-level'))
        socket.emit('message', {level: level, id: socket.id})
        msgTimeout = window.setTimeout(() => {
            const message = document.getElementById('homeMessage')
            message.innerHTML = 'Server time out. Alert not received!'
        }, 5000)
    })
})

// Cave page on alert function.
let soundTimeout
let ping
socket.on('alert', data => {
    const message = document.getElementById('message') // Text div
    clearTimeout(soundTimeout)
    clearInterval(soundTimeout)
    clearInterval(ping)
    if(message) { // Checks for message. This will only be on the cave page.
        const main = document.getElementById('cave')
        const sound = document.getElementById('snd' + data.level)

        main.classList = (`alert lvl${data.level}`) // Flashing light animation.
        message.innerHTML = data.message 
        socket.emit('received', {level: data.level, to: data.from}) // Send received "receipt"
        
        sound.currentTime = 0
        sound.play()

        // Sets audio timing based on which sound is played.
        switch (data.level) {
            case 0:
            case 1:
            case 4:
                soundTimeout = window.setInterval(() => {
                    sound.currentTime = 0
                    sound.play()
                }, 2500)
                break
            case 2:
            case 3:
                soundTimeout = window.setInterval(() => {
                    sound.currentTime = 0
                    sound.play()
                }, 5000)
                break

        }

        document.addEventListener('keypress', e => {
            socket.emit('acknowledged', data)
            clearInterval(ping)
            clearInterval(soundTimeout)
            main.classList = ''
            sound.pause()
            sound.currentTime = 0
            window.removeEventListener('keypress', () => {})
        })

        ping = window.setInterval(() => {
            socket.emit('ping', data)
        }, 2500)      
    }
})

// Displays message to home page when the cave page send received "receipt"
let timeout
let rep
socket.on('response', data => {
    timeout && clearInterval(timeout)
    rep && clearTimeout(rep)
    clearTimeout(msgTimeout)
    const message = document.getElementById('homeMessage')
    btns.forEach(btn => {
        btn.parentNode.classList.remove('alert')
    })
    showResponse(data)
    message.innerHTML = data.message
    timeout = window.setTimeout(() => {
        document.getElementById('homeMessage').innerHTML = ''
    }, 5000)
})


socket.on('ping', data => {
    clearTimeout(rep)
    console.log('ping')
    showResponse(data)
})

function showResponse(data) {
    document.getElementById('btn' + data.level).classList.add('alert')
    rep = window.setTimeout(() => {
        btns.forEach(btn => {
            btn.parentNode.classList.remove('alert')
        })
    }, 5000)
}

socket.on('acknowledged', data => {
    clearTimeout(msgTimeout)
    timeout && clearInterval(timeout)
    const message = document.getElementById('homeMessage')
    message.innerHTML = data.message
    timeout = window.setTimeout(() => {
        document.getElementById('homeMessage').innerHTML = ''
    }, 20000)

    btns.forEach(btn => {
        btn.parentNode.classList.remove('alert')
    })
})

// Shows button legend on home page.
function toggleInfo(show) {
    const info = document.getElementById('info')
    show ? info.classList.add('show') : info.classList.remove('show')
}

// Toggles text box for sending a custom message.
function toggleCustomMessage(show) {
    const form = document.getElementById('customForm')
    if(show) {
        form.classList.add('show')
    } else {
        form.classList.remove('show')
        document.getElementById('customText').value = ''
    }
}

// Sends alert with a custom message.
function sendCustomMessage(event, input) {
    event.preventDefault()
    socket.emit('message', {message: input.value, level: 0, from: socket.id})
    toggleCustomMessage(false)
}