# Varley

[![npm version](https://badge.fury.io/js/varley.svg)](https://badge.fury.io/js/varley)

A multiplayer game engine with rapid prototyping as its sole focus.
Intended to be used for game jams with limited time, such as the 1 hour game jam.

## Features
* Multiplayer.
* Top down and platformer movement, including collisions.
* Animations, sprite sheets.
* Matchmaking, lobby: you can start games with a minimum and maximum number of players, and there can be multiple games running at the same time.
* Game state diffing: only the data that has been modified is sent every network tick, not the entire game state.

## Examples
Try playing with a friend!

* [Tron-like game](http://n42k.ddns.net:8892)
* [Farm game](http://n42k.ddns.net:8891)
* [Platformer game](http://n42k.ddns.net:8893)

The source code of these 3 games is available in the examples folder.

## Documentation
There's a [wiki](https://github.com/n42k/varley/wiki) available.

## Quick Start
To start a new Varley project, simply create a new directory, then run `npm init -f` and `npm install varley --save` inside of it.

Afterwards, pick an example from above, and copy the files from the examples folder of this repository.

Then, use `node server.js` to run your game.

You can then play it at [http://localhost:8080](http://localhost:8080)!

## Code Example
To see how short games can be, an example of a tron-like game is available below.

server.js:
```
const varley = require('varley')(this);

varley.on('start', () => {
  varley.pub.world = Array(WORLD_WIDTH * WORLD_HEIGHT).fill(-1)
})

varley.on('connect', player => {
  player.vx = 1, player.vy = 0
  player.x = Math.floor(Math.random() * WORLD_WIDTH)
  player.y = Math.floor(Math.random() * WORLD_HEIGHT)
})

let keys = {'UP': [0, -1], 'LEFT': [-1, 0], 'RIGHT': [1, 0], 'DOWN': [0, 1]}
varley.on('press', (player, key) => [player.vx, player.vy] = keys[key])

varley.on('playertick', player => {
  player.x = player.x + player.vx, player.y = player.y + player.vy

  if(player.x < 0 || player.y < 0 ||
     player.x >= WORLD_WIDTH || player.y >= WORLD_HEIGHT ||
     varley.pub.world[player.x + player.y * WORLD_WIDTH] !== -1)
    return player.disconnect()

  varley.pub.world[player.x + player.y * WORLD_WIDTH] = player.id
})

varley.on('disconnect', player =>
  varley.pub.world = varley.pub.world.map(t => t == player.id ? -1 : t))

varley.run()
```

client.js:
```
const SIZE = [1000, 700]
const BLOCK_SIZE = SIZE[0] / WORLD_WIDTH

const PAGE_BG = '#FFFFFF'
const CANVAS_BG = 'green'

const colors = ['#FF0000', '#00FF00', '#0000FF',
                '#FFFF00', '#FF00FF', '#00FFFF']

function update() {
  for(let y = 0; y < WORLD_HEIGHT; ++y)
  for(let x = 0; x < WORLD_WIDTH; ++x) {
    let color = pub.world[x + y * WORLD_WIDTH] % 6
    const BS = BLOCK_SIZE
    drawRect(x * BS, y * BS, BS, BS, colors[color])
  }
}
```

shared.js:
```
const WORLD_WIDTH = 50, WORLD_HEIGHT = 35
```

## Contributing
The best way to contribute at this point is to try out the engine, and e-mail (n101010k@gmail.com) me your thoughts on it, or create an [issue](https://github.com/n42k/varley/issues/new) if you find a problem with it. Pull requests are also welcome, if you fix the problem you've found.

If you have a feature request, feel free to open an issue, so that we can discuss it.

## License
MIT
