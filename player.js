'use strict'

const Interactible = require('./interactible')

const Player = class Player extends Interactible {
  constructor(ws) {
    super()
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

  playSound(filepath) {
    this.ws.send(JSON.stringify({sound: filepath}))
  }
}

Player.nextId = 0

module.exports = Player
