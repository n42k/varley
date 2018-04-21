var chat

_afterUpdate.push(function() {
  if(!pub.modules.chat)
    return

  if(chat === undefined)
    _chat_init()

  let y = SIZE[1] - 42 - 20
  for(let msg of pub.modules.chat.messages) {
    drawText(msg[1], 10, y)
    y -= 20
  }

  if(chat.typing) {
    let blinker = chat.blink ? '|' : ''

    if(t - chat.lastSwitch > 500) {
      chat.blink = !chat.blink
      chat.lastSwitch = t
    }

    drawText(chat.message + blinker, 10, SIZE[1] - 42)
  }
})

function _chat_init() {
  chat = {
    typing: false,
    message: '',
    lastSwitch: t,
    blink: true
  }

  let onKeyDown = document.onkeydown

  document.onkeydown = function(e) {
      e = e || window.event;
      if(!chat.typing) {
        onKeyDown(e)
        return
      }

      if(e.key === 'Backspace') {
        chat.message = chat.message.slice(0, -1)
        _update()
      } else if(ALL_CHARS.indexOf(e.key) > -1) {
        chat.message += e.key
        _update()
      }
  }

  let onKeyUp = document.onkeyup
  document.onkeyup = function(e) {
      e = e || window.event;

      let returnReleased = e.key === 'Enter'

      if(chat.typing && returnReleased) {
        ws.send(JSON.stringify({chat: chat.message}))
        chat.typing = false
        chat.message = ''
        _update()
      } else if(returnReleased) {
        chat.typing = true
        chat.blink = true
        chat.lastSwitch = t
        _update()
      } else onKeyUp(e)
  }
}
