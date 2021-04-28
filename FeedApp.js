const opts = {
  limit: 100,
  reverse: true
}

pull(
  sbot.query.read(opts),
  pull.drain(receive)
)

function receive(msg) {
  root.innerHTML += `<textarea rows="16" cols="80">${JSON.stringify(msg, null, 2)}</textarea>`
}
