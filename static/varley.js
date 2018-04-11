var canvas, ctx
var files = {}
var ws

function begin() {
  document.body.style.backgroundColor = PAGE_BG || 'black'

  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')

  let [width, height] = SIZE

  canvas.width = width
  canvas.height = height
  canvas.style.backgroundColor = CANVAS_BG || 'black'

  preloadNext()
}

var preload = PRELOAD
function preloadNext() {
  if(preload.length === 0) {
    init()
    return
  }

  let file = preload.shift()
  files[file] = new Image()
  files[file].src = file
  files[file].onload = preloadNext
}


function init() {
  ws = new WebSocket(document.URL.replace('http://', 'ws://').replace('https://', 'wss://'))

  ws.onmessage = function(msg) {
    let json = JSON.parse(msg.data)

    if(json.state) {
      canvas.width = canvas.width // clear canvas
      update(json.state)
    }
  }
}

function draw(x, y, image) {
  let img = files[image]
  if(img === undefined)
    return

  ctx.drawImage(img, x, y)
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
