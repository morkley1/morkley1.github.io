const TYPES = {
    'circle': {
        'draw': (self) => {
            doFill = false
            doStroke = true
            stroke('white')
            strokeWeight(2)
            circle(0, 0, self.size)
        },
        'openings': (self, size) => {
            return [{
                'size': size,
                'position': new Vector(0, 0),
                'rotation': 0,
                'ocu': [0]
            }]
        }
    },
    'ngon': {
        'draw': (self) => {
            doFill = false
            doStroke = true
            stroke('white')
            strokeWeight(2)
            polygon(0, 0, self.size, self.n, self.j)
        },
        'openings': (self, size) => {
            if (self.j > self.n) self.j = 1
            let out = [{
                    'size': size,
                    'position': new Vector(0, 0),
                    'rotation': 0,
                    'ocu': [0, 1]
                }]
            let r = size * (Math.cos(PI * self.j / self.n) / Math.cos(PI / self.n))
            let a = r * Math.sin(PI / self.n)
            out.push({
                'size': a * Math.cot(PI / self.n),
                'position': new Vector(0, 0),
                'rotation': PI / self.n,
                'ocu': [0, 1]
            })
            out.push({
                'size': r,
                'position': new Vector(0, 0),
                'rotation': PI / self.n,
                'ocu': [2]
            })
            return out
        }
    },
    'ncircles': {
        'draw': (self) => {
            doFill = false
            doStroke = true
            stroke('white')
            strokeWeight(2)
            let theta = Math.sin(PI / self.n)
            let rad = theta / (1 + theta) * self.size
            let radius = self.size - rad
            for (let i = 0; i < self.n; i++) {
                dir = i / self.n * PI * 2 + PI / 2 + PI / self.n
                circle(Math.cos(dir) * radius, Math.sin(dir) * radius, rad)
            }
        },
        'openings': (self, size) => {
            if (self.n == 1) {
                return [
                    {
                        'size': 0,
                        'position': new Vector(0, 0),
                        'rotation': 0,
                        'ocu': [0]
                    },
                    {
                        'size': size,
                        'position': new Vector(0, 0),
                        'rotation': 0,
                        'ocu': [1]
                    }
                ]
            }
            let theta = Math.sin(PI / self.n)
            let rad = theta / (1 + theta) * self.size
            let radius = self.size - rad
            let circles = []
            for (let i = 0; i < self.n; i++) {
                dir = i / self.n * PI * 2 + PI / 2 + PI / self.n
                circles.push([new Vector(Math.cos(dir) * radius, Math.sin(dir) * radius), dir + PI / 2])
            }
            let out = [
                {
                    'size': size - (2 * rad),
                    'position': new Vector(0, 0),
                    'rotation': 0,
                    'ocu': [0]
                }
            ]
            for (let circle of circles) {
                out.push({
                    'size': rad,
                    'position': circle[0],
                    'rotation': circle[1],
                    'ocu': [out.length]
                })
            }
            return out
        }
    },
    'scale': {
        'draw': (self) => {},
        'openings': (self, size) => {
            return [{
                'size': size * self.n,
                'position': new Vector(0, 0),
                'rotation': 0,
                'ocu': [0]
            }]
        }
    },
    'rotate': {
        'draw': (self) => {},
        'openings': (self, size) => {
            return [{
                'size': size,
                'position': new Vector(0, 0),
                'rotation': self.n / 180 * PI,
                'ocu': [0]
            }]
        }
    },
    'spin': {
        'draw': (self) => {
            self.openings = TYPES[self.type].openings(self, self.size)
            self.children.forEach((v) => {
                v.recalc()
            })
        },
        'openings': (self, size) => {
            return [{
                'size': size,
                'position': new Vector(0, 0),
                'rotation': (self.n * time) / 180 * PI,
                'ocu': [0]
            }]
        }
    }
}

class AlchemyCircle extends Entity {
    constructor(type, parent, pos = 0, ...args) {
        let name = 'root'
        if (parent) name = parent.name + ':0'
        super(name, TYPES[type].draw)
        this.name = name
        this.pos = pos
        this.parent = parent
        if (['ngon', 'ncircles', 'scale', 'rotate', 'spin'].includes(type)) this.n = args[0] || 3
        if (['ngon'].includes(type)) {
            this.j = args[1] || 1
            if (this.j > this.n / 2) this.j = this.n - this.j
        }
        if (parent) {
            this._size = parent.openings[pos].size
            this.position = parent.openings[pos].position
            this.rotation = parent.openings[pos].rotation
            if (parent.open[pos]) {
                parent.add_child(this)
                for (let point of parent.openings[pos].ocu) {
                    parent.open[point] = false
                }
            }
        } else {
            this._size = Math.min(canvas.width, canvas.height) / 2
            this.position = new Vector(canvas.width / 2, canvas.height / 2)
        }
        this.openings = TYPES[type].openings(this, this.size)
        this.open = []
        this.type = type
        for (let i = 0; i < this.openings.length; i++) {
            this.open[i] = true
        }
    }

    set size(v) {
        this.openings = TYPES[this.type].openings(this, v)
        this.children.forEach((v) => {
            v.recalc()
        })
        this._size = v
    }

    get size() {
        return this._size
    }

    recalc() {
        this._size = this.parent.openings[this.pos].size
        this.position = this.parent.openings[this.pos].position
        this.rotation = this.parent.openings[this.pos].rotation
    }
}
