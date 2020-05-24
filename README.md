# Colourful Game Of Life

This is a spontaneous project to see the effects of adding colours to [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).

It tries to be efficient in that it adds cells to an update object. The update loop then iterates through the update object to check the requirements of an alive cell. However, it slows down once there is about 100+ cells in the update Object.

Colour blends based on the alive cells only.

This was built using [ZIM](https://zimjs.com/).

# Setup
1. Download the repository
1. Open the terminal
1.  ```
    yarn start
    ```
1. Open your browser and go to
    ```
    localhost:8085
    ```

# Usage

## Board

Clicking anywhere on the board will fill the highlighted cell with the current colour selected from the colour picker.

Clicking a cell where the colour corresponds to the current colour on the colour picker will revert the cell back to empty.

## Colour Picker

There are 5 colours to choose from. Select on the colour to change the colour you are placing on the board.

## Buttons

| Name | Function |
| - | - |
| Play | Starts the simulation. Updates every 50 ms. **Slows down significantly when there are more than 100 active cells to update** |
| Pause | Pauses the simulation. |
| Clear | Resets the board back to empty. |
| Step | Updates the board once. |
| List | Prints out all tiles in the current update list. Open the development console (F12) to see it. |