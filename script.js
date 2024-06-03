const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const codeArea = document.getElementById("code");

attachEventListeners(canvas);

function mainUpdateCode() {
    let code = codeArea.innerText;
    let parts = code.split("\n\n");
    let elements = parts.shift().split("\n").map(x => x.trim());
    let originalElements = elements.map(x => x);
    elements = elements.map(x => x.split(" ").map(y => y.trim()));
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].length !== 3) {
            errors.push(
                "Invalid element definition: " + originalElements[i]
            );
        }
    }
    if (errors.length) return;
    if (parts.length) {
        let replacements = parts.shift();
        if (replacements.includes(":=")) {
            replacements = replacements.split("\n");
            let originalReplacements = replacements.map(x => x);
            replacements = replacements.map(
                x => x.split(":=").map(y => y.trim())
            );
            for (let i = 0; i < replacements.length; i++) {
                if (replacements[i].length !== 2) {
                    errors.push(
                        "Invalid replacement: " + originalReplacements[i]
                    );
                }
            }
            if (errors.length) return;
            replacements.sort((x, y) => y[0].length - x[0].length);
            for (let [start, end] of replacements) {
                parts = parts.map(x => x.replaceAll(start, end));
            }
        } else {
            parts.unshift(replacements);
        }
    }
    let mapping = {};
    selectable = {};
    selected = null;
    for (let [name, key, color] of elements) {
        selectable[key] = mapping[name] = new CellType(color);
        if (!selected) selected = key;
    }
    defaultType = mapping[elements[0][0]];
    grid = new Grid(50, 50, defaultType);
    for (let ruleText of parts) {
        try {
            grid.addRule(Rule.fromText(ruleText, mapping));
        } catch (e) {
            errors.push(e);
        }
    }
}

function updateCode() {
    errors = [];
    mainUpdateCode();
    let logText;
    if (errors.length) {
        logText = `Found ${errors.length} error(s):\n${errors.join("\n")}`;
    } else {
        logText = "Successfully updated.";
    }
    document.getElementById("log").innerHTML = logText
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

setTimeout(() => {
    codeArea.innerHTML = INITIAL_CONTENT
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
    updateCode();
}, 100);

let grid, mapping, selected, selectable, defaultType;
let errors = [];

let BRUSH_SIZE = 4;
function placeCell(cellType, row, col) {
    for (let roff = -BRUSH_SIZE; roff <= BRUSH_SIZE; roff++) {
        let maxCoff = Math.floor(Math.sqrt(BRUSH_SIZE ** 2 - roff ** 2));
        for (let coff = -maxCoff; coff <= maxCoff; coff++) {
            grid.setCell(cellType, row + roff, col + coff);
        }
    }
    grid.draw(ctx);
}

function drawPlacing(cellType, row, col) {
    ctx.strokeStyle = cellType.color;
    ctx.lineWidth = 4;
    let xScale = canvas.width / grid.cols;
    let yScale = canvas.height / grid.rows;
    let scale = Math.min(xScale, yScale);
    let width = grid.cols * scale;
    let height = grid.rows * scale;
    let left = (canvas.width - width) / 2;
    let top = (canvas.height - height) / 2;
    ctx.arc(left + (col + 0.5) * scale, top + (row + 0.5) * scale,
            Math.max(BRUSH_SIZE, 0.5) * scale, 0, 2 * Math.PI);
    ctx.stroke();
}

let ticker = 0;
let paused = false;

function togglePaused() {
    paused = !paused;
    document.getElementById("pause").children[0].src =
        paused ? "images/play.png" : "images/pause.png";
}

function step() {
    if (!paused) togglePaused();
    grid.update();
}

function openReadme() {
    window.open("https://github.com/KinuTheDragon/cells/blob/main/README.md", "_blank");
}

setInterval(() => {
    highlightCode();
    if (!grid) return;
    canvas.width = document.body.clientWidth / 2;
    canvas.height = document.body.clientHeight;
    if (mouseButtonsDown[0] && selectable[selected]) {
        placeCell(selectable[selected], mouseRow, mouseCol);
    }
    if (mouseButtonsDown[2]) {
        placeCell(defaultType, mouseRow, mouseCol);
    }
    if (mouseButtonsDown[1] && grid.isInBounds(mouseRow, mouseCol)) {
        for (let k in selectable) {
            if (selectable[k] === grid.getCell(mouseRow, mouseCol)) {
                selected = k;
                break;
            }
        }
    }
    if (!paused) {
        ticker++;
        ticker %= 2;
        if (!ticker) grid.update();
    }
    grid.draw(ctx);
    drawPlacing(selectable[selected], mouseRow, mouseCol);
}, 1000 / 60);