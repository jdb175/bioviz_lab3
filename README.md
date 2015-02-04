# bioviz-life
Game of Life assignment for Bioviz

## Description

This is an original implementation of Conway's game of life, which is governed by four rules:

* Any live cell with fewer than two live neighbours dies, as if caused by under-population.
* Any live cell with two or three live neighbours lives on to the next generation.
* Any live cell with more than three live neighbours dies, as if by overcrowding.
* Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

The initial state is empty, and the user can set their own starting state by hitting the randomize
button or painting live cells onto the grid. It is also possible to modify the state after the 
simulation has started.

The population over time can be seen in the chart at the bottom of the page, for up to 400 past 
generations. It is possible to ump to a previous or future generation by clicking on the chart.
This is the primary technical achievement of this implementation, along with the interactive
cell painting. It allows the user to review what has happened, and also to experiment with how
changes affect the outcome of the simulation. This is not directly a bio-related addition, but
it connects with the way that biologists interact with simulations.

The code is my own.

## Viz

I used color to differentiate between alive and dead cells, because I thought that it would
disrupt interpretation of the natural shapes formed by multiple cells if I used shapes instead.
I chose gray and blue because the saturation difference would make it easier to distinguish. I
had seen some examples with two colors for alive and dead cells (e.g. red and blue) and it was
hard to look at.

Shape and motion are also significant to this visualization, because of the motion of the shapes
made up of adjacent live cells. There are a number of shapes that all have unique behavior and
appearance, from oscillators to spaceships.

## Running 

This program can be run by opening Assignment1.hmtl in a modern browser.