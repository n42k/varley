'use strict'

const fs = require('fs')
const vm = require('vm')

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

var players = []

module.exports = self => {
	const serverPath = __dirname + '/server.js'
	let serverCode = fs.readFileSync(serverPath)
	vm.runInThisContext.bind(self)(serverCode, serverPath)
	const sharedPath = 'shared.js'
	let sharedCode = fs.readFileSync(sharedPath)
	vm.runInThisContext.bind(self)(sharedCode, sharedPath)
	return this
}

exports.pub = {}

var callbacks = {
	'connect': [],
	'press': [],
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

		players.sort((a, b) => a.y - b.y)

		let toSend = JSON.stringify({pub: exports.pub, players: players})
		players.forEach(player => {
				let ws = player.ws
				if (ws.readyState === ws.OPEN)
					ws.send(JSON.stringify({player: player, all: toSend}))
		})
		}, 1000/tickRate)
	server.listen(port, () => console.log('Varley running on port ' + port + '!'))
}

wss.on('connection', ws => {
	let player = new Player(ws)
	players.push(player)

	console.log('Player ' + player.id + ' has connected!')

	callbacks['connect'].forEach(callback => callback(player))

	ws.on('message', msg => {
		let json = JSON.parse(msg)

		if(json.press) {
			player.keys[json.press] = true
			callbacks['press'].forEach(callback => callback(player, json.press))
		}

		if(json.release) {
			player.keys[json.release] = false
			callbacks['press'].forEach(callback => callback(player, json.release))
		}
	})

	ws.on('close', () => {
		let index = players.indexOf(player)
		if(index > -1) {
			players.splice(index, 1)
			callbacks['disconnect'].forEach(callback => callback(player))
		}

		console.log('Player ' + player.id + ' has disconnected!')
	})
})
