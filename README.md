# Colourful Game Of Life

This is a spontaneous project to see the effects of adding colours to [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).

It tries to be efficient in that it adds cells to an update object. The update loop then iterates through the update object to check the requirements of an alive cell. However, it slows down once there is about 100+ cells in the update Object.

Colour blends based on the alive cells only.

This was built using [ZIM](https://zimjs.com/).

# How to Run
1. Download the repository
1. Open the terminal
1. 
    ```
    yarn start
    ```
1. Open your browser and go to
    ```
    localhost:8085
    ```