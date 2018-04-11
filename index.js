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

var nextId = 0;
var shared = {}
var players = []

module.exports = self => {
	const path = 'shared.js'
	var code = fs.readFileSync(path)
	vm.runInThisContext.bind(self)(code, path)
	return this
}

// Sets a shared variable named *name* within the group *group* to value
exports.pub = (name, value) => {
	if(value === undefined)
		return shared[name]

	shared[name] = value
}

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
		for(let callback in callbacks['tick'])
			callbacks['tick'][callback]()
		for(let callback in callbacks['playertick'])
		for(let player in players) {
			callbacks['playertick'][callback](players[player])
		}

		let toSend = JSON.stringify({state: shared})
		for(let player in players) {
			let ws = players[player].ws
			if (ws.readyState === ws.OPEN)
				ws.send(toSend)
		}
		}, 1000/tickRate)
	server.listen(port, () => console.log('Varley running on port ' + port + '!'))
}

wss.on('connection', ws => {
	let player = new Player(ws)
	players.push(player)

	console.log('Player ' + player.id + ' has connected!')

	for(let callback in callbacks['connect'])
		callbacks['connect'][callback](player)

	ws.on('message', msg => {
		let json = JSON.parse(msg)
		if(json.press)
			for(let callback in callbacks['press'])
				callbacks['press'][callback](player, json.press)
	})

	ws.on('close', () => {
		let index = players.indexOf(player)
		if(index > -1)
			players.splice(index, 1)
			for(let callback in callbacks['disconnect'])
				callbacks['disconnect'][callback](player)

		console.log('Player ' + player.id + ' has disconnected!')
	})
})
