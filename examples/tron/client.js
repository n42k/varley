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
