import { white } from "ansi-colors";

const scaling = "fit"; // this will resize to fit inside the screen dimensions
const width = 2800;
const height = 1600;
const color = zim.dark; // ZIM colors like green, blue, pink, faint, clear, etc.
const outerColor = zim.darker; // any HTML colors like "violet", "#333", etc. are fine to use

const HTMLColors = {
    Red: "#FF0000",
    Blue: "#0000FF",
    Green: "#00FF00",
    Yellow: "#FFFF00",
    Black: "#000000",
}

const maxrgbValue = 255;
let deviation = 0;
const sliderMin = 0;
const sliderMax = 30;

const frame = new Frame(scaling, width, height, color, outerColor);
frame.on("ready", () => { // ES6 Arrow Function - like function(){}

    const stage = frame.stage;
    let stageW = frame.width;
    let stageH = frame.height;

    const ux = new Container(stageW/4, stageH)
        .pos(0, 0, RIGHT);

    const cp = new ColorPicker(500, [HTMLColors.Red, HTMLColors.Blue, HTMLColors.Yellow, HTMLColors.Green, HTMLColors.Black], 5);
    cp.center(ux)
        .pos(100, 100);

    const boardContainer = new Container(stageW, stageH)
        .pos(0, 0);

    const tileSize = 20;
    const boardW = 60;
    const boardH = 60;

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

    const colourDeviation = new Label({
        text: "Colour Deviation",
        size: 50,
        color: "white",
    })
        .center(ux)
        .pos(100, 700);

    const slider = new Slider({
        min: sliderMin,
        max: sliderMax,
        step: 1,
        useTicks: true,
        barLength: 500,
        barColor: "#eee",
    })
        .center(ux)
        .pos(100, 800);

    const zero = new Label({
        text: `${sliderMin}`,
        size: 50,
        color: "white",
    })
        .center(ux)
        .pos(100, 850);

    const ten = new Label({
        text: `${sliderMax}`,
        size: 50,
        color: "white",
    })
        .center(ux)
        .pos(600, 850);

    const deviationLabel = new Label({
        text: "0",
        size: 50,
        color: "red",
    })
        .center(ux)
        .pos(350, 900);

    slider.on("change", () => {
        deviation = slider.currentValue;
        deviationLabel.text = slider.currentValue;
    });


    const explanation = new Label({
        text: "Select colour, fill cells, click play.\n\nSet slider for how much randomness is involved when blending.",
        labelWidth: 500,
        color: "white",
        size: 50,
    })
        .center(ux)
        .pos(100, 1000);


    const updateGroup = {};

    board.tiles.children.forEach(tile => {
        board.setData(tile, false);
        board.setColor(tile, light);
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
            board.setColor(tile, light);
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
                    const newColour = colourAverage(aroundData)
                        .map(c => deviate(c));
                    const hex = fullRgbToHex(newColour);
                    return { // reviving
                        tile: tile,
                        color: hex,
                        value: hex,
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
            board.setColor(item.tile, item.color || light);
        });
        stage.update();
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
            board.setColor(tile, light);
        });
        stage.update();
    });

    pause.on("mousedown", () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
            board.update();
        }
    });

    play.on("mousedown", () => {
        if (interval) {
            return;
        }
        interval = setInterval(update, 1000/10);
    });

    stage.update(); // this is needed to show any changes
}); // end of ready

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

const fullRgbToHex = (rgb) => {
    return `#${rgb.map(x => rgbToHex(x)).join('')}`;
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

    return result.map(x => Math.ceil(x / num));
}

const deviate = (value) => {
    if (!deviation) {
        return value;
    }

    const low = value > deviation 
        ? value - deviation 
        : 0;
    const high = value < maxrgbValue - deviation 
        ? value + deviation 
        : maxrgbValue;
    return  Math.floor((high - low) * Math.random()) + low;
}