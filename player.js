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

  TopDownPlayer(characterSheet, world, tileSheet, options) {
    this.mov = {
      type: 'TopDownPlayer',
      characterSheet: characterSheet,
      world: world,
      tileSheet: tileSheet,
      vx: options.vx,
      vy: options.vy,
      animation: 0,
      playing: false,
      frameTime: options.frameTime,
      animationFrame: 0,
      walkAnimations: options.walkAnimations
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

    this.tick = () => {
      let vx = 0
      if(this.keys.LEFT) vx -= this.mov.vx
      if(this.keys.RIGHT) vx += this.mov.vx
      this.x += vx

      let vy = 0
      if(this.keys.UP) vy -= this.mov.vy
      if(this.keys.DOWN) vy += this.mov.vy
      this.y += vy

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

      if(++this.mov.animationFrame < this.mov.frameTime || !this.mov.playing)
        return

      let offset = this.mov.animation * this.mov.characterSheet.columns
      let frame = (++this.frame - offset) % this.mov.characterSheet.columns
      this.frame = offset + frame
      this.mov.animationFrame = 0
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
