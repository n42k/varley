'use strict'

const fs = require('fs')
const vm = require('vm')

const jsondiffpatch = require('jsondiffpatch').create();

const express = require('express')
const app = express()
const staticFile = require('connect-static-file')
app.use('/client.js', staticFile('client.js'))
app.use('/shared.js', staticFile('shared.js'))
app.use(express.static(__dirname + '/static'))
app.use(express.static('resources'))

const WebSocket = require('ws')
const server = require('http').createServer(app)
const wss = new WebSocket.Server({ server })

const Player = require('./player')

var oldPlayers = []
var players = []

module.exports = self => {
	global.sizeOf = require('image-size')
	const serverPath = __dirname + '/server.js'
	let serverCode = fs.readFileSync(serverPath)
	vm.runInThisContext.bind(self)(serverCode, serverPath)
	const sharedPath = 'shared.js'
	let sharedCode = fs.readFileSync(sharedPath)
	vm.runInThisContext.bind(self)(sharedCode, sharedPath)
	return this
}

var oldPub = {}
exports.pub = {}

var callbacks = {
	'connect': [],
	'press': [],
	'release': [],
	'playertick': [],
	'tick': [],
	'disconnect': []
}

exports.on = (name, callback) => {
	try {
		callbacks[name].push(callback)
	} catch(_) {
		throw new Error('Invalid varley.on(): varley.on(\'' + name + '\', ...)')
	}
}

function update() {
	players.sort((a, b) => a.y - b.y)

	let newPub = JSON.parse(JSON.stringify(exports.pub))
	let newPlayers = JSON.parse(JSON.stringify(players))

	let toSend = JSON.stringify({
		pubDiff: jsondiffpatch.diff(oldPub, newPub),
		playersDiff: jsondiffpatch.diff(oldPlayers, newPlayers)
	})

	players.forEach(player => {
			let ws = player.ws
			if (ws.readyState === ws.OPEN)
				ws.send(JSON.stringify({player: player, all: toSend}))
	})

	oldPub = newPub
	oldPlayers = newPlayers
}

exports.run = (port, tickRate) => {
	setInterval(() => {
		callbacks['tick'].forEach(callback => callback())

		players.forEach(player => {
			if(player.tick)
				player.tick()
		})

		callbacks['playertick'].forEach(callback => {
			players.forEach(player => callback(player))
		})

		update()
		}, 1000/tickRate)
	server.listen(port, () => console.log('Varley running on port ' + port + '!'))
}

wss.on('connection', ws => {
	let player = new Player(ws)
	console.log('Player ' + player.id + ' has connected!')

	let toSend = JSON.stringify({pub: exports.pub, players: players})
	ws.send(JSON.stringify({player: player, all: toSend}))

	players.push(player)

	callbacks['connect'].forEach(callback => callback(player))
	update()

	ws.on('message', msg => {
		let json = JSON.parse(msg)

		if(json.press) {
			player.keys[json.press] = true
			callbacks['press'].forEach(callback => callback(player, json.press))
		}

		if(json.release) {
			player.keys[json.release] = false
			callbacks['release'].forEach(callback => callback(player, json.release))
		}
	})

	ws.on('close', () => {
		let index = players.indexOf(player)
		if(index > -1) {
			players.splice(index, 1)
			callbacks['disconnect'].forEach(callback => callback(player))
		}

		console.log('Player ' + player.id + ' has disconnected!')
		update()
	})
})
