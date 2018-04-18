const SIZE = [1000, 700]

const PAGE_BG = '#FFFFFF'
const CANVAS_BG = 'green'

function update() {
  camera(player.x, player.y)
  farm.drawAA(pub.world)
  players.forEach(player => farmer.draw(player.frame, player.x, player.y))
}
