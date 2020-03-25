const healthyCol = 'rgb(255, 204, 0)'
const sickCol = 'rgb(255, 0, 10)'
const immuneCol = 'rgb(0, 255, 0)'
const deadCol = 'rgb(0,0,0)'

class Peep {
  constructor(
    padding,
    x = 0,
    y = 0,
    stationary = true,
    immune = false,
    sick = false,
    daysSick = 30,
    lethality = 0.01,
    transfer = 1
  ) {
    this.alive = true
    this.padding = padding
    this.x = x * padding
    this.y = y * padding
    this.stationary = stationary
    this.transferProb = transfer
    this.sick = sick
    this.daysSick = daysSick
    if (this.sick) this.sickDay = 0
    this.immune = immune
    this.lethality = lethality
    this.calculateDeath()
  }
  draw() {
    // let color = normalCol
    // if (this.sick) color = sickCol
    fill(healthyCol)
    // if (!this.stationary) fill(255, 0, 255)
    if (this.sick)
      fill(`rgba(255, 0, 10, ${1 - (2 * this.sickDay) / (3 * this.daysSick)})`)
    if (this.immune) fill(immuneCol)
    if (!this.alive) fill(deadCol)
    rect(this.x, this.y, this.padding, this.padding)
    noFill()
  }
  update(others = [], size = 100) {
    if (
      !this.sick &&
      others.filter(o => {
        return o.sick && !o.immune && o.alive
      }).length &&
      random() <= this.transferProb
    ) {
      this.sick = true
      this.sickDay = 0
    } else if (this.alive && this.sick && !this.immune) {
      if (this.willDie && this.sickDay == this.deathDay) {
        this.alive = false
        this.stationary = true
      }
      this.sickDay++
      if (this.sickDay > this.daysSick) this.immune = true
    }
    if (!this.stationary) {
      let availSpace = []
      if (
        !others.filter(o => o.x == this.x && o.y == this.y + this.padding).length &&
        this.y + this.padding <= size
      )
        availSpace.push('DOWN')
      if (
        !others.filter(o => o.x == this.x && o.y == this.y - this.padding).length &&
        this.y - this.padding >= this.padding
      )
        availSpace.push('UP')
      if (
        !others.filter(o => o.y == this.y && o.x == this.x + this.padding).length &&
        this.x + this.padding <= size
      )
        availSpace.push('RIGHT')
      if (
        !others.filter(o => o.y == this.y && o.x == this.x - this.padding).length &&
        this.x - this.padding >= this.padding
      )
        availSpace.push('LEFT')
      if (availSpace.length > 0) this.move(availSpace)
    }
  }
  move(avail) {
    // console.log('moving')
    const moves = {
      UP: p => {
        p.y = p.y - p.padding
      },
      DOWN: p => {
        p.y = p.y + p.padding
      },
      LEFT: p => {
        p.x = p.x - p.padding
      },
      RIGHT: p => {
        p.x = p.x + p.padding
      }
    }
    if (this.direction && avail.indexOf(this.direction) !== -1 && Math.random() < 0.9)
      moves[this.direction](this)
    else {
      let direction = avail[Math.floor(Math.random() * avail.length)]
      moves[direction](this)
      this.direction = direction
    }
  }
  calculateDeath() {
    this.willDie = random() < this.lethality ? true : false
    this.deathDay = floor(randomGaussian(this.daysSick / 2, sqrt(this.daysSick / 4)))
  }
}
