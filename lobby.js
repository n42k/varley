const Lobby = class Lobby {
  constructor(minPlayers, maxPlayers, minTime, maxTime, newGameFunction) {
    this.minPlayers = minPlayers
    this.maxPlayers = maxPlayers
    this.minTime = minTime
    this.maxTime = maxTime
    this.newGameFunction = newGameFunction
    this.clients = []
    this.games = []
    this._wsToGame = {}
    this.waiting = false
    this.waitTime = 0

    setInterval(() => {
      if(!this.waiting)
        return

      this.waitTime++
      if((this.clients.length >= minPlayers && this.waitTime > maxTime) ||
         (this.clients.length >= maxPlayers && this.waitTime > minTime)) {
           this.waitTime = 0
           let newGame = this.newGameFunction()
           newGame.start()
           this.games.push(newGame)

           let playerCount = Math.min(maxPlayers, this.clients.length)
           for(let i = 0; i < playerCount; ++i) {
             let ws = this.clients[0]
             newGame.connect(ws)
             this.clients.splice(0, 1)
             this._wsToGame[ws.id] = newGame
           }
           this.waiting = false
           this.waitTime = 0
           console.log('' + newGame.id +
            '> Began new game with ' + newGame.players.length + ' players!')
         }
      this._updateClients()
    }, 1000)
  }

  connect(ws) {
    this.clients.push(ws)

    if(this.clients.length >= this.minPlayers)
      this.waiting = true

    if(this.clients.length <= this.maxPlayers)
      this.waitTime = Math.max(0, this.waitTime - this.minTime)

    this._updateClients()
  }

  disconnect(ws) {
    let index = this.clients.indexOf(ws)

    if(index > -1)
      this.clients.splice(index, 1)

    if(this.clients.length < this.minPlayers) {
      this.waiting = false
      this.waitTime = 0
    }

    let game = this._wsToGame[ws.id]

    if(game !== undefined) {
        game.disconnect(ws)

        if(game.players.length === 0) {
          console.log('' + game.id + '< Ended game')
          let gameIndex = this.games.indexOf(game)
          if(gameIndex > -1)
            this.games.splice(gameIndex, 1)
        }
    }

    this._updateClients()
  }

  tick() {
    this.games.forEach(game => game.tick())
  }

  message(ws, msg) {
    let game = this._wsToGame[ws.id]

    if(game === undefined)
      return

    game.message(ws, msg)
  }

  timeRemaining() {
    if(this.clients.length >= this.maxPlayers)
      return '' + Math.ceil(this.minTime - this.waitTime) + 's'
    else if(this.clients.length >= this.minPlayers)
      return '' + Math.ceil(this.maxTime - this.waitTime) + 's'
    else
      return 'waiting for more players...'
  }

  _updateClients() {
    this.clients.forEach(ws => {
      let position = this.clients.indexOf(ws)
      let players = 0
      this.games.forEach(game => players += game.players.length)

      ws.send(JSON.stringify({
        lobby: {
          position: position,
          playersInQueue: this.clients.length,
          players: players,
          games: this.games.length,
          timeRemaining: this.timeRemaining()
        }
      }))
    })
  }
}

module.exports = Lobby
