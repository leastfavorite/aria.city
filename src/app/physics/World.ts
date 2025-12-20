interface Mass {
  x: number
  y: number
  m: number
  vx: number
  vy: number
}

interface Spring {
  m1: number
  m2: number
  d: number
  k: number
}

export interface WorldPhysicsSettings {
  d: number
  k: number
  damp: number
}

export interface WorldRenderSettings {
  massSize: number
  massColor: { r: number; g: number; b: number }
}

export default class World {
  masses: Mass[]
  springs: Spring[]

  constructor() {
    this.masses = []
    this.springs = []
  }

  setSize(w: number, h: number) {}

  update(dt: number, settings: WorldPhysicsSettings) {
    console.log(this.springs)
    console.log(this.masses)
    for (let s of this.springs) {
      const m1 = this.masses[s.m1]
      const m2 = this.masses[s.m2]

      const dy = m2.y - m1.y
      const dx = m2.x - m1.x

      const d = Math.sqrt(dy * dy + dx * dx)

      const scaling = s.k * settings.k * (s.d * settings.d - d)

      const vx = (dx / d) * scaling
      const vy = (dy / d) * scaling

      m1.vx -= vx
      m1.vy -= vy

      m2.vx += vx
      m2.vy += vy
    }

    for (let m of this.masses) {
      const damp = Math.pow(settings.damp, dt)
      console.log(damp)
      m.vx *= damp
      m.vy *= damp

      m.x += m.vx * dt
      m.y += m.vy * dt
    }
  }

  // todo camera?
  render(ctx: CanvasRenderingContext2D, settings: WorldRenderSettings) {
    const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
      '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)

    ctx.reset()
    for (const s of this.springs) {
      const m1 = this.masses[s.m1]
      const m2 = this.masses[s.m2]

      ctx.beginPath()
      ctx.moveTo(m1.x, m1.y)
      ctx.lineTo(m2.x, m2.y)
      ctx.lineWidth = 2
      ctx.strokeStyle = 'blue'
      ctx.stroke()
    }
    for (const m of this.masses) {
      ctx.beginPath()
      ctx.ellipse(m.x, m.y, settings.massSize, settings.massSize, 0, 0, 2 * Math.PI)
      ctx.fillStyle = rgbToHex(settings.massColor)
      ctx.fill()
    }
  }

  addPoint(x: number, y: number) {
    let m1: Mass = {
      x,
      y,
      m: 1,
      vx: 0,
      vy: 0,
    }

    const i1 = this.masses.length

    for (const [i2, m2] of this.masses.entries()) {
      const dy = m2.y - m1.y
      const dx = m2.x - m1.x

      const d = Math.sqrt(dy * dy + dx * dx)
      this.springs.push({
        m1: i1,
        m2: i2,
        d,
        k: 1,
      })
    }

    this.masses.push({
      x,
      y,
      m: 1,
      vx: 0,
      vy: 0,
    })
  }
}
