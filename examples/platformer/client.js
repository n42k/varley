const SIZE = [1000, 700]

const PAGE_BG = '#FFFFFF'
const CANVAS_BG = 'green'

function update() {
  camera(player.x, player.y)
  farm.drawAA(pub.world)
  players.forEach(player => {
    farmer.draw(player.frame, player.x, player.y)
    drawText(player.id, player.x + 9, player.y - 10, 'white', 'center')
  })
  
  gui()
  drawText(player.x, 10, 25)
  drawText(player.y, SIZE[0]/2, 25, '#00FF00', 'center', '20px Comic Sans MS')
  drawText('Right aligned text!', SIZE[0] - 10, 25, '#FF0000', 'right')
}
