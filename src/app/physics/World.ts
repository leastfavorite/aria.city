
interface Mass {
    x: number;
    y: number;
    m: number;
    vx: number;
    vy: number;
}

interface Spring {
    m1: Mass;
    m2: Mass;
    d: number;
    k: number;
}


export interface WorldPhysicsSettings {
}

export interface WorldRenderSettings {
    massSize: number;
    massColor: { r: number, g: number, b: number };
}


export default class World {
    masses: Mass[];


    constructor() {
        this.masses = []
    }

    setSize(w: number, h: number) {
    }

    update(dt: number, settings: WorldPhysicsSettings) {
    }

    // todo camera?
    render(ctx: CanvasRenderingContext2D, settings: WorldRenderSettings) {
        ctx.reset();
        for (const m of this.masses) {
            ctx.beginPath();
            ctx.ellipse(
                m.x, m.y, settings.massSize, settings.massSize, 0, 0, 2 * Math.PI
            );
            const rgbToHex = ({ r, g, b }: { r: number, g: number, b: number }) =>
              "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)
            ctx.fillStyle = rgbToHex(settings.massColor);
            ctx.fill();
        }
    }

    addPoint(x: number, y: number) {
        this.masses.push({
            x, y, m: 1, vx: 0, vy: 0
        });
        console.log(x, y);
    }

}
