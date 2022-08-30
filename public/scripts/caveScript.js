let stat = 0

const socket = io(document.getElementById('url').innerHTML, {
	withCredentials: true
})

socket.on('off', path => {
    const light = document.getElementById('statusCont')
    if(path != 'home') return
    if(!light) return
    stat == 2 && log({msg: 'Home device disconnected', cls: 'err'})
    stat = 1
    light.classList = 'connected'  
})

socket.on('disconnect', path => {
    const light = document.getElementById('statusCont')

    if(!light) return
    stat = 0
    light.classList = 'offline'
    log({msg: 'Disconnected from server', cls: 'err'})
})

socket.on('cave-on', data => {
    const light = document.getElementById('statusCont')
    stat == 0 && log({msg: 'Connected to server', cls: 'great'})
    if(data <= 0) {
        light ? light.classList = 'connected' : null
        stat = 1
    } else if(data >= 1) {
        light ? light.classList = 'communicating' : null
        stat < 2 && log({msg: 'Home device detected', cls: 'great'})
        stat = 2
    }   
})

// Cave
socket.on('home-on', data => {
    const light = document.getElementById('statusCont')

    if(!light) return 
    if(light.classList.contains('communicating')) return
    stat == 1 && log({msg: 'Home device detected', cls: 'great'})

    stat = 2

    light.classList = 'communicating'
})

// Cave page on alert function.
let soundTimeout
let ping
let quietTimeout
socket.on('alert', data => {
    const message = document.getElementById('message') // Text div
    clearInterval(soundTimeout)
    clearInterval(ping)
    clearTimeout(quietTimeout)
    if(message) { // Checks for message. This will only be on the cave page.
        const main = document.getElementById('cave')
        const sound = document.getElementById('snd' + data.level)

        main.classList = (`alert lvl${data.level}`) // Flashing light animation.
        log([{msg: 'Message: '}, {msg: data.message, cls: 'lvl' + data.level}], true)
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
	
        quietTimeout = window.setTimeout(() => {
            clearInterval(soundTimeout)
            sound.currentTime = 0
            sound.pause()
        }, 30000)
    
        let events = ['keypress', 'touchstart']
        events.forEach(evnt => {
            document.addEventListener(evnt, () => {
                if(main.classList == '') return
                socket.emit('acknowledged', data)
                clearInterval(ping)
                clearInterval(soundTimeout)
                main.classList = ''
                sound.pause()
                sound.currentTime = 0
                document.removeEventListener(evnt, () => {})
                log({msg: 'Alert acknowledged'})
            })
        })
            
            

        ping = window.setInterval(() => {
            socket.emit('ping', data)
        }, 2500)      
    }
})

// Cave
socket.on('cancel', data => {
    const main = document.getElementById('cave')
    const message = document.getElementById('message') // Text div
    
    if(!main) return
    main.classList = ''

    clearTimeout(soundTimeout)

    const sounds = document.querySelectorAll('.alert-sound')
    sounds.forEach(snd => {
        console.log(snd.id)
        snd.currentTime = 0
        snd.pause()
    })

    clearInterval(ping)
    socket.emit('canceled')
    log({msg: 'Alert canceled.'})
})

function log(msg, arr) {
    const cont = document.querySelector('#message');
    const li = document.createElement('li')
    if(arr) {
        li.innerHTML = msg[0].msg
        msg[0].cls ? li.classList = msg[0].cls : null
        for(let i = 1; i < msg.length; i++) {
            const thisMsg = msg[i]
            const span = document.createElement('span')
            thisMsg.cls ? span.classList = thisMsg.cls : null
            span.innerHTML = thisMsg.msg
            li.append(span)
        }
        cont.appendChild(li)
    } else {
        msg.cls ? li.classList = msg.cls : null
        li.innerHTML = msg.msg
        cont.appendChild(li)
    }
    cont.scrollTop = cont.scrollHeight - cont.clientHeight;
}
