// post: contains code that will be loaded after the client code

var canvas, ctx
var files = {}
var ws

var pub, player, players, t

function _update() {
    canvas.width = canvas.width // clear canvas

    for(let func of _beforeUpdate)
      func()

    ctx.save()
    update()
    ctx.restore()

    for(let func of _afterUpdate)
      func()
}

function _onmessage(json) {
  if(json.lobby) {
    let lobby = json.lobby

    ctx.fillStyle = '#ccc'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#000'
    ctx.font = '20px Arial'
    ctx.fillText(
      'You are in position ' + lobby.position + ' in the queue.', 10, 30)
    ctx.fillText(
      'There are ' + lobby.playersInQueue + ' players in the queue.', 10, 50)
    ctx.fillText(
      'There are ' + lobby.players +
      ' players playing in ' + lobby.games + ' games.', 10, 70)
    ctx.fillText(
      'Time left to start game: ' + lobby.timeRemaining, 10, 90)

    return
  }

  if(json.all && json.player) {
    let all = JSON.parse(json.all)

    if(all.t)
      t = all.t
    else
      throw new Error('No t in json!')

    player = json.player

    if(all.pub && all.players) {
      pub = all.pub
      players = all.players
    } else if(all.pubDiff) {
      pub = jsondiffpatch.patch(pub, all.pubDiff)
      players = jsondiffpatch.patch(players, all.playersDiff)
      _update()
    }
  }
}

function _begin() {
  document.body.style.backgroundColor = PAGE_BG || 'black'

  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')

  let [width, height] = SIZE

  canvas.width = width
  canvas.height = height
  canvas.style.backgroundColor = CANVAS_BG || 'black'

  ws = new WebSocket(document.URL
    .replace('http://', 'ws://')
    .replace('https://', 'wss://'))

  ws.onmessage = function(msg) {
    let json = JSON.parse(msg.data)
    _onmessage(json)
  }

  ws.onclose = _begin
}

function drawImage(x, y, image) {
  let img = files[image]
  if(img === null)
    return
  else if(img === undefined) {
    files[image] = null
    let imageObject = new Image()
    imageObject.src = image
    imageObject.onload = function() {
      files[image] = imageObject
    }
  }

  ctx.drawImage(img, Math.round(x), Math.round(y))
}

function drawRect(x, y, width, height, color) {
  if(color === undefined)
    return

  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height))
}

let keyChanges = {
  ArrowLeft: 'LEFT',
  ArrowUp: 'UP',
  ArrowRight: 'RIGHT',
  ArrowDown: 'DOWN',
  ' ': 'SPACE'
}

document.onkeydown = function(e) {
    e = e || window.event

    let key = e.key
    if(keyChanges[e.key] !== undefined)
      key = keyChanges[e.key]
    else if(e.key.length > 1)
      key = e.key.toUpperCase()

    ws.send(JSON.stringify({press: key}))
}

document.onkeyup = function(e) {
    e = e || window.event;

    let key = e.key
    if(keyChanges[e.key] !== undefined)
      key = keyChanges[e.key]
    else if(e.key.length > 1)
      key = e.key.toUpperCase()

    ws.send(JSON.stringify({release: key}))
}

function camera(x, y) {
  ctx.translate(Math.round(-x + SIZE[0]/2), Math.round(-y + SIZE[1]/2))
}

function gui(x, y) {
  ctx.restore()
  ctx.save()
}

function drawText(string, x, y, color, textAlignment, font) {
  if(font === undefined)
    ctx.font = '20px Arial'
  else
    ctx.font = font

  if(textAlignment === undefined)
    ctx.textAlign = 'left'
  else
    ctx.textAlign = textAlignment

  if(color === undefined)
    ctx.fillStyle = 'white'
  else
    ctx.fillStyle = color

  ctx.fillText(string, x, y)
}
