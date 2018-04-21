'use strict'

let chat

module.exports = (varley, args) => {
  varley.on('start', () => {
    varley.pub.modules.chat = {
      messages: []
    }
  })

  varley.on('chat', (player, args) => {
    if(typeof args === 'string')
      varley.pub.modules.chat.messages.unshift(
        [Date.now(), '' + player.id + ': ' + args])
  })

  varley.on('tick', () => {
    if(varley.pub.modules.chat.messages.length === 0)
      return

    if(Date.now() - 10000 > varley.pub.modules.chat.messages[0][0])
      varley.pub.modules.chat.messages.shift()
  })
}
