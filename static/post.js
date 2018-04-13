// post: contains code that will be loaded after the client code

var canvas, ctx
var files = {}
var ws

var pub, player, players

function _begin() {
  document.body.style.backgroundColor = PAGE_BG || 'black'

  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')

  let [width, height] = SIZE

  canvas.width = width
  canvas.height = height
  canvas.style.backgroundColor = CANVAS_BG || 'black'

  ws = new WebSocket(document.URL.replace('http://', 'ws://').replace('https://', 'wss://'))

  ws.onmessage = function(msg) {
    let json = JSON.parse(msg.data)

    if(json.all && json.player) {
      canvas.width = canvas.width // clear canvas
      ctx.save()

      let all = JSON.parse(json.all)
      pub = all.pub
      players = all.players
      player = json.player
      update()
      ctx.restore()
    }
  }
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

var keys = {
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
}

document.onkeydown = function(e) {
    e = e || window.event;
    ws.send(JSON.stringify({press: keys[e.keyCode]}))
}

document.onkeyup = function(e) {
    e = e || window.event;
    ws.send(JSON.stringify({release: keys[e.keyCode]}))
}

function camera(x, y) {
  ctx.translate(Math.round(-x + SIZE[0]/2), Math.round(-y + SIZE[1]/2))
}
