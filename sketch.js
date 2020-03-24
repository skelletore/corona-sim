let seed, num
const gridSize = 500
const gridPadding = 10
const frameR = 8
const CANVASWIDTH = 900
const CANVASHEIGHT = gridSize + 2 * gridPadding

let sim = false

let peeps = []

let hist = []
let histSize = 30

let sliderConfig = [
  {
    name: 'seed',
    value: 100,
    min: 0,
    max: 200,
    step: 1
  },
  {
    name: 'num',
    value: 200,
    min: 0,
    max: 400,
    step: 10
  },
  {
    name: 'sick',
    value: 0.02,
    min: 0,
    max: 1,
    step: 0.01
  },
  {
    name: 'stationary',
    value: 0.8,
    min: 0,
    max: 1,
    step: 0.05
  },
  {
    name: 'immunity',
    value: 0.01,
    min: 0,
    max: 0.2,
    step: 0.005
  },
  {
    name: 'lethality',
    value: 0.03,
    min: 0,
    max: 0.4,
    step: 0.01
  },
  {
    name: 'daysSick',
    value: 30,
    min: 1,
    max: 60,
    step: 1
  }
]

let btnConfig = [
  {
    text: 'Setup',
    handler: setValues
  },
  {
    text: 'Start/Stop',
    handler: toggleSim
  },
  {
    text: 'Forward',
    handler: forward
  }
]

function setValues() {
  initializePopulation()
  draw()
}

function toggleSim() {
  sim = !sim
}

function forward() {
  simulate()
}

let sliders = {}

function initialiseDOM() {
  createCanvas(CANVASWIDTH, CANVASHEIGHT)
  let y = gridPadding
  for (let c of sliderConfig) {
    let slider = createSlider(c.min, c.max, c.value, c.step)
    slider.position(gridSize + 4 * gridPadding, y)
    sliders[c.name] = slider
    y += 3 * gridPadding
  }
  let xoffset = gridSize + 4 * gridPadding
  for (let b of btnConfig) {
    let btn = createButton(b.text)
    btn.position(xoffset, y)
    btn.mousePressed(b.handler)
    xoffset += btn.width + gridPadding
  }

  frameRate(frameR)
}

function initializePopulation() {
  randomSeed(sliders.seed.value())
  hist = []
  peeps = []
  let stationary = sliders.stationary.value(),
    immunity = sliders.immunity.value(),
    sickProb = sliders.sick.value(),
    daysSick = sliders.daysSick.value(),
    lethality = sliders.lethality.value(),
    num = sliders.num.value()

  let startPos = randomStart(num, gridSize / gridPadding, gridSize / gridPadding)
  for (let p of startPos) {
    let stat = random() < stationary
    let immune = random() < immunity
    let sick = random() < sickProb
    let peep = new Peep(gridPadding, p.x, p.y, stat, immune, sick, daysSick, lethality)
    peeps.push(peep)
  }
}

function setup() {
  initialiseDOM()
  initializePopulation()

  peeps.forEach(p => p.draw())
}

function draw() {
  background(100)
  fill('white')
  rect(gridPadding, gridPadding, gridSize, gridSize)
  let yoffset = drawSliders()
  if (sim) simulate()
  peeps.forEach(p => p.draw())
  stats(yoffset + 6 * gridPadding)
}

function drawSliders() {
  let sliderEntries = Object.entries(sliders)
  let y = gridPadding * 2
  for (let [n, s] of sliderEntries) {
    let label = text(
      `${n} (${s.value()})`,
      s.x + s.width + gridPadding,
      y + gridPadding - 5
    )
    y += gridPadding * 3
  }
  return y
}

function simulate() {
  for (let p of peeps) {
    let others = peeps.filter(o => isNeighbor(p, o))
    p.update(others, gridSize)
  }
  let newHist = {
    healthy: peeps.filter(p => !p.sick && !p.immune).length,
    dead: peeps.filter(p => !p.alive).length,
    sick: peeps.filter(p => p.alive && p.sick && !p.immune).length,
    immune: peeps.filter(p => p.immune).length
  }
  hist.push(newHist)
}

function randomStart(n = 100, w = 400, h = 400) {
  let arr = []
  while (arr.length < n) {
    let point = {
      x: randint(w),
      y: randint(h)
    }
    if (arr.indexOf(point) === -1) arr.push(point)
  }
  return arr
}

function randint(ma, mi = 0) {
  return Math.ceil(random(mi, ma))
}

function isNeighbor(a, b) {
  // taxi
  // return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) < 2 * gridPadding
  // euclidean
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) < 2 * gridPadding
}

function stats(yoffset) {
  const histLabel = ['healthy', 'sick', 'immune', 'dead']

  let xoffset = gridSize + gridPadding * 4,
    width = 300,
    height = 150,
    num = sliders.num.value(),
    labelPadding = 0
  // legend
  for (let h of histLabel) {
    let col = eval(h + 'Col')
    fill(col)
    rect(xoffset + labelPadding, yoffset, gridPadding, gridPadding)
    fill(255)
    text(h, xoffset + labelPadding + gridPadding * 2, yoffset + gridPadding)
    labelPadding += gridPadding * 7
  }
  noFill()
  yoffset += gridPadding * 3
  if (hist.length >= width) {
    hist.splice(0, 1)
  }
  fill(255)
  noStroke()
  rect(xoffset, yoffset, width, height)
  stroke(0)
  for (let h of hist) {
    let lineOffset = yoffset
    let lineLength
    xoffset += 1
    strokeWeight(2)
    stroke(healthyCol)
    lineLength = (h.healthy / num) * height
    line(xoffset, lineOffset, xoffset, lineOffset + lineLength)
    lineOffset += lineLength

    stroke(sickCol)
    lineLength = (h.sick / num) * height
    line(xoffset, lineOffset, xoffset, lineOffset + lineLength)
    lineOffset += lineLength

    stroke(immuneCol)
    lineLength = (h.immune / num) * height
    line(xoffset, lineOffset, xoffset, lineOffset + lineLength)
    lineOffset += lineLength

    stroke(deadCol)
    lineLength = (h.dead / num) * height
    line(xoffset, lineOffset, xoffset, lineOffset + lineLength)
    lineOffset += lineLength
  }
  strokeWeight(2)
}
