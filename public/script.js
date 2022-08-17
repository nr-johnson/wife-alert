const socket = io('https://staging.nrjohnson.net', {
    withCredentials: true
})

let msgTimeout
let sendTimout
// Adds event listeners and functions to all buttons on home page.
const btns = document.querySelectorAll('.alert-btn')
btns.length > 0 && btns.forEach(btn => {
    btn.addEventListener('click', event => {
        const click = document.getElementById('sndClick')
        click.currentTime = .15
        click.play()
        msgTimeout && clearTimeout(msgTimeout)
        sendTimout = window.setTimeout(() => {
            showMessage('Sending...', 3000)
        }, 1000)
        const level = parseInt(btn.getAttribute('data-level'))
        socket.emit('message', {level: level, id: socket.id})
        msgTimeout = window.setTimeout(() => {
            // Plays error sound twice
            const errSnd = document.getElementById('sndError')
            played = 0
            errSnd.currentTime = 0;
            errSnd.play()
            errSnd.addEventListener('ended', () => {
                if(played > 0) return
                errSnd.currentTime = 0
                errSnd.play()
                played++
            })
            // Sends error message
            showMessage('Server time out. Alert not received!', 20000)
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

        ['keypress', 'click'].forEach(evt => {
            document.addEventListener(evt, () => {
                socket.emit('acknowledged', data)
                clearInterval(ping)
                clearInterval(soundTimeout)
                main.classList = ''
                sound.pause()
                sound.currentTime = 0
                window.removeEventListener('keypress', () => {})
                message.innerHTML = ''
            })
        })
        

        ping = window.setInterval(() => {
            socket.emit('ping', data)
        }, 2500)      
    }
})

// Displays message to home page when the cave page sends the received "receipt"
let rep
socket.on('response', data => {
    timeout && clearInterval(timeout)
    sendTimout && clearTimeout(sendTimout)
    const sccsSnd = document.getElementById('sndSccs')
    sccsSnd.currentTime = 0
    sccsSnd.play()
    rep && clearTimeout(rep)
    clearTimeout(msgTimeout)
    btns.forEach(btn => {
        btn.parentNode.classList.remove('alert')
    })
    showResponse(data)
    showMessage(data.message, 5000)
})


socket.on('ping', data => {
    clearTimeout(rep)
    showResponse(data)
})

function showResponse(data) {
    if(data.level < 1) return
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
    const sound = document.getElementById('sndAckn')
    sound.currentTime = 0
    sound.play()
    showMessage(data.message, 20000)

    btns.forEach(btn => {
        btn.parentNode.classList.remove('alert')
    })
})

let history = []

let timeout
let loops
function showMessage(text, time, his) {
    const msg = document.getElementById('homeMessage').children[0]
    if(!msg) return
    clearTimeout(timeout)
    clearTimeout(loops)
    if(msg.innerHTML.length > 5) {
        clearMessage(text, time)
    } else {
        his ? text = '> ' + text : history = [text, ...history]
        msg.innerHTML = ''
        let i = 0
        function loop() {
            if(text[i] == '') {
                msg.innerHTML = msg.innerHTML + text[i]
                i++
                loop()
            } else {
                loops = window.setTimeout(() => {
                    clearTimeout(loops)
                    msg.innerHTML = msg.innerHTML + text[i]
                    i++
                    i < text.length ? loop() : timeout = window.setTimeout(() => {
                        clearMessage()
                    }, time)
                }, 50)
            }
        }
        loop()
    }
}
function clearMessage(text, time) {
    const msg = document.getElementById('homeMessage').children[0]
    clearTimeout(timeout)
    if(!msg || msg.innerHTML.length < 5) return
    let i = msg.innerHTML.length
    function loop() {
        if(i > -1) {
            loops = window.setTimeout(() => {
                msg.innerHTML = msg.innerHTML.substring(0,i)
                i--
                loop()
            }, 50)
        } else {
            clearTimeout(loops)
            text ? showMessage(text, time)
            : history.length > 0 ? msg.innerHTML = '<' : msg.innerHTML = ''
        }
    }
    loop()
}

function toggleMessage() {
    const msg = document.getElementById('homeMessage').children[0]
    if(msg.innerHTML.length > 5) {
        clearMessage()
    } else if(history.length > 0) {
        showMessage(history[0], 5000, true)
    }
}

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