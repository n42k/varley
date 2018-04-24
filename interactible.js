'use strict'

const Interactible = class Interactible {
  constructor(spritesheet, x, y) {
    this.mov = null

    if(spritesheet === undefined)
      return

    this.Interactible(spritesheet, x, y)
  }

  Interactible(spritesheet, x, y) {
    this.mov = {}
    this.mov.callbacks = {
      tick: [],
      touch: []
    }

    this.mov.sheet = spritesheet

    this.x = x
    if(x === undefined)
      this.x = 0

    this.y = y
    if(y === undefined)
      this.y = 0

    this.frame = 0

    return this
  }

  Movement(vx, vy, ax, ay) {
    this._movNullCheck()

    this.keys = {}

    this.mov.vx = vx
    if(vx === undefined)
      this.mov.vx = 4

    this.mov.vy = vy
    if(vy === undefined)
      this.mov.vy = 4

    this.mov.ax = ax
    if(this.mov.ax === undefined)
      this.mov.ax = this.mov.vx

    this.mov.ay = ay
    if(this.mov.ay === undefined)
      this.mov.ay = this.mov.vy

    this.vx = 0
    this.vy = 0

    return this
  }

  Collision(world, worldTileset, collisionMap) {
    this._movNullCheck()

    this.mov.world = world
    this.mov.worldTileset = worldTileset
    this.mov.collisionMap = collisionMap

    return this
  }

  TopDown() {
    this._movNullCheck()

    this.on('tick', interactible => {
      this.vx = 0
      if(this.keys.LEFT) this.vx -= this.mov.ax
      if(this.keys.RIGHT) this.vx += this.mov.ax

      this.vy = 0
      if(this.keys.UP) this.vy -= this.mov.ay
      if(this.keys.DOWN) this.vy += this.mov.ay

      if(this.vx > 0)
        this.playAnimation(2)
      else if(this.vx < 0)
        this.playAnimation(0)
      else if(this.vy > 0)
        this.playAnimation(3)
      else if(this.vy < 0)
        this.playAnimation(1)

      if(this.evx === 0 && this.evy === 0)
        this.stopAnimation()
    })

    return this
  }

  Platformer(gravity) {
    this._movNullCheck()

    if(gravity === undefined)
      gravity = 1

    this.on('tick', interactible => {
      if(this.keys.LEFT === this.keys.RIGHT) {
        let dif = this.mov.ax * Math.abs(this.vx) / this.vx
        if(dif > 0)
          this.vx = Math.max(0, this.vx - this.mov.ax)
        else if(dif < 0)
          this.vx = Math.min(0, this.vx + this.mov.ax)
      } else if(this.keys.LEFT)
        this.vx -= this.mov.ax
      else if(this.keys.RIGHT)
        this.vx += this.mov.ax

      if(this.keys.SPACE && this.blocked(this.x , this.y + 1))
        this.vy -= this.mov.ay

      this.vy += gravity

      let sum = 0
      if(Math.abs(this.mov.yMove) !== 0)
        sum = 2

      if(this.evx > 0)
        this.playAnimation(0 + sum)
      else if(this.evx < 0)
        this.playAnimation(1 + sum)
      else
        this.stopAnimation()
    })

    return this
  }

  Animations(frameTime, remapping) {
    this._movNullCheck()

    this.mov.playing = false
    this.mov.animation = 0

    this.mov.frameTime = frameTime
    if(frameTime === undefined)
      this.mov.frameTime = 1

    this.mov.animationMapping = remapping

    return this
  }

  Touchable(list) {
    if(this.mov.touchables === undefined)
      this.mov.touchables = []

    this.mov.touchables.push(list)

    return this
  }

  tick() {
    if(this.mov === null)
      return

    this.mov.callbacks['tick'].forEach(callback => callback(this))

    this.vx = Math.max(-this.mov.vx, Math.min(this.mov.vx, this.vx))
    this.vy = Math.max(-this.mov.vy, Math.min(this.mov.vy, this.vy))

    if(this.mov.world === undefined ||
       this.mov.worldTileset === undefined ||
       this.mov.collisionMap === undefined ||
       this.blocked(this.x, this.y)) {
         this.x += this.vx
         this.y += this.vy
         this.evx = this.vx
         this.evy = this.vy
    } else {
      let vx = this.vx
      let vy = this.vy

      while(Math.abs(vx) >= 1 || Math.abs(vy) >= 1) {
        if(vx !== 0) {
          let dVx = Math.abs(vx) / vx
          if(!this.blocked(this.x + dVx, this.y))
            vx -= dVx, this.x += dVx
          else {
            vx = 0
            this.vx = 0
          }
        }

        if(vy !== 0) {
          let dVy = Math.abs(vy) / vy
          if(!this.blocked(this.x, this.y + dVy))
            vy -= dVy, this.y += dVy
          else {
            vy = 0
            this.vy = 0
          }
        }
      }

      this.evx = this.vx - vx
      this.evy = this.vy - vy
    }

    if(this.mov.touchables !== undefined && this.mov.sheet !== undefined) {
      this.mov.touchables.forEach(list => list.forEach(other => {
        if(this === other)
          return

        if(other.mov.sheet !== undefined &&
           this.x  <= other.x + other.mov.sheet.width &&
           other.x <= this.x  + this.mov.sheet.width &&
           this.y  <= other.y + other.mov.sheet.height &&
           other.y <= this.y  + this.mov.sheet.height)
            this.mov.callbacks['touch'].forEach(callback =>
              callback(this, other))
      }))
    }

    if(this.mov.playing === undefined ||
       this.mov.animation === undefined ||
       ++this.mov.animationFrame < this.mov.frameTime ||
       !this.mov.playing)
       return

     let offset = this.mov.animation * this.mov.sheet.columns
     let frame = (++this.frame - offset) % this.mov.sheet.columns
     this.frame = offset + frame
     this.mov.animationFrame = 0
  }

  blocked(x, y) {
    let mov = this.mov

    let x1 = Math.floor(x / mov.worldTileset.width)
    let y1 = Math.floor(y / mov.worldTileset.height)
    let x2 = Math.floor((x + mov.sheet.width) / this.mov.worldTileset.width)
    let y2 = Math.floor((y + mov.sheet.height) / this.mov.worldTileset.height)

    let AIR = 0

    let row1 = mov.world[y1]

    if(row1 !== undefined &&
      (mov.collisionMap[row1[x1]] !== AIR || mov.collisionMap[row1[x2]] !== AIR))
      return true

    let row2 = mov.world[y2]

    if(row2 !== undefined &&
      (mov.collisionMap[row2[x1]] !== AIR || mov.collisionMap[row2[x2]] !== AIR))
      return true

    return false
  }

  on(action, callback) {
    if(this.mov.callbacks[action] === undefined)
      throw new Error('Invalid on: interactible.on(\'' + action + '\', { ... })')

    this.mov.callbacks[action].push(callback)
  }

  playAnimation(id) {
    if(this.mov.playing === undefined ||
       this.mov.animation === undefined)
      return

    this.mov.playing = true

    if(this.mov.animationMapping !== undefined)
      id = this.mov.animationMapping[id]

    if(id >= this.mov.sheet.rows ||
       id == this.mov.animation)
      return

    this.mov.animation = id
    this.frame = id * this.mov.sheet.columns
  }

  stopAnimation() {
    if(this.mov.playing === undefined)
      return

    this.frame = this.mov.animation * this.mov.sheet.columns
    this.mov.playing = false
  }

  _movNullCheck() {
    if(this.mov === null)
      throw new Error('Invalid interactible!')
  }
}

module.exports = Interactible
