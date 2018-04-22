'use strict'

const sloppydiff = require('sloppydiff')

const Player = require('./player')

const Game = class Game {
  constructor(varley, callbacks) {
    this.callbacks = callbacks
    this.varley = varley

    this.oldPub = {}
    this.pub = {}

    this.oldPlayers = []
    this.players = []

    this.wsToPlayer = {}
    this.id = Game.nextId++

    // if true, this is a single game, with no lobby involved
    this.single = false
  }

  start() {
    this._initVars()
    this.pub.modules = {}
    this.callbacks['start'].forEach(callback => callback())
  }

  connect(ws) {
  	let player = new Player(ws)
    if(this.single)
      console.log('' + player.id + '> Player connected!')

    this.wsToPlayer[ws.id] = player.id

    this.players.push(player)

  	let toSend = JSON.stringify({
      pub: this.oldPub,
      players: this.oldPlayers,
      t: Date.now()
    })

  	ws.send(JSON.stringify({player: player, all: toSend}))

    this._initVars()
    this.callbacks['connect'].forEach(callback => callback(player))
  }

  disconnect(ws) {
    let player = this._getPlayerFromWS(ws)
    if(this.single)
      console.log('' + player.id + '< Player disconnected!')
    if(player === null)
      return

		let index = this.players.indexOf(player)
		if(index > -1) {
			this.players.splice(index, 1)
      this._initVars()
			this.callbacks['disconnect'].forEach(callback => callback(player))
		}
  }

  message(ws, msg) {
    let player = this._getPlayerFromWS(ws)

    if(player === null)
      return

		let json = JSON.parse(msg)

    this._initVars()

		if(json.press) {
			player.keys[json.press] = true
			this.callbacks['press'].forEach(callback =>
        callback(player, json.press))
		}

		if(json.release) {
			player.keys[json.release] = false
			this.callbacks['release'].forEach(callback =>
        callback(player, json.release))
		}

    for(let k in json) {
      if(this.callbacks[k] === undefined)
        continue

      this.callbacks[k].forEach(callback => callback(player, json[k]))
    }
  }

  tick() {
    this._initVars()
		this.callbacks['tick'].forEach(callback => callback())

		this.players.forEach(player => {
			if(player.tick)
				player.tick()
		})

		this.callbacks['playertick'].forEach(callback => {
			this.players.forEach(player => callback(player))
		})

		this._update()
  }

  _update() {
  	this.players.sort((a, b) => a.y - b.y)

  	let newPub = JSON.parse(JSON.stringify(this.pub))
  	let newPlayers = JSON.parse(JSON.stringify(this.players))

    let pubDiff = sloppydiff.diff(this.oldPub, newPub)
    let playersDiff = sloppydiff.diff(this.oldPlayers, newPlayers)

  	let toSend = JSON.stringify({
  		pubDiff: pubDiff,
      playersDiff: playersDiff,
      t: Date.now()
  	})

  	this.players.forEach(player => {
  			let ws = player.ws
  			if (ws.readyState === ws.OPEN)
  				ws.send(JSON.stringify({player: player, all: toSend}))
  	})

  	this.oldPub = newPub
  	this.oldPlayers = newPlayers
  }

  _playSound(filepath) {
    this.players.forEach(player => player.playSound(filepath))
  }

  _initVars() {
    this.varley.pub = this.pub
    this.varley.players = this.players
    this.varley.playSound = this._playSound
  }

  _getPlayerFromWS(ws) {
    let id = this.wsToPlayer[ws.id]

    for(let i = 0; i < this.players.length; ++i)
      if(this.players[i].id == id)
        return this.players[i]
    return null
  }
}

Game.nextId = 0

module.exports = Game
