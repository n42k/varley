'use strict'

const fs = require('fs')
const vm = require('vm')

const express = require('express')
const app = express()
const staticFile = require('connect-static-file')
app.use('/client.js', staticFile('client.js'))
app.use('/shared.js', staticFile('shared.js'))
app.use(express.static(__dirname + '/static'))
app.use(express.static(__dirname + '/modules'))
app.use(express.static('resources'))

const WebSocket = require('ws')
const server = require('http').createServer(app)
const wss = new WebSocket.Server({ server })

const Game = require('./game')
const Lobby = require('./lobby')
var oldPlayers = []
exports.players = []

module.exports = self => {
	global.sizeOf = require('image-size')

	// server.js
	const serverPath = __dirname + '/server.js'
	let serverCode = fs.readFileSync(serverPath)
	vm.runInThisContext.bind(self)(serverCode, serverPath)

	// shared.js
	try {
		const sharedPath = 'shared.js'
		let sharedCode = fs.readFileSync(sharedPath)
		vm.runInThisContext.bind(self)(sharedCode, sharedPath)
	} catch(error) {
		// we're fine, no shared.js found
		// let's act as if there was an empty shared.js
	}

	// eshared.js (Engine Shared)
	const esharedPath = __dirname + '/static/eshared.js'
	let esharedCode = fs.readFileSync(esharedPath)
	vm.runInThisContext.bind(self)(esharedCode, esharedPath)
	return this
}

exports.pub = {}

var callbacks = {
	'start': [],
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

var game
var tickRate

function tick() {
	let start = Date.now()

	game.tick()

	let end = Date.now()
	let dt = (1000/tickRate) - (end - start)
	setTimeout(tick, dt)
}

exports.run = (args) => {
	if(args === undefined)
		args = {}

	tickRate = args.tickRate
	if(tickRate === undefined)
		tickRate = 10

	let port = args.port
	if(port === undefined)
		port = 8080

	if(args.matchmaking === undefined) {
		game = new Game(exports, callbacks)
		game.single = true
		game.start()
	} else {
		let [minPlayers, maxPlayers, minTime, maxTime] = args.matchmaking
		game = new Lobby(minPlayers, maxPlayers, minTime, maxTime, () => {
			return new Game(exports, callbacks)
		})
	}

	tick()

	server.listen(port, () => console.log('Varley running on port ' + port + '!'))
}

exports.module = (name, args) => {
	if(['chat'].indexOf(name) === -1)
		throw new Error('Invalid module: ' + name)

	callbacks[name] = []

	require('./modules/' + name)(exports, args)
}

var nextWS = 0
wss.on('connection', ws => {
	ws.id = nextWS++
	game.connect(ws)
	ws.on('message', msg => game.message(ws, msg))

	ws.on('close', () => game.disconnect(ws))
})
