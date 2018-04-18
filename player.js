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

  TopDownPlayer(characterSheet, options) {
    this.mov = {
      type: 'TopDownPlayer',
      characterSheet: characterSheet,
      vx: options.vx,
      vy: options.vy,
      animation: 0,
      playing: false,
      frameTime: options.frameTime,
      animationFrame: 0,
      walkAnimations: options.walkAnimations,
      world: options.world,
      tileSheet: options.tileSheet,
      blocks: options.blocks
    }

    this.frame = 0

    if(options.vx === undefined)
      this.mov.vx = 4

    if(options.vy === undefined)
      this.mov.vy = 4

    this.x = options.x
    if(options.x === undefined)
      this.x = 0

    this.y = options.y
    if(options.y === undefined)
      this.y = 0

    if(options.frameTime === undefined)
      this.mov.frameTime = 1

    function blocked(x, y) {
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

    this.tick = () => {
      let vx = 0
      if(this.keys.LEFT) vx -= this.mov.vx
      if(this.keys.RIGHT) vx += this.mov.vx

      let vy = 0
      if(this.keys.UP) vy -= this.mov.vy
      if(this.keys.DOWN) vy += this.mov.vy

      if(this.mov.walkAnimations) {
        let animation = this.mov.walkAnimations
        if(vx > 0)
          this.playAnimation(animation[2])
        else if(vx < 0)
          this.playAnimation(animation[0])
        else if(vy > 0)
          this.playAnimation(animation[3])
        else if(vy < 0)
          this.playAnimation(animation[1])
        else
          this.stopAnimation()
      }

      if(!(++this.mov.animationFrame < this.mov.frameTime
         || !this.mov.playing)) {
         let offset = this.mov.animation * this.mov.characterSheet.columns
         let frame = (++this.frame - offset) % this.mov.characterSheet.columns
         this.frame = offset + frame
         this.mov.animationFrame = 0
      }

      if(this.mov.world !== undefined
         && this.mov.tileSheet !== undefined
         && !blocked.bind(this)(this.x, this.y)) {
        while(Math.abs(vx) >= 1 || Math.abs(vy) >= 1) {
          if(vx !== 0) {
            let dVx = Math.abs(vx) / vx
            if(!blocked.bind(this)(this.x + dVx, this.y))
              vx -= dVx, this.x += dVx
            else vx = 0
          }

          if(vy !== 0) {
            let dVy = Math.abs(vy) / vy
            if(!blocked.bind(this)(this.x, this.y + dVy))
              vy -= dVy, this.y += dVy
            else vy = 0
          }
        }
      } else {
        this.x += vx
        this.y += vy
      }
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
}

Player.nextId = 0

module.exports = Player
