'use strict'

const Player = class Player {
  constructor(ws) {
    this.id = Player.nextId++
    this.ws = ws
    this.keys = {}
  }

  disconnect() {
    this.ws.close()
  }

  toString() {
    return '' + this.id
  }

  toJSON() {
    let json = Object.assign({}, this)
    delete json.ws
    delete json.keys
    delete json.mov
    return json
  }

  PlatformerPlayer(characterSheet, options) {
    this.TopDownPlayer(characterSheet, options)
    this._setupPlayer(characterSheet, options)

    this.vx = 0
    this.vy = 0

    let gravity = options.gravity
    if(gravity === undefined)
      gravity = 1

    this.tick = () => {
      if((this.keys.LEFT && this.keys.RIGHT) || (!this.keys.LEFT && !this.keys.RIGHT)) {
        let dif = Math.abs(this.mov.ax) / this.mov.ax
        if(dif > 0) {
          this.vx -= dif
          if(this.vx < 0)
            this.vx = 0
        } else if(dif < 0) {
          this.vx += dif
          if(this.vx > 0)
            this.vx = 0
        }
      } else if(this.keys.LEFT)
        this.vx -= this.mov.ax
      else if(this.keys.RIGHT) this.vx += this.mov.ax

      if(this.keys.SPACE && this._blocked(this.x , this.y + 1))
        this.vy -= this.mov.ay

      this.vy += gravity

      this.vx = Math.max(-this.mov.vx, Math.min(this.mov.vx, this.vx))
      this.vy = Math.max(-this.mov.vy, Math.min(this.mov.vy, this.vy))

      this._tick()

      if(!this.mov.animations)
        return

      this.mov.animate()
    }

    this.mov.animate = () => {
      let animation = this.mov.animations

      let sum = 0
      if(Math.abs(this.mov.yMove) !== 0)
        sum = 2

      if(this.vx > 0)
        this.playAnimation(animation[0 + sum])
      else if(this.vx < 0)
        this.playAnimation(animation[1 + sum])
      else
        this.stopAnimation()

      this._animate()
    }
  }

  TopDownPlayer(characterSheet, options) {
    this._setupPlayer(characterSheet, options)

    this.tick = () => {
      this.vx = 0
      if(this.keys.LEFT) this.vx -= this.mov.vx
      if(this.keys.RIGHT) this.vx += this.mov.vx

      this.vy = 0
      if(this.keys.UP) this.vy -= this.mov.vy
      if(this.keys.DOWN) this.vy += this.mov.vy

      if(!this.mov.animations) {
        this._tick()
        return
      }

      let animation = this.mov.animations

      if(this.vx > 0)
        this.playAnimation(animation[2])
      else if(this.vx < 0)
        this.playAnimation(animation[0])
      else if(this.vy > 0)
        this.playAnimation(animation[3])
      else if(this.vy < 0)
        this.playAnimation(animation[1])

      this._tick()
      this.mov.animate()
    }

    this.mov.animate = () => {
      if(this.vx === 0 && this.vy === 0)
        this.stopAnimation()
      this._animate()
    }
  }

  playAnimation(id) {
    this.mov.playing = true

    if(this.frame === undefined ||
       id >= this.mov.characterSheet.rows ||
       id == this.mov.animation)
      return

    this.mov.animation = id
    this.frame = id * this.mov.characterSheet.columns
  }

  stopAnimation() {
    if(this.frame === undefined)
      return

    this.frame = this.mov.animation * this.mov.characterSheet.columns
    this.mov.playing = false
  }

  _setupPlayer(characterSheet, options) {
    this.mov = {
      type: 'TopDownPlayer',
      characterSheet: characterSheet,
      vx: options.vx,
      vy: options.vy,
      ax: options.ax,
      ay: options.ay,
      animation: 0,
      playing: false,
      frameTime: options.frameTime,
      animationFrame: 0,
      animations: options.animations,
      world: options.world,
      tileSheet: options.tileSheet,
      blocks: options.blocks
    }

    this.frame = 0

    if(options.vx === undefined)
      this.mov.vx = 4

    if(options.vy === undefined)
      this.mov.vy = 4

    if(options.ax === undefined)
      this.mov.ax = 1

    if(options.ay === undefined)
      this.mov.ay = 1

    this.x = options.x
    if(options.x === undefined)
      this.x = 0

    this.y = options.y
    if(options.y === undefined)
      this.y = 0

    if(options.frameTime === undefined)
      this.mov.frameTime = 1
  }

  _blocked(x, y) {
    let mov = this.mov

    let x1 = Math.floor(x / mov.tileSheet.width)
    let y1 = Math.floor(y / mov.tileSheet.height)
    let x2 = Math.floor((x + mov.characterSheet.width) / this.mov.tileSheet.width)
    let y2 = Math.floor((y + mov.characterSheet.height) / this.mov.tileSheet.height)

    let AIR = 0

    let row1 = mov.world[y1]

    if(row1 !== undefined &&
      (mov.blocks[row1[x1]] !== AIR || mov.blocks[row1[x2]] !== AIR))
      return true

    let row2 = mov.world[y2]

    if(row2 !== undefined &&
      (mov.blocks[row2[x1]] !== AIR || mov.blocks[row2[x2]] !== AIR))
      return true

    return false
  }

  _tick() {
    let vx = this.vx
    let vy = this.vy

    if(this.mov.world !== undefined
       && this.mov.tileSheet !== undefined
       && !this._blocked.bind(this)(this.x, this.y)) {
      while(Math.abs(vx) >= 1 || Math.abs(vy) >= 1) {
        if(vx !== 0) {
          let dVx = Math.abs(vx) / vx
          if(!this._blocked.bind(this)(this.x + dVx, this.y))
            vx -= dVx, this.x += dVx
          else {
            vx = 0
            this.vx = 0
          }
        }

        if(vy !== 0) {
          let dVy = Math.abs(vy) / vy
          if(!this._blocked.bind(this)(this.x, this.y + dVy))
            vy -= dVy, this.y += dVy
          else {
            vy = 0
            this.vy = 0
          }
        }
      }
    } else {
      this.x += vx
      this.y += vy
    }

    this.mov.xMove = this.vx - vx
    this.mov.yMove = this.vy - vy
  }

  _animate() {
    if(++this.mov.animationFrame < this.mov.frameTime || !this.mov.playing)
       return

     let offset = this.mov.animation * this.mov.characterSheet.columns
     let frame = (++this.frame - offset) % this.mov.characterSheet.columns
     this.frame = offset + frame
     this.mov.animationFrame = 0
  }
}

Player.nextId = 0

module.exports = Player
