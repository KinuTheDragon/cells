class CellType {
    #color;
    
    constructor(color) {
        this.#color = color;
    }

    get color() {return this.#color;}
}