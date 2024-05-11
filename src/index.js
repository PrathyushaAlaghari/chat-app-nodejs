const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessageObj, generateLocationObj } = require('./utils/messages')
const {
  addUser,
  removeUser,
  getUser,
  getUsersByRoom,
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })
    if (error) {
      return callback(error)
    }
    socket.join(user.room)

    socket.emit('message', generateMessageObj('Admin', 'Welcome!'))
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessageObj('Admin', `${user.username} has joined`)
      )

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersByRoom(user.room),
    })

    callback()
  })

  socket.on('sentMessage', (msg, callback) => {
    const user = getUser(socket.id)
    if (user) {
      const filter = new Filter()
      if (filter.isProfane(msg)) {
        return callback('Profanity is not allowed')
      }
      io.to(user.room).emit('message', generateMessageObj(user.username, msg))
      callback()
    }
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessageObj('Admin', `${user.username} has left! `)
      )
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersByRoom(user.room),
      })
    }
  })

  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'location',
      generateLocationObj(
        user.username,
        `https://google.com/maps?q=${location.lat},${location.lon}`
      )
    )

    callback()
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})
