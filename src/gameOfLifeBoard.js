import { rgbToHex, hexToRgb, colourAverage, colourDeviate } from './colourTypes';

export default class GameOfLifeBoard {
    constructor({
        container,
        size,
        cols,
        rows,
        minNeighbour,
        maxNeighbour,
        reviveNeighbour,
        colourPicker,
        colourDeviator,
        generation,
    }) {

        this.board = new Board({
            size: size || 20, 
            cols: cols || 60,  
            rows: rows || 60,
        }).center(container);

        this.board.isometric = false;
        this.updateGroup = {};
        this.colourPicker = colourPicker;
        this.colourDeviator = colourDeviator;
        this.generation = generation;
        this.iteration = 0;

        this.conditions = {
            min: minNeighbour || 2,
            max: maxNeighbour || 3,
            revive: reviveNeighbour || 3,
        };

        this.reset();
        this._init();
    }

    _init() {
        this.board.tiles.tap(e => {
            const tile = e.target;
            this._select(tile);
        });
    }

    reset() {
        this.board.tiles.children.forEach(tile => {
            this._resetTile(tile);
        });
        this.board.update();
        this.iteration = 0;
        this.generation.text = `${this.iteration}`;
    }

    _resetTile(tile) {
        this._setTile(tile, light);
        const id = this._getTileId(tile);
        this._removeFromUpdateGroup(id);
    }

    _removeFromUpdateGroup(id) {
        delete this.updateGroup[id];
    }

    _select(tile) {
        const curColour = this.board.getColor(tile);
        const selectedColour = this.colourPicker.selectedColor;
        if (curColour != selectedColour) {
            this._setTile(tile, selectedColour);
            this._addToUpdateGroup(tile);
            return;
        }
        this._resetTile(tile);
    }

    _setTile(tile, colour) {
        this.board.setColor(tile, colour);
        this.board.setData(tile, colour);
    }

    _addToUpdateGroup(tile) {
        const nineGrid = this.board
            .getTilesAround(tile);

        nineGrid.push(tile);

        nineGrid.map(tile => {
            const id = this._getTileId(tile);
            if (!this.updateGroup[id]) {
                this.updateGroup[id] = {
                    tile: tile,
                    id: id,
                };
            }
        });
    }

    _getTileId(tile) {
        const index = this.board.getIndexes(tile);
        return `${index.col},${index.row}`;
    }

    _getListOfUpdateGroup() {
        return Object.values(this.updateGroup);
    }

    _cleanUpdateGroup() {
        const list = this._getListOfUpdateGroup();
        const outOfBounds = list.filter(item => item.tile === undefined);
        outOfBounds.map(item => {
            this._removeFromUpdateGroup(item.id);
        });
    }

    _getNextIteration() {
        const list = this._getListOfUpdateGroup();
        const results = list.map(item => {
            const { tile, id } = item;
            const neighbours = this.board
                .getTilesAround(tile)
                .map(tile => this.board.getData(tile))
                .filter(colour => colour)
                .filter(colour => colour !== light);
            
            const neighbourCount = neighbours.length;

            if (this.board.getData(tile) !== light) {
                return this._checkLiveCell(id, tile, neighbourCount);
            }
            return this._checkDeadCell(id, tile, neighbourCount, neighbours);
        });
        return results.filter(x => x);
    }

    _checkLiveCell(id, tile, neighbourCount) {
        if (neighbourCount < this.conditions.min ||
            neighbourCount > this.conditions.max) {
            return {
                id: id,
                tile: tile,
                value: light,
            };
        }
        this._removeFromUpdateGroup(id);
        return false;
    }

    _checkDeadCell(id, tile, neighbourCount, neighbours) {
        if (neighbourCount === this.conditions.revive) {
            const newColour = colourAverage(neighbours)
            .map(c => colourDeviate(c, this.colourDeviator.currentValue));
            const hex = rgbToHex(newColour);
            return { // reviving
                id: id,
                tile: tile,
                value: hex,
            };
        }

        // if it is dead and it is still dead
        // then we assume it isn't coming alive
        this._removeFromUpdateGroup(id);
        return false;
    }

    update() {
        this._cleanUpdateGroup();
        const updateList = this._getNextIteration();
        const currentGroup = Object.values(this.updateGroup);
        currentGroup.forEach(item => {
            this._addToUpdateGroup(item.tile);
        });

        updateList.map(item => {
            this._setTile(item.tile, item.value);
        });
        this.board.update();
        this.iteration++;
        this.generation.text = `${this.iteration}`;
    }
}