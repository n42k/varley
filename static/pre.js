// pre.js: contains code that will be loaded before the client code
// being necessary for the correct initialization of the client


function _SpriteSheet(image, tileWidth, tileHeight) {
  this.width = tileWidth // the width of each sprite in pixels
  this.height = tileHeight // the height of each sprite in pixels

  this.ready = false
  this.rows = null
  this.columns = null
  this.clips = []

  this.image = new Image()
  this.image.src = image
  this.image.onload = function() {
    this.rows = this.image.height / this.height
    this.columns = this.image.width / this.width

    if(this.rows % 1 != 0 || this.columns % 1 != 0)
      throw new Error('Sheet(' + image + ', ' + tileWidth + ', ' + tileHeight + ') has invalid width/height!')

    this.ready = true

    for(let y = 0; y < this.rows; ++y)
    for(let x = 0; x < this.columns; ++x)
      this.clips.push([x * this.width, y * this.height])
  }.bind(this)
}

_SpriteSheet.prototype.draw = function(array, x, y) {
  this.drawA([array], 1, x, y)
}

_SpriteSheet.prototype.drawA = function(array, width, x, y) {
  if(!this.ready)
    return

  ctx.save()
  if(typeof y !== 'undefined')
    ctx.translate(Math.round(x), Math.round(y))

  let xPos = 0
  let yPos = -this.height
  for(let i = 0; i < array.length; ++i) {
    if((i % width) === 0) {
      xPos = 0
      yPos += this.height
    }

    let [clipX, clipY] = this.clips[array[i]]
    ctx.drawImage(this.image, clipX, clipY, this.width, this.height,
      xPos, yPos, this.width, this.height)
    xPos += this.width
  }
  ctx.restore()
}

_SpriteSheet.prototype.drawAA = function(array, x, y) {
  if(!this.ready)
    return

  ctx.save()
  if(typeof y !== 'undefined')
    ctx.translate(Math.round(x), Math.round(y))

  for(let y = 0; y < array.length; ++y)
  for(let x = 0; x < array[y].length; ++x) {
    let [clipX, clipY] = this.clips[array[y][x]]
    ctx.drawImage(this.image, clipX, clipY, this.width, this.height,
      x * this.width, y * this.height, this.width, this.height)
  }

  ctx.restore()
}

function Sheet(image, width, height) {
  return new _SpriteSheet(image, width, height)
}

var _beforeUpdate = []
var _afterUpdate = []
