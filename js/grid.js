class Grid {
    #rows;
    #cols;
    #rules;
    #cells;
    
    constructor(rows, cols, cellType) {
        this.#rows = rows;
        this.#cols = cols;
        this.#rules = [];
        this.#cells = Array.from(
            {length: rows},
            () => new Array(cols).fill(cellType)
        );
    }

    get rows() {return this.#rows;}
    get cols() {return this.#cols;}

    addRule(rule) {
        for (let symmetry of rule.symmetries)
            this.#rules.push(symmetry);
    }

    removeRule(rule) {
        for (let symmetry of rule.symmetries) {
            let index = this.#rules.indexOf(symmetry);
            if (index < 0) continue;
            this.#rules.splice(index, 1);
        }
    }

    getCell(row, col) {
        return (this.#cells[row] ?? [])[col];
    }

    setCell(cellType, row, col) {
        if (!this.isInBounds(row, col)) return;
        this.#cells[row][col] = cellType;
    }

    isInBounds(row, col) {
        return !!this.getCell(row, col);
    }

    update() {
        let possibleApplications = [];
        for (let rule of this.#rules) {
            for (let r = -rule.rows; r < this.#rows; r++) {
                for (let c = -rule.cols; c < this.#cols; c++) {
                    if (rule.matches(this, r, c))
                        possibleApplications.push(
                            new RuleApplication(rule, r, c)
                        );
                }
            }
        }
        let updatedMap = Array.from(
            {length: this.#rows},
            () => new Array(this.#cols).fill(false)
        );
        while (possibleApplications.length) {
            let index = Math.floor(Math.random() * possibleApplications.length);
            let current = possibleApplications.splice(index, 1)[0];
            let updated = false;
            for (let r = 0; r < current.rule.rows; r++) {
                for (let c = 0; c < current.rule.cols; c++) {
                    if (this.isInBounds(current.row + r, current.col + c) && updatedMap[current.row + r][current.col + c]) {
                        updated = true;
                        break;
                    }
                }
                if (updated) break;
            }
            if (updated) continue;
            let indexed = current.rule.getIndexed(this, current.row, current.col);
            for (let r = 0; r < current.rule.rows; r++) {
                let cr = current.row + r;
                for (let c = 0; c < current.rule.cols; c++) {
                    let cc = current.col + c;
                    let result = current.rule.getResult(this, indexed, r, c);
                    if (!result) continue;
                    if (result === this.getCell(cr, cc)) continue;
                    this.setCell(result, cr, cc);
                    if (this.isInBounds(cr, cc))
                        updatedMap[cr][cc] = true;
                }
            }
        }
    }

    draw(ctx) {
        let canvas = ctx.canvas;
        let xScale = canvas.width / this.#cols;
        let yScale = canvas.height / this.#rows;
        let scale = Math.min(xScale, yScale);
        let width = this.#cols * scale;
        let height = this.#rows * scale;
        let left = (canvas.width - width) / 2;
        let top = (canvas.height - height) / 2;
        for (let row = 0; row < this.#rows; row++) {
            let y = Math.floor(top + row * scale);
            for (let col = 0; col < this.#cols; col++) {
                let x = Math.floor(left + col * scale);
                ctx.fillStyle = this.getCell(row, col).color;
                ctx.fillRect(x, y, Math.ceil(scale), Math.ceil(scale));
            }
        }
    }
}