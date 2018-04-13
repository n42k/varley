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
      vy: options.vy
    }

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

    this.tick = () => {
      let vx = 0
      if(this.keys.LEFT) vx -= this.mov.vx
      if(this.keys.RIGHT) vx += this.mov.vx
      this.x += vx

      let vy = 0
      if(this.keys.UP) vy -= this.mov.vy
      if(this.keys.DOWN) vy += this.mov.vy
      this.y += vy
    }
  }
}

Player.nextId = 0

module.exports = Player
