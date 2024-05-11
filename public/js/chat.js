const socket = io()
const form = document.querySelector('form')
const inpEle = form.querySelector('input')
const buttonEle = form.querySelector('button')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const autoScroll = () => {
  //get the new message
  const newMessage = messages.lastElementChild

  //get the height of the last element
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  //visible height
  const visibleHeight = messages.offsetHeight

  //height of the messages container
  const containerHeight = messages.scrollHeight

  //how far have I scrolled
  const scrollOffset = messages.scrollTop + visibleHeight

  //check if the user is bottom or scrolled up
  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  buttonEle.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value
  socket.emit('sentMessage', message, (error) => {
    buttonEle.removeAttribute('disabled')
    inpEle.value = ''
    inpEle.focus()
    if (error) {
      return console.log(error)
    }

    console.log('Msg Delivered')
  })
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users,
  })
  document.querySelector('#sidebar').innerHTML = html
})
socket.on('message', (msg) => {
  console.log(msg)
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm:ss a'),
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('location', (location) => {
  console.log(location)
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format('h:mm a'),
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('your bowser does not support geolocation')
  }
  locationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    const coords = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    }
    socket.emit('sendLocation', coords, () => {
      locationButton.removeAttribute('disabled')
      console.log('Location is delivered')
    })
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
