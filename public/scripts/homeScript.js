let stat = 0

const socket = io(document.getElementById('url').innerHTML, {
	withCredentials: true
})

socket.on('off', path => {
    const light = document.getElementById('statusCont')
    if(path != 'cave') return
    if(!light) return
    stat = 1
    light.classList = 'connected'
    updateThinking('Waiting', true)
})

// home
socket.on('disconnect', path => {
    const light = document.getElementById('statusCont')

    if(!light) return
    stat = 0
    light.classList = 'offline'
    updateThinking('Trying to connect', true)
})

socket.on('home-on', data => {
    const light = document.getElementById('statusCont')
    if(data <= 0) {
        light ? light.classList = 'connected' : null
        stat = 1
        updateThinking('Waiting', true)
    } else {
        light ? light.classList = 'communicating' : null
        stat = 2
        updateThinking('Connected', false)
    }
    
    
})

// Home
socket.on('cave-on', () => {
    const light = document.getElementById('statusCont')

    if(!light) return
    stat = 2
    light ? light.classList = 'communicating' : null

    updateThinking('Connected', false)
})

// Home
let msgTimeout
let sendTimout
// Adds event listeners and functions to all buttons on home page.
const btns = document.querySelectorAll('.alert-btn')
btns.length > 0 && btns.forEach(btn => {
    if(btn.id == 'customBtnCont') return
    btn.addEventListener('click', event => {
        if(stat < 2) {
            const click = document.getElementById('sndBdClick')
            click.currentTime = 0
            click.play()
        } else {
            const click = document.getElementById('sndGdClick')
            click.currentTime = .15
            click.play()

            if(btn.parentNode.classList.contains('alert')) {
                showMessage('Canceling Alert...')
                socket.emit('cancel', {level: btn.getAttribute('data-level')})
            } else {
                btns.forEach(bt => {
                    bt.parentNode.classList.remove('alert')
                })
                document.getElementById('customBtnCont').classList.remove('alert')

                msgTimeout && clearTimeout(msgTimeout)
                sendTimout = window.setTimeout(() => {
                    showMessage('Sending...', 3000)
                }, 500)
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
            }
        }
    })
})

// Cave page on alert function.
let soundTimeout
let ping
let quietTimeout

// Home
socket.on('canceled', () => {
    if(!document.getElementById('homeMain')) return

    clearTimeout(msgTimeout)
    timeout && clearInterval(timeout)
    
    window.setTimeout(() => {
        const sound = document.getElementById('sndAckn')
        sound.currentTime = 0
        sound.play()
    }, 500)
    

    btns.forEach(btn => {
        btn.classList.remove('alert')
        btn.parentNode.classList.remove('alert')
    })
    showMessage('Alert canceled.', 5000)
})

// Home
// Displays message to home page when the cave page sends the received "receipt"
let rep
socket.on('response', data => {
    timeout && clearInterval(timeout)
    sendTimout && clearTimeout(sendTimout)
    window.setTimeout(() => {
        const sccsSnd = document.getElementById('sndSccs')
        sccsSnd.currentTime = 0
        sccsSnd.play()
    }, 1000)
    
    rep && clearTimeout(rep)
    clearTimeout(msgTimeout)
    // btns.forEach(btn => {
    //     btn.classList.remove('alert')
    //     btn.parentNode.classList.remove('alert')
    // })
    showResponse(data)
    showMessage(data.message, 5000)
})

// Home
socket.on('ping', data => {
    clearTimeout(rep)
    showResponse(data)
})

// Home
function showResponse(data) {
    if(data.level < 1) return
    document.getElementById('btn' + data.level).classList.add('alert')
    rep = window.setTimeout(() => {
        btns.forEach(btn => {
            btn.parentNode.classList.remove('alert')
        })
    }, 5000)
}

// Home
socket.on('acknowledged', data => {
    console.log('here')
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

// Home
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
// Home
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

// Home
function toggleMessage() {
    const msg = document.getElementById('homeMessage').children[0]
    if(msg.innerHTML.length > 5) {
        clearMessage()
    } else if(history.length > 0) {
        showMessage(history[0], 5000, true)
    }
}

// Home
// Shows button legend on home page.
function toggleInfo(show) {
    const click = document.getElementById('sndGdClick')
    click.currentTime = 0
    click.play()
    const info = document.getElementById('info')
    show ? info.classList.add('show') : info.classList.remove('show')
}

// Home
// Toggles text box for sending a custom message.
function toggleCustomMessage(but, show) {
    if(but.classList.contains('alert')) {
        showMessage('Canceling Alert...')
        socket.emit('cancel', {level: 0})
    } else {
        const click = document.getElementById('sndGdClick')
        click.currentTime = 0
        click.play()
        const form = document.getElementById('customForm')
        if(show) {
            form.classList.add('show')
        } else {
            form.classList.remove('show')
            document.getElementById('customText').value = ''
        }
    }
    
}

// Home
// Sends alert with a custom message.
function sendCustomMessage(event, input) {
    event.preventDefault()
    btns.forEach(btn => {
        btn.parentNode.classList.remove('alert')
    })
    if(stat < 2 || input.value == '') {
        const click = document.getElementById('sndBdClick')
        click.currentTime = 0
        click.play()
    } else {
        const btn = document.getElementById('customBtnCont')
        btn.classList.add('alert')
        socket.emit('message', {message: input.value, level: 0, from: socket.id})
        toggleCustomMessage(input, false)
    }
    
}

let thinkInterval
document.getElementById('statusCont') && updateThinking('Trying to connect', true)
function updateThinking(status, thinking) {
    const update = document.getElementById('statusText')
    clearInterval(thinkInterval)
    update.innerHTML = status
    if(!thinking) return
    let i = 0
    thinkInterval = window.setInterval(() => {
        if(i > 2) {
            i = 0
            update.innerHTML = status
        } else {
            update.innerHTML = update.innerHTML + '.'
            i++
        }
    }, 500)
}