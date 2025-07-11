let selected = 0
let selectedValue = null
let scroll = 0
let scrollDirection = 1
let argumentIndex = 1
let time = 0

function start() {
    data.rootCircle = new AlchemyCircle('circle')
    data.rootCircle.add()
    data.tree = [
        [
            null,
            true,
            null
        ]
    ]
    parseTree()
}

async function tick(delta) {
    canvas.width = canvas.screenWidth
    canvas.height = canvas.screenHeight
    if (canvas.width / 1.5 < canvas.height) {
        data.panelX = canvas.width / 1.5
        data.panelXS = canvas.width / 3
    } else {
        data.panelX = canvas.height
        data.panelXS = canvas.width - canvas.height
    }
    data.rootCircle.size = data.panelX / 2
    data.rootCircle.position = new Vector(data.panelX / 2, canvas.height / 2)
    background(0)
    doFill = true
    doStroke = true
    fill(90)
    stroke(135)
    strokeWeight(4)
    rect(data.panelX, 0, data.panelXS, canvas.height / 2, 1)
    rect(data.panelX, canvas.height / 2, data.panelXS, canvas.height / 2, 1)
    render()
    let options = [
        ['circle', ''],
        ['ngon', '(1: vertex count, 2: connection length)'],
        ['ncircles', '(1: circle count)'],
        ['spread', '(1: id)'],
        ['scale', '(1: scaling ratio)'],
        ['rotate', '(1: angle)'],
        ['spin', '(1: angle per second)'],
        ['none', '']
    ]
    options.forEach((v, i) => {
        doFill = true
        doStroke = false
        fill(0)
        if (
            input.mouseX >= data.panelX + 5 &&
            input.mouseX <= data.panelX + data.panelXS - 5 &&
            input.mouseY >= 5 + i * 25 + canvas.height / 2 &&
            input.mouseY <= 25 + i * 25 + canvas.height / 2
        ) {
            fill(31)
            if (input.isButtonPressed('LeftMouseButton')) {
                selectedValue = [v[0]]
            }
        }
        rect(data.panelX + 5, 5 + i * 25 + canvas.height / 2, data.panelXS - 10, 20, 1)
        if (v[0]) {
            fill(255)
            text(v[0] + ' ' + v[1], data.panelX + 7, 18 + i * 25 + canvas.height / 2)
        }
    })
    button('copy', () => {
        input.writeClipboard(JSON.stringify(data.tree))
    }, data.panelX + 7, canvas.height - 50, (data.panelXS / 2) - 10, 20)
    button('paste', async () => {
        let tree = await input.readClipboard()
        if (tree) data.tree = JSON.parse(tree)
    }, data.panelX + 2 + (data.panelXS / 2), canvas.height - 50, (data.panelXS / 2) - 10, 20)
    button('save', () => {
        input.saveFile(JSON.stringify(data.tree), 'circle.json')
    }, data.panelX + 7, canvas.height - 25, (data.panelXS / 2) - 10, 20)
    button('load', async () => {
        let tree = await input.loadFile()
        tree = await input.readFile(tree)
        if (tree) data.tree = JSON.parse(tree)
    }, data.panelX + 2 + (data.panelXS / 2), canvas.height - 25, (data.panelXS / 2) - 10, 20)
    button('scroll direction: ' + (scrollDirection == 1 ? 'down' : 'up'), async () => {
        scrollDirection = -scrollDirection
    }, data.panelX + 7, canvas.height - 75, data.panelXS - 15, 20)
    if (input.isButtonPressed('ArrowUp') && selected > 0) {
        selected--
        while (25 + (selected - Math.floor(scroll)) * 25 > canvas.height / 2) scroll++
        while (5 + (selected - Math.floor(scroll)) * 25 < 0) scroll--
    }
    if (input.isButtonPressed('ArrowDown')) {
        selected++
        while (25 + (selected - Math.floor(scroll)) * 25 > canvas.height / 2) scroll++
        while (5 + (selected - Math.floor(scroll)) * 25 < 0) scroll--
    }
    if (input.isButtonPressed('ArrowLeft') && argumentIndex > 1) argumentIndex--
    if (input.isButtonPressed('ArrowRight')) argumentIndex++
    scroll += input.wheelDelta * 0.01 * scrollDirection
    if (scroll < 0) scroll = 0
    parseTree()
    time += delta
}

function render(arr = data.tree, ind = 1, origin = 0, path = []) {
    let i = -1
    arr.forEach((v, j) => {
        if (path.length == 0 || v[1] || v[0] != null) {
            i++
            doFill = true
            doStroke = false
            fill(0)
            if (
                input.mouseX >= data.panelX + ind * 5 &&
                input.mouseX <= data.panelX + ind * 5 + data.panelXS - (ind + 1) * 5 &&
                input.mouseY >= 5 + (i + origin - Math.floor(scroll)) * 25 &&
                input.mouseY <= 25 + (i + origin - Math.floor(scroll)) * 25 &&
                25 + (i + origin - Math.floor(scroll)) * 25 < canvas.height / 2
            ) {
                fill(31)
                if (input.isButtonPressed('LeftMouseButton')) {
                    selected = i + origin
                    argumentIndex = 1
                }
            }
            if (selected == (i + origin)) {
                fill(63)
                let a = data.tree
                for (let index of path) {
                    a = a[index][2]
                }
                if (selectedValue != null) {
                    a[j][0] = selectedValue
                    a[j][2] = []
                    if (selectedValue[0] == 'none') a[j] = [null, true, null]
                    selectedValue = null
                }
                if (a[j][0] && !a[j][0][argumentIndex]) a[j][0][argumentIndex] = ''
                if (a[j][0]) a[j][0][argumentIndex] += input.keysdown.filter((v) => '0123456789.-'.split('').includes(v)).join('')
                if (a[j][0] && input.isKeyPressed('Backspace')) a[j][0][argumentIndex] = a[j][0][argumentIndex].slice(0, -1)
            }
            if (25 + (i + origin - Math.floor(scroll)) * 25 < canvas.height / 2) {
                rect(data.panelX + ind * 5, 5 + (i + origin - Math.floor(scroll)) * 25, data.panelXS - (ind + 1) * 5, 20, 1)
                fill(255)
                if (v[0]) {
                    while ((v[0].length > 1 && v[0][v[0].length - 1] == '') && !(v[0].length - 1 <= argumentIndex && (i + origin) == selected)) {
                        v[0].pop();
                    }
                    v[0] = Array.from(v[0], item => item === undefined ? '' : item)
                    text(j + ': ' + v[0].map((a, b) => b == argumentIndex && (i + origin) == selected ? '_' + a + '_' : a).map((a, b) => b != 0 ? b + ': ' + a : a).join(', '), data.panelX + ind * 5 + 2, 18 + (i + origin - Math.floor(scroll)) * 25)
                    i += render(v[2], ind + 1, i + origin + 1, [...path, j])
                } else {
                    text(j, data.panelX + ind * 5 + 2, 18 + (i + origin - Math.floor(scroll)) * 25)
                }
            }
        }
    })
    return i + 1
}

function parseTree(arr = [data.tree[0]], origin = data.rootCircle, path = [], stop = []) {
    origin.children.length = 0
    origin.open = origin.open.map(() => true)
    function handleNode(v, i, o, pos, p, s) {
        if (v[0][0] == 'spread') {
            let num = Number(v[0][1]) || 1
            if (s.includes(num)) return
            if (!data.tree[num]) data.tree[num] = [null, true, null]
            let val = data.tree[num]
            if (val != null && val[0] != null) {
                handleNode(val, num, o, pos, [], [...s, num])
            }
        } else {
            let circle = new AlchemyCircle(v[0][0], o, pos, ...v[0].slice(1).map((value) => Number(value)))
            if (arr[i][2] instanceof Array) {
                let a = data.tree
                for (let index of p) {
                    a = a[index][2]
                }
                for (let n in a.map((a, b) => b)) {
                    a[n][1] = o.open[n]
                }
                while (circle.openings.length > a[i][2].length) {
                    a[i][2].push([null, true, null])
                }
                while (circle.openings.length < a[i][2].length) {
                    a[i][2].pop()
                }
            }
            parseTree(v[2], circle, [...p, i], s)
        }
    }
    arr.forEach((v, i) => {
        if (v != null && v[0] != null) {
            handleNode(v, i, origin, i, path, stop)
        }
    })
}

function button(label, callback, x, y, xSize, ySize) {
    doFill = true
    doStroke = false
    fill(0)
    if (
        input.mouseX >= x &&
        input.mouseX <= x + xSize &&
        input.mouseY >= y &&
        input.mouseY <= y + ySize
    ) {
        fill(31)
        if (input.isButtonPressed('LeftMouseButton')) {
            fill(63)
            callback()
        }
    }
    rect(x, y, xSize, ySize, 1)
    fill(255)
    text(label, x + 2, y + 12)
}
//*/
