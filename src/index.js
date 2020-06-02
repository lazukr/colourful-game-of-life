import GameOfLifeBoard from './gameOfLifeBoard';

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

const SLIDE_MIN = 0;
const SLIDE_MAX = 30;
const FONT_SIZE = 50;
const TILE_SIZE = 20;
const BOARD_ROWS = 60;
const BOARD_COLS = 60;
const BUTTON_WIDTH = 200;
const BUTTON_HEIGHT = 100;
const MIN_NEIGHBOUR = 2;
const MAX_NEIGHBOUR = 3;
const REVIVE_NEIGHBOUR = 3;

const frame = new Frame(scaling, width, height, color, outerColor);
frame.on("ready", () => { // ES6 Arrow Function - like function(){}

    const stage = frame.stage;
    let stageW = frame.width;
    let stageH = frame.height;

    const controls = new Container(stageW/4, stageH)
        .pos(0, 0, RIGHT);

    const colourPicker = new ColorPicker(500, [HTMLColors.Red, HTMLColors.Blue, HTMLColors.Yellow, HTMLColors.Green, HTMLColors.Black], 5);
    colourPicker.center(controls)
        .pos(100, 100);

    new Label({
        text: "Colour Deviation",
        size: FONT_SIZE,
        color: "white",
    })  .center(controls)
        .pos(100, 700);

    const colourDeviator = new Slider({
        min: SLIDE_MIN,
        max: SLIDE_MAX,
        step: 1,
        useTicks: true,
        barLength: 500,
        barColor: "#eee",
    })  .center(controls)
        .pos(100, 800);

    new Label({
        text: `Generation`,
        size: FONT_SIZE, 
        color: white,
    })  .center(controls)
        .pos(100, 550);

    const generation = new Label({
        text: `0`,
        size: FONT_SIZE,
        color: yellow,
    })  .center(controls)
        .pos(350, 625);

    const boardContainer = new Container(stageW, stageH)
        .pos(0, 0);

    const gameConfig = {
        container: boardContainer,
        size: TILE_SIZE,
        cols: BOARD_COLS,
        rows: BOARD_ROWS,
        minNeighbour: MIN_NEIGHBOUR,
        maxNeighbour: MAX_NEIGHBOUR,
        reviveNeighbour: REVIVE_NEIGHBOUR,
        colourPicker: colourPicker,
        colourDeviator: colourDeviator,
        generation: generation,
    };



    const gameBoard = new GameOfLifeBoard(gameConfig);

    const play = new Button(BUTTON_WIDTH, BUTTON_HEIGHT, "Play");
    play.center(controls)
        .pos(100, 250);

    const pause = new Button(BUTTON_WIDTH, BUTTON_HEIGHT, "Pause");
    pause.center(controls)
        .pos(400, 250);

    const reset = new Button(BUTTON_WIDTH, BUTTON_HEIGHT, "Reset");
    reset.center(controls)
        .pos(100, 400);

    const step = new Button(BUTTON_WIDTH, BUTTON_HEIGHT, "Next");
    step.center(controls)
        .pos(400, 400);    

    new Label({
        text: `${SLIDE_MIN}`,
        size: FONT_SIZE,
        color: white,
    })  .center(controls)
        .pos(100, 850);

    new Label({
        text: `${SLIDE_MAX}`,
        size: FONT_SIZE,
        color: white,
    })  .center(controls)
        .pos(600, 850);

    const deviationLabel = new Label({
        text: `${SLIDE_MIN}`,
        size: FONT_SIZE,
        color: orange,
    })  .center(controls)
        .pos(350, 850);

    colourDeviator.on("change", () => {
        deviationLabel.text = colourDeviator.currentValue;
    });

    new Label({
        text: "Select colour, fill cells, click play.\n\nSet slider for how much randomness is involved when blending.",
        labelWidth: 500,
        color: white,
        size: FONT_SIZE,
    })  .center(controls)
        .pos(100, 1000);

    step.on("mousedown", () => {
        gameBoard.update();
    });

    reset.on("mousedown", () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        gameBoard.reset();
    });

    pause.on("mousedown", () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    });

    play.on("mousedown", () => {
        if (interval) {
            return;
        }
        interval = setInterval(() => {
            gameBoard.update();
        }, 1000/10);
    });

    stage.update(); // this is needed to show any changes
}); // end of ready
