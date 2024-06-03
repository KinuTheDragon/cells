let mouseRow = -1;
let mouseCol = -1;
let mouseButtonsDown = {};

function attachEventListeners(canvas) {
    document.addEventListener("mousemove", event => {
        if (!grid) return;
        let xScale = canvas.width / grid.cols;
        let yScale = canvas.height / grid.rows;
        let scale = Math.min(xScale, yScale);
        let width = grid.cols * scale;
        let height = grid.rows * scale;
        let left = (canvas.width - width) / 2;
        let top = (canvas.height - height) / 2;
        mouseRow = Math.floor((event.clientY - top) / scale);
        mouseCol = Math.floor((event.clientX - left) / scale);
    });
    document.addEventListener("mousedown", event => {
        mouseButtonsDown[event.button] ??= 0;
        mouseButtonsDown[event.button]++;
    });
    document.addEventListener("mouseup", event => {
        mouseButtonsDown[event.button] = 0;
    });
    canvas.addEventListener("wheel", event => {
        if (event.deltaY > 0) BRUSH_SIZE--;
        if (event.deltaY < 0) BRUSH_SIZE++;
        BRUSH_SIZE = Math.max(Math.min(BRUSH_SIZE, 50), 0);
    });
    canvas.addEventListener("contextmenu", event => event.preventDefault());
    document.addEventListener("keydown", event => {
        if (selectable[event.key]) selected = event.key;
    });
}