# Wife Alert App

## The *WHAT* Alert App?
Despite what the name may seem to imply, this is not an app to warn me about my wife's imminent arrival. Rather it is a way for my wife to send me alerts that request my presence with different levels of urgency.

## Why Though?
We have been rearranging rooms lately and I finally managed to snag one of them as my tech room (or man cave). It was difficult enough to get my attention when the computer was in the living room so my wife requested that I build a way for her to easily get in touch while I am upstairs. And so the Wife Alert App was born.

## How It Works
The system is desined to have two interfaces, one in the house living room and one in my tech room. The living room interface (my wife's old android running in kiosk mode) has a set of buttons that when pressed will send an alert to the server using web sockets. The alert is then broadcast to the interface in my tech room (an old laptop running ubuntu server with xorg). The tech room interface will then flash and play an alert sound, both of which vary based on the alert level. I can then press any key to acknowledge the alert, which will reset both interfaces.

The app is a Node.js web app with two landing pages: `/` and `/cave`

`/` is the living room interface that sends alerts to the `/cave` interface.

---
## Key Features

### Instant Notifications:
The app uses the Socket.io module. This allows for near instant communication between both interfaces.

### Intuitive Sent an Receipt Feedback:
The buttons have an intuitive look and feel with a snappy response to input. When one is pressed the tech room will begin sending a ping back to the living room interface. So long as that ping is being received the button that was pressed will flash. This cleary communicates that the alert is currently playing on the tech room screen.

Text is also displayed on the living room interface to communicate each action (i.e. Alert Received, Alert Acknowledged, Server Timed Out, etc.).

### Custom Alert Message:
The living room interface has the option of sending an alert with custom text. This will flash blue and play it's own sound in the tech room.

---
## You may use my code if you wish

If you find my work helpful, feel free to use it!