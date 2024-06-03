class StartState {
    #cellTypes;
    #inverted;
    #matchesVoid;
    #index;
    
    constructor(cellTypes, inverted = false, matchesVoid = false, index = null) {
        this.#cellTypes = cellTypes;
        this.#inverted = inverted;
        this.#matchesVoid = matchesVoid;
        this.#index = index;
    }

    matches(grid, row, col) {
        if (!grid.isInBounds(row, col))
            return this.#matchesVoid;
        if (!this.#cellTypes) return true;
        let cell = grid.getCell(row, col);
        let matches = this.#cellTypes.includes(cell);
        if (this.#inverted) matches = !matches;
        return matches;
    }

    get index() {return this.#index;}

    static fromText(text, mapping) {
        let index = null;
        if (text.includes("@")) {
            [text, index] = text.match(/^([^@]*)@(.*)$/).slice(1);
            if (!text) text = "*";
        }
        let matchesVoid = false;
        if (text.endsWith("?")) {
            matchesVoid = true;
            text = text.slice(0, -1);
        }
        if (text === "*")
            return new this(null, false, matchesVoid, index);
        if (text === "")
            return new this([], false, matchesVoid, index);
        let inverted = false;
        if (text.startsWith("!")) {
            inverted = true;
            text = text.slice(1);
        }
        let cellTypes = [text];
        if (text.startsWith("[") && text.endsWith("]"))
            cellTypes = text.slice(1, -1).split(" ");
        return new this(cellTypes.map(x => mapping[x]), inverted, matchesVoid, index);
    }
}

class EndState {
    #cellType;
    #index;

    constructor(cellType = null, index = null) {
        if (cellType !== null && index !== null)
            throw new ReferenceError("EndState cannot have both cell type and index");
        this.#cellType = cellType;
        this.#index = index;
    }

    get cellType() {return this.#cellType;}
    get index() {return this.#index;}

    static fromText(text, mapping) {
        if (text === "*") return new this();
        if (text.startsWith("@"))
            return new this(null, text.slice(1));
        if (!mapping[text])
            throw "Unknown element: " + text;
        return new this(mapping[text]);
    }
}

class Rule {
    #startState;
    #endState;
    #data;

    constructor(startState, endState, data) {
        this.#startState = startState;
        this.#endState = endState;
        this.#data = data;
    }

    get rows() {return this.#startState.length;}
    get cols() {return this.#startState[0].length;}

    matches(grid, row, col) {
        if (this.#data.chance !== undefined) {
            if (Math.random() * 100 > this.#data.chance) return false;
        }
        let indexed = {};
        for (let r = 0; r < this.rows; r++) {
            let gridRow = row + r;
            for (let c = 0; c < this.cols; c++) {
                let gridCol = col + c;
                let startState = this.#startState[r][c];
                if (!startState.matches(grid, gridRow, gridCol))
                    return false;
                if (startState.index !== null) {
                    let cellType = grid.getCell(gridRow, gridCol);
                    indexed[startState.index] ??= cellType;
                    if (indexed[startState.index] !== cellType) return false;
                }
            }
        }
        return true;
    }

    getIndexed(grid, row, col) {
        let indexed = {};
        for (let r = 0; r < this.rows; r++) {
            let gridRow = row + r;
            for (let c = 0; c < this.cols; c++) {
                let gridCol = col + c;
                let startState = this.#startState[r][c];
                if (startState.index !== null) {
                    let cellType = grid.getCell(gridRow, gridCol);
                    indexed[startState.index] = cellType;
                }
            }
        }
        return indexed;
    }

    getResult(grid, indexed, row, col) {
        let endState = this.#endState[row][col];
        let isCellType = endState.cellType !== null;
        let isIndex = endState.index !== null;
        if (!isCellType && !isIndex) return null;
        if (isCellType) return endState.cellType;
        return indexed[endState.index] ?? null;
    }

    get symmetries() {
        let symmetry = this.#data.sym;
        let outputs = [this];
        if (!symmetry) return outputs;
        if (symmetry.includes("h"))
            outputs = outputs.concat(outputs.map(x => x.flippedHorizontally));
        if (symmetry.includes("v"))
            outputs = outputs.concat(outputs.map(x => x.flippedVertically));
        if (symmetry.includes("r")) {
            outputs = outputs.concat(
                outputs.map(x => x.rotated),
                outputs.map(x => x.rotated.rotated),
                outputs.map(x => x.rotated.rotated.rotated)
            );
        }
        return outputs;
    }

    get flippedHorizontally() {
        return new Rule(
            this.#startState.map(row => row.toReversed()),
            this.#endState.map(row => row.toReversed()),
            this.#data
        );t
    }

    get flippedVertically() {
        return new Rule(
            this.#startState.toReversed(),
            this.#endState.toReversed(),
            this.#data
        );
    }

    get rotated() {
        let rot = matrix => matrix[0].map((val, index) => matrix.map(row => row[row.length-1-index]));
        return new Rule(
            rot(this.#startState),
            rot(this.#endState),
            this.#data
        );
    }

    static fromText(text, mapping) {
        const DEFAULT_START = "*?";
        const DEFAULT_END = "*";
        let errorText = ("\n" + text).replaceAll("\n", "\n    ");
        if (!text.includes("=>"))
            throw "Invalid rule (no =>):" + errorText;
        let ruleParts = text.split("=>").map(
            x => x.trim().split("\n").map(y => y.trim())
        );
        if (ruleParts.length > 2)
            throw "Invalid rule (multiple =>):" + errorText;
        let [start, end] = ruleParts;
        let data = {};
        if (start[0].includes(":")) {
            let tags = start.shift();
            for (let pair of tags.trim().split(" ")) {
                let [key, value] = pair.match(/^(\w*):(.*)$/).slice(1);
                if (!isNaN(+value)) value = +value;
                data[key] = value;
            }
        }
        let startGrid = start.map(line => line.split(","));
        let endGrid = end.map(line => line.split(","));
        let rows = Math.max(startGrid.length, endGrid.length);
        let cols = Math.max(
            ...startGrid.map(x => x.length),
            ...endGrid.map(x => x.length)
        );
        startGrid = startGrid.map(
            row => row.concat(new Array(cols - row.length).fill(DEFAULT_START))
        );
        while (startGrid.length < rows)
            startGrid.push(new Array(cols).fill(DEFAULT_START));
        endGrid = endGrid.map(
            row => row.concat(new Array(cols - row.length).fill(DEFAULT_END))
        );
        while (endGrid.length < rows)
            endGrid.push(new Array(cols).fill(DEFAULT_END));
        return new this(
            startGrid.map(
                row => row.map(
                    x => StartState.fromText(x, mapping)
                )
            ),
            endGrid.map(
                row => row.map(
                    x => EndState.fromText(x, mapping)
                )
            ),
            data
        );
    }
}

class RuleApplication {
    #rule;
    #row;
    #col;
    
    constructor(rule, row, col) {
        this.#rule = rule;
        this.#row = row;
        this.#col = col;
    }

    get rule() {return this.#rule;}
    get row() {return this.#row;}
    get col() {return this.#col;}
}