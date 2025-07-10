/////////////////////
///// CONSTANTS /////
/////////////////////
const data = {
    events: [],
    states: {},
    timers: {}
}
const transforms = []
const PI = Math.PI



/////////////////////
///// VARIABLES /////
/////////////////////

/// STRUCTURE ///
let prevTime = Date.now()

/// GRAPHICS ///
let canvas
let physicsServer
let input
let entities = []
let close = false
let fillColor = 0
let doFill = true
let strokeColor = 0
let strokeSize = 0
let doStroke = true
let font = 'serif'
let fontSize = 12



////////////////////
///// GRAPHICS /////
////////////////////

/// CLASSES ///
class Color {
    constructor(...args) {
        if (args.length == 1 && typeof args[0] == 'string') {
            this.type = 'string'
            this.value = args[0]
        } else if (args.length == 1) {
            this.type = 'greyscale'
            this.value = args[0]
        } else if (args.length == 3) {
            this.type = 'rgb'
            this.value = [...args]
        } else if (args.length == 4 && typeof args[0] == 'string') {
            this.type = args[0]
            this.value = [...args.slice(1)]
        } else if (args.length == 4) {
            this.type = 'agba'
            this.value = [...args]
        } else {
            this.type = args[0]
            this.value = [...args.slice(1)]
        }
    }

    toString() {
        switch (this.type) {
            case 'rgb':
                return `rgb(${this.value[0]},${this.value[1]},${this.value[2]})`
            case 'hsv':
                return `hsv(${this.value[0]},${this.value[1]},${this.value[2]})`
            case 'hsl':
                return `hsl(${this.value[0]},${this.value[1]},${this.value[2]})`
            case 'rgba':
                return `rgba(${this.value[0]},${this.value[1]},${this.value[2]},${this.value[3]})`
            case 'greyscale':
                return `rgb(${this.value},${this.value},${this.value})`
            default:
                return this.value
        }
    }
}

class Canvas {
    constructor(width = 400, height = 400, backgroundColor = 127) {
        this.canvas = document.createElement('canvas')
        this.width = width
        this.height = height
        this.background = backgroundColor
        this.context = this.canvas.getContext("2d")
        document.body.appendChild(this.canvas)
    }

    get width() {
        return this.canvas.width
    }

    set width(val) {
        this.canvas.width = val
    }

    get height() {
        return this.canvas.height
    }

    set height(val) {
        this.canvas.height = val
    }

    get screenWidth() {
        return window.innerWidth
    }

    get screenHeight() {
        return window.innerHeight
    }

    get background() {
        return this.backgroundColor
    }

    set background(val) {
        this.backgroundColor = val
        if (!(val instanceof Color)) {
            val = new Color(val)
        }
        this.canvas.style.backgroundColor = val
    }
}

/// FUNCTIONS ///
function fill(color) {
    fillColor = color
    if (!(color instanceof Color)) {
        color = new Color(color)
    }
    canvas.context.fillStyle = color.toString()
    return fillColor
}

function stroke(color) {
    strokeColor = color
    if (!(color instanceof Color)) {
        color = new Color(color)
    }
    canvas.context.strokeStyle = color.toString()
    return strokeColor
}

function strokeWeight(weight) {
    strokeSize = weight
    canvas.context.lineWidth = weight
    return strokeSize
}

function background(color) {
    canvas.background = color
    canvas.context.reset()
}

function rect(x, y, width, height, mode = 0) {
    canvas.context.beginPath()
    if (mode == 0) canvas.context.rect(x - width/2, y - height/2, width, height)
    if (mode == 1) canvas.context.rect(x, y, width, height)
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
}

function roundedRect(x, y, width, height, radii) {
    canvas.context.beginPath()
    canvas.context.roundRect(x - width/2, y - height/2, width, height, radii)
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
}

function arc(x, y, radius, start, end, counterclockwise) {
    canvas.context.beginPath()
    canvas.context.arc(x, y, radius, start, end, counterclockwise)
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
}

function circle(x, y, radius) {
    canvas.context.beginPath()
    canvas.context.arc(x, y, radius, 0, 2 * PI)
    canvas.context.closePath()
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
}

function ellipticalArc(x, y, radiusX, radiusY, start, end, counterclockwise = false) {
    canvas.context.beginPath()
    canvas.context.ellipse(x, y, radiusX, radiusY, 0, start, end, counterclockwise)
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
}

function ellipse(x, y, radiusX, radiusY) {
    canvas.context.beginPath()
    canvas.context.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * PI)
    canvas.context.closePath()
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
}

/*
function polygon(x, y, radius, sides, jump = 1) {
    pushTransforms()
    rotate((PI / 2) - (PI / sides))
    canvas.context.beginPath()
    let sharedFactor = jump == 1 ? 0 : Math.sharedFactor(sides, jump)
    console.log(sharedFactor)
    if (sharedFactor == 0) {
        canvas.context.moveTo(x + radius, y)
        for (let i = 1; i < sides; i++) {
            let j = (i * jump) % sides
            canvas.context.lineTo(x + (Math.cos(j / sides * PI * 2) * radius), y + (Math.sin(j / sides * PI * 2) * radius))
        }
        canvas.context.closePath()
    } else {
        for (let a = 0; a < jump; a++) {
            pushTransforms()
            rotate(2 * PI / sides * a)
            canvas.context.moveTo(x + radius, y)
            for (let i = 1; i < sides / sharedFactor; i++) {
                let j = (i * jump) % sides
                canvas.context.lineTo(x + (Math.cos(j / sides * PI * 2) * radius), y + (Math.sin(j / sides * PI * 2) * radius))
            }
            canvas.context.closePath()
            popTransforms()
        }
    }
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
    popTransforms()
}
/*/
function polygon(x, y, radius, sides, jump = 1) {
    pushTransforms()
    rotate((PI / 2) - (PI / sides))
    canvas.context.beginPath()
    const sharedFactor = jump === 1 ? 0 : Math.sharedFactor(sides, jump)
    const drawPath = (offset = 0, count = sides / (sharedFactor || 1)) => {
        canvas.context.moveTo(
            x + Math.cos(offset / sides * PI * 2) * radius,
            y + Math.sin(offset / sides * PI * 2) * radius
        )
        for (let i = 1; i < count; i++) {
            const j = (i * jump + offset) % sides
            canvas.context.lineTo(
                x + Math.cos(j / sides * PI * 2) * radius,
                y + Math.sin(j / sides * PI * 2) * radius
            )
        }
        canvas.context.closePath()
    }
    if (sharedFactor === 0) {
        drawPath()
    } else {
        for (let a = 0; a < jump; a++) {
            pushTransforms()
            rotate((2 * PI / sides) * a)
            drawPath()
            popTransforms()
        }
    }
    if (doFill) canvas.context.fill()
    if (doStroke) canvas.context.stroke()
    popTransforms()
}
//*/

function line(x1, y1, x2, y2) {
    canvas.context.beginPath()
    canvas.context.moveTo(x1, y1)
    canvas.context.lineTo(x2, y2)
    canvas.context.stroke()
}

function triangle(x, y, x2, y2, x3, y3) {
    canvas.context.beginPath()
    canvas.context.moveTo(x, y)
    canvas.context.lineTo(x2, y2)
    canvas.context.lineTo(x3, y3)
    canvas.context.closePath()
    if (doFill) {
        canvas.context.fill()
    }
    if (doStroke) {
        canvas.context.stroke()
    }
}

function text(text, x, y, max) {
    canvas.context.font = `${fontSize}px ${font}`
    if (doFill) {
        canvas.context.fillText(text, x, y, max)
    }
    if (doStroke) {
        canvas.context.strokeText(text, x, y, max)
    }
}

function pushTransforms() {
    transforms.push(canvas.context.getTransform())
}

function popTransforms() {
    canvas.context.setTransform(transforms.pop())
}

function translate(x, y) {
    canvas.context.translate(x, y)
}

function rotate(angle) {
    canvas.context.rotate(angle)
}

function scale(x, y) {
    canvas.context.scale(x, y)
}

function skew(x, y) {
    canvas.context.transform(1, x, y, 1, 0, 0)
}



////////////////////
///// ENTITIES /////
////////////////////

/// CLASSES ///
class Entity {
    constructor(name, draw) {
        this.name = name
        this.__draw = draw.bind(this, this)
        this.position = new Vector(0, 0)
        this.rotation = 0
        this.scale = new Vector(1, 1)
        this.skew = new Vector(0, 0)
        this.zIndex = 0
        this.parent = null
        this.children = []
    }

    add() {
        entities.push(this)
    }

    add_child(child) {
        this.children.push(child)
    }

    draw() {
        this.rotation %= 2*PI
        pushTransforms()
        translate(this.position.x, canvas.height - this.position.y)
        rotate(this.rotation)
        skew(this.skew.x, this.skew.y)
        scale(this.scale.x, this.scale.y)
        this.children = this.children.sort((child) => child.zIndex)
        let negative = this.children.filter((child) => child.zIndex < 0)
        let positive = this.children.filter((child) => child.zIndex >= 0)
        for (let child in negative) {
            negative[child]._draw()
        }
        this.__draw()
        for (let child in positive) {
            positive[child]._draw()
        }
        popTransforms()
    }

    _draw() {
        this.rotation %= 2*PI
        pushTransforms()
        translate(this.position.x, this.position.y)
        rotate(this.rotation)
        skew(this.skew.x, this.skew.y)
        scale(this.scale.x, this.scale.y)
        this.children = this.children.sort((child) => child.zIndex)
        let negative = this.children.filter((child) => child.zIndex < 0)
        let positive = this.children.filter((child) => child.zIndex >= 0)
        for (let child in negative) {
            negative[child]._draw()
        }
        this.__draw()
        for (let child in positive) {
            positive[child]._draw()
        }
        popTransforms()
    }

    free() {
        delete entities[name]
    }
}

/// FUNCTIONS ///
function freeAll() {
    entities = []
}



///////////////////
///// PHYSICS /////
///////////////////

/// CLASSES ///
class PhysicsServer {
    constructor() {
        this.objects = []
        this.defaultGravity = new Vector(0, -9.81)
    }

    add_object(entity, colliderType, ...args) {
        this.objects.push(entity)
        entity.linearVelocity = new Vector(0, 0)
        entity.linearForce = new Vector(0, 0)
        entity.angularVelocity = 0
        entity.angularForce = 0
        entity.mass = 1
        entity.ellasticity = 0.5
        entity.physicsType = 'Object'
        entity.colliderType = colliderType
        entity.colliderData = args
        entity.impulse = this.impulse.bind(this, entity)
        entity.layer = -1
    }

    add_static(entity, colliderType, ...args) {
        this.objects.push(entity)
        entity.physicsType = 'Static'
        entity.colliderType = colliderType
        entity.colliderData = args
        entity.ellasticity = 0.5
        entity.layer = -1
    }

    tick(delta) {
        for (let object in this.objects) {
            // Apply movement
            switch (this.objects[object].physicsType) {
                case 'Object':
                    this.objects[object].position = this.objects[object].position.add(this.objects[object].linearVelocity.mul(delta))
                    this.objects[object].linearVelocity = this.objects[object].linearVelocity.add(this.objects[object].linearForce.mul(delta / this.objects[object].mass))
                    this.objects[object].rotation += this.objects[object].angularVelocity * delta
                    this.objects[object].angularVelocity += this.objects[object].angularForce * (delta / this.objects[object].mass)
                    this.objects[object].linearVelocity = this.objects[object].linearVelocity.add(this.defaultGravity)
                    break
            }
        }

        // Resolve collisions
        let collisions = []
        for (let _a in this.objects) {
            let a = this.objects[_a]
            for (let _b in this.objects) {
                let b = this.objects[_b]
                if (a == b) break
                if (a.physicsType == 'Static' && b.physicsType == 'Static') continue
                if ((a.layer & b.layer) == 0) continue
                let points = new CollisionPoints(a, b)
                if (points.hasCollision) collisions.push([a, b, points])
            }
        }
        for (let _c in collisions) {
            let collision = collisions[_c]
            let a = collision[0]
            let b = collision[1]
            let depth = collision[2].depth
            let aShift = 0
            let aLinear = new Vector(0, 0)
            let bShift = 0
            let bLinear = new Vector(0, 0)
            if (a.physicsType != 'Static') {
                aShift = a.mass
                aLinear = a.linearVelocity
            }
            if (b.physicsType != 'Static') {
                bShift = b.mass
                bLinear = b.linearVelocity
            }
            let scale = aShift + bShift
            aShift *= depth / scale
            bShift *= -depth / scale
            let normal = collision[2].normal
            a.position = a.position.add(normal.mul(aShift))
            b.position = b.position.add(normal.mul(bShift * -1))
            if (a.physicsType != 'Static') {
                let absorb = a.linearVelocity.sub(a.linearVelocity.proj(normal))
                let bounce = a.linearVelocity.ref(normal)
                let bounciness = (a.ellasticity + b.ellasticity) / 2
                let force = bounce.mul(bounciness).add(absorb.mul(1 - bounciness)).sub(a.linearVelocity)
                a.impulse(force, collision[2].a)
            }
            if (b.physicsType != 'Static') {
                let absorb = b.linearVelocity.sub(b.linearVelocity.proj(normal))
                let bounce = b.linearVelocity.ref(normal)
                let bounciness = (a.ellasticity + b.ellasticity) / 2
                let force = bounce.mul(bounciness).add(absorb.mul(1 - bounciness)).sub(b.linearVelocity)
                b.impulse(force, collision[2].b)
            }
        }
    }

    impulse(object, force, position) {
        console.log(object.position)
        console.log(force)
        console.log(position)
        console.log('')
        let radius = position.length()
        let tangent = position.rotate2D(PI / 2)
        let tangentialV = force.proj(tangent)
        let normalV = force.proj(position)
        object.angularVelocity += tangentialV.length() / radius * Math.sign(tangentialV.dot(tangent))
        object.linearVelocity = object.linearVelocity.add(normalV)
        stroke('magenta')
    }
}

class CollisionPoints {
    constructor(a, b) {
        let dat = []
        let swap = false
        switch (a.colliderType) {
            case 'Circle':
                switch (b.colliderType) {
                    case 'Circle':
                        dat = this.testCircleCircle(a, b)
                        break
                    case 'Line':
                        dat = this.testCircleLine(a, b)
                        break
                    case 'Rect':
                        dat = this.testCircleRect(a, b)
                        break
                    case 'Poly':
                        dat = this.testCirclePoly(a, b)
                        break
                }
                break
            case 'Line':
                switch (b.colliderType) {
                    case 'Circle':
                        dat = this.testCircleLine(b, a)
                        swap = true
                        break
                    case 'Line':
                        dat = this.testLineLine(a, b)
                        break
                    case 'Rect':
                        dat = this.testLineRect(a, b)
                        break
                    case 'Poly':
                        dat = this.testLinePoly(a, b)
                        break
                }
                break
            case 'Rect':
                switch (b.colliderType) {
                    case 'Circle':
                        dat = this.testCircleRect(b, a)
                        swap = true
                        break
                    case 'Line':
                        dat = this.testLineRect(b, a)
                        swap = true
                        break
                    case 'Rect':
                        dat = this.testRectRect(a, b)
                        break
                    case 'Poly':
                        dat = this.testRectPoly(a, b)
                        break
                }
                break
            case 'Poly':
                switch (b.colliderType) {
                    case 'Circle':
                        dat = this.testCirclePoly(b, a)
                        swap = true
                        break
                    case 'Line':
                        dat = this.testLinePoly(b, a)
                        swap = true
                        break
                    case 'Rect':
                        dat = this.testRectPoly(b, a)
                        swap = true
                        break
                    case 'Poly':
                        dat = this.testPolyPoly(a, b)
                        break
                }
                break
        }
        this.a = new Vector(0, 0)
        this.b = new Vector(0, 0)
        this.normal = new Vector(0, 0)
        this.depth = 0
        this.hasCollision = false
        if (dat != []) {
            if (swap) {
                this.a = dat[1]
                this.b = dat[0]
                this.normal = dat[2]
            } else {
                this.a = dat[0]
                this.b = dat[1]
                this.normal = dat[2]
            }
            this.depth = dat[3]
            this.hasCollision = dat[4]
            if (this.hasCollision) {
                //new CollisionPoints(a, b)
                //console.log(this)
            }
        }
    }

    testCircleCircle(a, b, sideBySide = false) {
        
    }

    testCircleLine(a, b, sideBySide = false) {
        let circleCenter = a.position
        let lineStart = b.colliderData[0]
        lineStart = new Vector(lineStart, b.colliderData[1]).rotate2D(b.rotation).add(b.position)
        let lineEnd = b.colliderData[2]
        lineEnd = new Vector(lineEnd, b.colliderData[3]).rotate2D(b.rotation).add(b.position)
        let AC = circleCenter.sub(lineStart)
        let AB = lineEnd.sub(lineStart)
        let D = AC.proj(AB).add(lineStart)
        let CD = circleCenter.sub(D)
        let dist = CD.length()
        let coll = dist < a.colliderData[0]
        if (sideBySide) coll = dist <= a.colliderData[0]
        return [CD.normalized().mul(a.colliderData), D, CD.normalized(), -(dist - a.colliderData[0]), coll]
    }

    testCircleRect(a, b, sideBySide = false) {
        
    }

    testCirclePoly(a, b, sideBySide = false) {
        
    }

    testLineLine(a, b, sideBySide = false) {
        
    }

    testLineRect(a, b, sideBySide = false) {
        doFill = false
        strokeWeight(1)

        let rectSize = new Vector(b.colliderData[0], b.colliderData[1]).mul(0.5)
        let rectA = rectSize.rotate2D(b.rotation + PI).add(b.position)
        let rectB = rectSize.rotate2D(b.rotation + (PI / 2)).add(b.position)
        let rectD = rectSize.rotate2D(b.rotation - (PI / 2)).add(b.position)
        let rectC = rectSize.rotate2D(b.rotation).add(b.position)

        let lineStart = new Vector(a.colliderData[0], a.colliderData[1]).rotate2D(a.rotation).add(a.position)
        let lineEnd = new Vector(a.colliderData[2], a.colliderData[3]).rotate2D(a.rotation).add(a.position)

        stroke('white')
        circle(rectA.x, canvas.height - rectA.y, 4)
        circle(rectB.x, canvas.height - rectB.y, 4)
        circle(rectC.x, canvas.height - rectC.y, 4)
        circle(rectD.x, canvas.height - rectD.y, 4)
        line(lineStart.x, canvas.height - lineStart.y, lineEnd.x, canvas.height - lineEnd.y)

        let pointAB = intersectLines(rectA, rectB, lineStart, lineEnd, true)
        let pointAD = intersectLines(rectA, rectD, lineStart, lineEnd, true)
        let pointCB = intersectLines(rectC, rectB, lineStart, lineEnd, true)
        let pointCD = intersectLines(rectC, rectD, lineStart, lineEnd, true)

        let intersection = pointAB || pointAD || pointCB || pointCD

        let AC = b.position.sub(lineStart)
        let AB = lineEnd.sub(lineStart)
        let D = AC.proj(AB).add(lineStart)

        let CD = b.position.sub(D)

        let aDepth = rectA.proj(CD).length()
        let bDepth = rectB.proj(CD).length()
        let cDepth = rectC.proj(CD).length()
        let dDepth = rectD.proj(CD).length()

        let deepestVert = ['aDepth', aDepth, rectA]
        if (bDepth < deepestVert[1]) deepestVert = ['bDepth', bDepth, rectB]
        if (cDepth < deepestVert[1]) deepestVert = ['cDepth', cDepth, rectC]
        if (dDepth < deepestVert[1]) deepestVert = ['dDepth', dDepth, rectD]
        
        if (aDepth == deepestVert[1]) deepestVert = [deepestVert[0] + 'aDepth', aDepth, rectA.add(deepestVert[2]).mul(0.5)]
        if (bDepth == deepestVert[1]) deepestVert = [deepestVert[0] + 'bDepth', bDepth, rectB.add(deepestVert[2]).mul(0.5)]
        if (cDepth == deepestVert[1]) deepestVert = [deepestVert[0] + 'cDepth', cDepth, rectC.add(deepestVert[2]).mul(0.5)]
        if (dDepth == deepestVert[1]) deepestVert = [deepestVert[0] + 'dDepth', dDepth, rectD.add(deepestVert[2]).mul(0.5)]

        AC = deepestVert[2].sub(lineStart)
        D = AC.proj(AB).add(lineStart)

        let collision = D.sub(deepestVert[2])

        stroke('yellow')
        let deep = deepestVert[2]
        line(deep.x, canvas.height - deep.y, D.x, canvas.height - D.y)
        circle(D.x, canvas.height - D.y, 10)

        stroke('purple')
        circle(deep.x, canvas.height - deep.y, 5)
        stroke('green')
        let c = collision.add(deep)
        line(deep.x, canvas.height - deep.y, c.x, canvas.height - c.y)
        circle(c.x, canvas.height - c.y, 5)

        if (pointAB) circle(pointAB.x, canvas.height - pointAB.y, 3)
        if (pointAD) circle(pointAD.x, canvas.height - pointAD.y, 3)
        if (pointCB) circle(pointCB.x, canvas.height - pointCB.y, 3)
        if (pointCD) circle(pointCD.x, canvas.height - pointCD.y, 3)

        if (!intersection) {
            return [null, null, null, 0, false]
        }
        return [D, deepestVert[2].sub(b.position), collision.normalized(), collision.length(), intersection != null]
    }

    testLinePoly(a, b, sideBySide = false) {
        
    }

    testRectRect(a, b, sideBySide = false) {
        let collided = false
        let p1 = new Vector(Math.max(x1, x2), Math.max(y1, y2))
        let p2 = new Vector(Math.min(x1+w1, x2+w2), Math.min(y1+h1, y2+h2))
    
        if (sideBySide) {
            if (p2.x-p1.x >= 0 && p2.y-p1.y >= 0) {
                collided = true
            }
        } else {
            if (p2.x-p1.x > 0 && p2.y-p1.y > 0) {
                collided = true
            }
        }
    
        return collided
    }

    testRectPoly(a, b, sideBySide = false) {
        
    }

    testPolyPoly(a, b, sideBySide = false) {
        
    }
}

/// FUNCTIONS ///
function intersectLines(as, ae, bs, be, aSegment = false, bSegment = false) {
    stroke('white')
    line(as.x, canvas.height - as.y, ae.x, canvas.height - ae.y)
    line(bs.x, canvas.height - bs.y, be.x, canvas.height - be.y)

    const denominator = ((as.x - ae.x) * (bs.y - be.y)) - ((as.y - ae.y) * (bs.x - be.x))

    if (denominator === 0) {
        return null
    }

    const numerator1 = ((be.x - bs.x) * (as.y - bs.y)) - ((be.y - bs.y) * (as.x - bs.x))
    const numerator2 = ((ae.x - as.x) * (as.y - bs.y)) - ((ae.y - as.y) * (as.x - bs.x))

    const a = numerator1 / denominator
    const b = numerator2 / denominator

    const intersectionX = as.x + a * (ae.x - as.x)
    const intersectionY = as.y + a * (ae.y - as.y)

    stroke('blue')
    circle(intersectionX, canvas.height - intersectionY, 3)

    if (aSegment && (a < 0 || a > 1)) {
        return null
    }
    if (bSegment && (b < 0 || b > 1)) {
        return null
    }

    stroke('red')
    circle(intersectionX, canvas.height - intersectionY, 3)

    return new Vector(intersectionX, intersectionY)
}



//////////////////
///// STATES /////
//////////////////

/// CLASSES ///
class State {
    constructor(name, condition, callback) {
        this.condition = condition
        this.call = callback
        data.states[name] = this
    }
}

/// FUNCTIONS ///



//////////////////
///// EVENTS /////
//////////////////

/// CLASSES ///
class Event {
    constructor(callback) {
        this.call = callback
    }

    run() {
        data.events.push(this)
    }
}

/// FUNCTIONS ///
function triggerEvent() {
    if (data.events.length) {
        data.events.pop().call()
    }
}



///////////////////
///// GENERAL /////
///////////////////

/// CLASSES ///
class Vector {
    constructor(...args) {
        this.value = [...args]
        this.axis = []
        for (let i = 0; i < this.value.length; i++) {
            this.axis[i] = []
            for (let j = 0; j < this.value.length; j++) {
                this.axis[i][j] = j == i ? 1 : 0
            }
        }
    }

    get x() {
        return this.value[0]
    }

    set x(val) {
        this.value[0] = val
    }

    get y() {
        return this.value[1]
    }

    set y(val) {
        this.value[1] = val
    }

    get z() {
        return this.value[2]
    }

    set z(val) {
        this.value[2] = val
    }

    get absolute() {
        return this.value// * this.axis
    }

    set absolute(val) {
        this.value = val// / this.axis
    }

    add(vec) {
        let value = []
        let abs = this.absolute
        let abs2 = vec.absolute
        for (let i in this.absolute) {
            value[i] = abs[i] + abs2[i]
        }
        return new Vector(...value)
    }

    sub(vec) {
        let value = []
        let abs = this.absolute
        let abs2 = vec.absolute
        for (let i in this.absolute) {
            value[i] = abs[i] - abs2[i]
        }
        return new Vector(...value)
    }

    mul(num) {
        let value = []
        for (let i in this.value) {
            value[i] = this.value[i] * num
        }
        return new Vector(...value)
    }

    mulVec(vec) {
        let value = []
        let abs = this.absolute
        let abs2 = vec.absolute
        for (let i in this.absolute) {
            value[i] = abs[i] * abs2[i]
        }
        return new Vector(...value)
    }

    dot(vec) {
        let value = 0
        let abs = this.absolute
        let abs2 = vec.absolute
        for (let i in this.absolute) {
            value += abs[i] * abs2[i]
        }
        return value
    }

    cross(vec) {
        return (this.x * vec.y) - (this.y * vec.x)
    }

    proj(vec) {
        let k = this.dot(vec) / vec.dot(vec)
        return vec.mul(k)
    }

    ref(norm) {
        let n = norm.normalized()
        return this.sub(n.mul(2 * this.dot(n)))
    }

    rotate2D(angle) {
        return new Vector(
            Math.cos(-angle) * this.x - Math.sin(-angle) * this.y,
            Math.sin(-angle) * this.x + Math.cos(-angle) * this.y
        )
    }

    length() {
        return Math.sqrt(this.value.reduce((a, c) => a + (c ** 2), 0))
    }

    normalized() {
        if (this.length() == 0) return this.mul(1)
        return this.mul(1 / this.length())
    }
}

/// FUNCTIONS ///
function createTimer(name, time, callback) {
    data.timers[name] = time
    new State(name, () => data.timers[name] <= 0, callback)
}

Math.cot = (angle) => {
    if (Math.sin(angle) == 0) {
        return Infinity
    }
    return Math.cos(angle) / Math.sin(angle);
}

Math.sharedFactor = (a, b) => {
    a = Math.abs(a)
    b = Math.abs(b)
    if (a < b) {
        let t = a
        a = b
        b = t
    }
    if (b == 0 || b == a) {
        return a
    }
    d = Math.floor(a / b)
    c = a - (b * d)
    return Math.sharedFactor(b, c)
}



/////////////////
///// INPUT /////
/////////////////

/// CLASSES ///
class Input {
    constructor() {
        this.keysdown = []
        this.buttonsdown = []
        this.keysup = []
        this.buttonsup = []
        this.keys = []
        this.buttons = []
        this.mouseX = 0;
        this.mouseY = 0;
        let input = this
        document.addEventListener("keydown", function(event) {
            if (event.repeat) return
            input.keysdown.push(event.key)
            input.buttonsdown.push(event.code)
            input.keys.push(event.key)
            input.buttons.push(event.code)
            input.keysdown = [...new Set(input.keysdown)]
            input.buttonsdown = [...new Set(input.buttonsdown)]
            input.keys = [...new Set(input.keys)]
            input.buttons = [...new Set(input.buttons)]
        })
        document.addEventListener("keyup", function(event) {
            if (event.repeat) return
            input.keysup.push(event.key)
            input.buttonsup.push(event.code)
            input.keys = input.keys.filter((v) => v != event.key)
            input.buttons = input.buttons.filter((v) => v != event.code)
            input.keysup = [...new Set(input.keysup)]
            input.buttonsup = [...new Set(input.buttonsup)]
            input.keys = [...new Set(input.keys)]
            input.buttons = [...new Set(input.buttons)]
        })
        document.addEventListener('mousemove', function(event) {
            input.mouseX = event.clientX;
            input.mouseY = event.clientY;
        })
        document.addEventListener("mousedown", function(event) {
            if (event.repeat) return
            input.buttonsdown.push((['LeftMouseButton', 'MiddleMouseButton', 'RightMouseButton', 'BrowserBack', 'BrowserForward'])[event.button])
            input.buttons.push((['LeftMouseButton', 'MiddleMouseButton', 'RightMouseButton', 'BrowserBack', 'BrowserForward'])[event.button])
            input.buttonsdown = [...new Set(input.buttonsdown)]
            input.buttons = [...new Set(input.buttons)]
        })
        document.addEventListener("mouseup", function(event) {
            if (event.repeat) return
            input.buttonsup.push((['LeftMouseButton', 'MiddleMouseButton', 'RightMouseButton', 'BrowserBack', 'BrowserForward'])[event.button])
            input.buttons = input.buttons.filter((v) => v != (['LeftMouseButton', 'MiddleMouseButton', 'RightMouseButton', 'BrowserBack', 'BrowserForward'])[event.button])
            input.buttonsup = [...new Set(input.buttonsup)]
            input.buttons = [...new Set(input.buttons)]
        })
    }

    tick() {
        this.keysdown = []
        this.buttonsdown = []
        this.keysup = []
        this.buttonsup = []
    }

    isKeyDown(key) {
        return this.keys.includes(key) 
    }

    isButtonDown(button) {
        return this.buttons.includes(button)
    }

    isKeyPressed(key) {
        return this.keysdown.includes(key)
    }

    isButtonPressed(button) {
        return this.buttonsdown.includes(button)
    }

    isKeyReleased(key) {
        return this.keysup.includes(key)
    }

    isButtonReleased(button) {
        return this.buttonsup.includes(button)
    }

    getAxis(pos, neg) {
        return (this.isButtonDown(pos)?1:0) - (this.isButtonDown(neg)?1:0)
    }

    getKeyAxis(pos, neg) {
        return (this.isKeyDown(pos)?1:0) - (this.isKeyDown(neg)?1:0)
    }

    getVector(xp, xn, yp, yn) {
        let vec = new Vector(input.getAxis(xp, xn), input.getAxis(yp, yn))
        return vec.normalized()
    }

    async readClipboard() {
        try {
            let dat = await navigator.clipboard.read()
            dat = dat[0]
            if (dat.types.length > 0) {
                dat = await dat.getType(dat.types[0])
                dat = await dat.text()
                return dat
            }
            return null
        } catch (error) {
            console.error(error.message)
            return null
        }
    }

    async writeClipboard(data) {
        try {
            let output = data
            if (typeof output == 'string') {
                let type = "text/plain"
                let clipboardItemData = {
                    [type]: output,
                }
                output = [new ClipboardItem(clipboardItemData)]
            }
            await navigator.clipboard.write(output)
        } catch (error) {
            console.error(error.message)
        }
    }

    loadFile(multi = false) {
        let inp = document.createElement('input')
        inp.name = 'load'
        inp.type = 'file'
        if (multi) inp.multiple = true
        document.body.appendChild(inp)
        inp.click()
        let out = null
        inp.addEventListener("change", handleFiles, false);
        function handleFiles() {
            if (multi) out = this.files
            else out = this.files[0]
            inp.remove()
        }
        return new Promise((resolve) => {
            let checkInterval = setInterval(() => {
                if (out != null) {
                    clearInterval(checkInterval);
                    resolve(out);
                }
            }, 1)
        })
    }

    readFile(file) {
        let reader = new FileReader()
        let out = null
        reader.onload = () => {
            out = reader.result
        }
        reader.readAsText(file)
        return new Promise((resolve) => {
            let checkInterval = setInterval(() => {
                if (out != null) {
                    clearInterval(checkInterval);
                    resolve(out);
                }
            }, 1)
        })
    }

    saveFile(data, name = 'file.txt') {
        let blob = data
        if (typeof blob == 'string') blob = new Blob([blob], {type: 'text/plain'})
        let fileURL = URL.createObjectURL(blob)
        let link = document.createElement('a')
        link.href = fileURL
        link.download = name
        document.body.appendChild(link)
        link.click()
        URL.revokeObjectURL(fileURL)
        link.remove()
    }
}

/// FUNCTIONS ///



/////////////////////
///// STRUCTURE /////
/////////////////////

/// CLASSES ///

/// FUNCTIONS ///
function exit() {
    close = true
}

function _tick() {
    canvas.context.resetTransform()
    transforms.length = 0
    let time = Date.now()
    let deltaTime = (time - prevTime) / 1000

    if (typeof tick === 'function') {
        tick(deltaTime)
    }

    entities = entities.sort((child) => child.zIndex)
    for (let entity in entities) {
        entities[entity].draw()
    }

    physicsServer.tick(deltaTime)

    for (let timer in data.timers) {
        data.timers[timer] -= deltaTime
    }

    for (let state in data.states) {
        let name = state
        state = data.states[name]
        if (state.condition()) {
            state.call()
        }
    }

    input.tick()

    prevTime = Date.now()
    if (!close) requestAnimationFrame(_tick)
}

function run() {
    document.body.style.margin = 0
    canvas = new Canvas()
    physicsServer = new PhysicsServer()
    input = new Input()
    
    if (typeof start === 'function') {
        start()
    }

    requestAnimationFrame(_tick)
}

window.addEventListener("load", run)
