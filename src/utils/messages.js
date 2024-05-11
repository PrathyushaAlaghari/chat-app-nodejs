const generateMessageObj = (username, text) => {
  return {
    username: username,
    text: text,
    createdAt: new Date().getTime(),
  }
}

const generateLocationObj = (username, url) => {
  return {
    username: username,
    url: url,
    createAt: new Date().getTime(),
  }
}

module.exports = {
  generateMessageObj,
  generateLocationObj,
}
