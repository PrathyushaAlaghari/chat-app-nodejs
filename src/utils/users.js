const users = []

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase()
  room = room.trim().toLowerCase()

  //validate the data
  if (!username || !room) {
    return {
      error: 'Please provide the details',
    }
  }
  //check for existing user in a room
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  if (existingUser) {
    return {
      error: 'User is already in use',
    }
  }

  const user = { id, username, room }
  users.push(user)
  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id
  })

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id
  })
  return user
}

const getUsersByRoom = (room) => {
  room = room.trim().toLowerCase()
  const usersOfRoom = users.filter((user) => {
    return user.room === room
  })

  return usersOfRoom
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersByRoom,
}
