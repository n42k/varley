# Varley
A multiplayer game engine with rapid prototyping as its sole focus.
Intended to be used for game jams with limited time, such as the 1 hour game jam.

## Quick Start

To start a new Varley project, simply create a new directory, then run `npm install varley --save` inside of it.

Afterwards, create 3 files:
* `server.js` - server code, where the first line is `const varley = require('varley')(this)`
* `client.js` - client code
* `shared.js` - code shared by both server and client

You may use the 3 example files below to quickly get started with the engine.

Then, use `node server.js` to run your game.

You can then play it at [http://localhost:8080](http://localhost:8080)!

## Code Example
An example of a tron-like game is available:

server.js:
```
const varley = require('varley')(this);

varley.pub.world = Array(WORLD_WIDTH * WORLD_HEIGHT).fill(-1)

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

varley.run(8080, 10)
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
