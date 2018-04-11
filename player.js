'use strict'

const Player = class Player {
  constructor(ws) {
    this.id = Player.nextId++
    this.ws = ws
  }

  disconnect() {
    this.ws.close()
  }

  toString() {
    return '' + this.id
  }
}

Player.nextId = 0

module.exports = Player
