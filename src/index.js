const scaling = "fit"; // this will resize to fit inside the screen dimensions
const width = 1600;
const height = 1600;
const color = zim.light; // ZIM colors like green, blue, pink, faint, clear, etc.
const outerColor = zim.dark; // any HTML colors like "violet", "#333", etc. are fine to use

const frame = new Frame(scaling, width, height, color, outerColor);
frame.on("ready", () => { // ES6 Arrow Function - like function(){}

    const stage = frame.stage;
    let stageW = frame.width;
    let stageH = frame.height;

    const ux = new Container(stageW/2, stageH)
        .pos(0, 0, RIGHT);

    const cp = new ColorPicker(500, [red, blue, yellow, green, black], 5);
    cp.center(ux)
        .pos(100, 100);

    const boardContainer = new Container(stageW/2, stageH)
        .addTo();

    const tileSize = 20;
    const boardW = 30;
    const boardH = 30;

    const board = new Board(tileSize, boardW, boardH)
        .center(boardContainer);
    board.isometric = false;

    const play = new Button(200, 100, "PLAY");
    play.center(ux)
        .pos(100, 250);

    const pause = new Button(200, 100, "PAUSE");
    pause.center(ux)
        .pos(400, 250);

    const reset = new Button(200, 100, "CLEAR");
    reset.center(ux)
        .pos(100, 400);

    const step = new Button(200, 100, "STEP");
    step.center(ux)
        .pos(400, 400);

    const list = new Button(200, 100, "LIST")
        .center(ux)
        .pos(100, 550);

    const hexToRgb = (hex) => {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return [(c>>16)&255, (c>>8)&255, c&255];
        }
        throw new Error('Bad Hex');
    }

    const rgbToHex = (rgb) => {
        let hex = rgb.toString(16);
        if (hex.length < 2) {
             hex = "0" + hex;
        }
        return hex;
    }

    const colourAverage = (list) => {
        const num = list.length;
        const rgb = list.map(x => hexToRgb(x));
        const result = rgb.reduce((acc, cur) => {
            acc[0] += cur[0];
            acc[1] += cur[1];
            acc[2] += cur[2];
            return acc;
        }, [0, 0, 0]);

        const averaged = result.map(x => Math.ceil(x / num));
        return `#${averaged.map(x => rgbToHex(x)).join('')}`;
    }

    const updateGroup = {};

    board.tiles.children.forEach(tile => {
        board.setData(tile, false);
    });

    board.tiles.tap((e) => {
        const tile = e.target;
        const curColour = board.getColor(tile);

        if (curColour != cp.selectedColor) {
            board.setColor(tile, cp.selectedColor);
            board.setData(tile, cp.selectedColor);
            const adjacents = board.getTilesAround(tile);
            adjacents.push(tile);

            adjacents.forEach(tile => {
                const index = board.getIndexes(tile);
                const id = `${index.col},${index.row}`;
                if (!updateGroup[id]) {
                    updateGroup[id] = {
                        tile: tile,
                        id: id,
                    };
                }
            });

        } else {
            const index = board.getIndexes(tile);
            const id = `${index.col},${index.row}`;
            board.setColor(tile, "#eee");
            board.setData(tile, false);

            if (updateGroup[id]) {
                delete updateGroup[id];
            }
        }
        stage.update();
    });

    const update = () => {
        console.log('updating...');
        const list = Object.values(updateGroup);

        const outOfBounds = list.filter(item => item.tile === undefined);
        outOfBounds.forEach(item => {
            delete updateGroup[item.id];
        });
        
        const result = list.map(item => {
            const { tile } = item;
            const around = board.getTilesAround(tile);
            if (!around) {
                return false;
            }

            const aroundData = around.map(x => board.getData(x)).filter(x => x);
            const alive = aroundData.length;
            const index = board.getIndexes(tile);
            const id = `${index.col},${index.row}`;

            if (board.getData(tile)) { // alive
                if (alive < 2 || alive > 3) {
                    if (updateGroup[id]) {
                        delete updateGroup[id];
                    }
                    return { // dying
                        tile: tile,
                        value: false,
                    };

                }
                return false;
            } else { // dead
                if (alive === 3) {
                    const newColour = colourAverage(aroundData);
                    return { // reviving
                        tile: tile,
                        color: newColour,
                        value: newColour,
                    };
                }
                if (updateGroup[id]) {
                    delete updateGroup[id];
                }
                return false;
            }
        });
        const updateList = result.filter(x => x);

        const currentGroup = Object.values(updateGroup);
        currentGroup.forEach(item => {
            const adjacents = board.getTilesAround(item.tile);
            if (!adjacents) {
                return;
            }

            adjacents.forEach(tile => {
                const index = board.getIndexes(tile);
                const id = `${index.col},${index.row}`;
                if (!updateGroup[id]) {
                    updateGroup[id] = {
                        tile: tile,
                        id: id,
                    }; 
                }
            })
        });

        updateList.forEach(item => {
            board.setData(item.tile, item.value);
            board.setColor(item.tile, item.color || "#eee");
            stage.update();
        });
    }

    list.on("mousedown", () => {
        const list = Object.values(updateGroup);
        console.log(list);
    })

    step.on("mousedown", update);

    let interval = null;

    reset.on("mousedown", () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        
        for (let tile in updateGroup) {
            delete updateGroup[tile.id];
        }

        const list = board.tiles.children;
        list.forEach(tile => {
            board.setData(tile, false);
            board.setColor(tile, "#eee");
        });
        stage.update();
    });

    pause.on("mousedown", () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
            stage.update();
        }
    });

    play.on("mousedown", () => {
        interval = setInterval(update, 50);
    });

    stage.update(); // this is needed to show any changes
}); // end of ready