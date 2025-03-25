+++
title = "A Drunkard's Walk with hiding spots"
date = "2025-03-26"
slug = "drunkards-walk-with-hiding-spots"
tags = ["stardewar"]
+++

<style>
.slider {
    -webkit-appearance: none;
    width: 100%;
    height: 15px;
    border-radius: 10px;
    background: #e0e0e0;
    outline: none;
}
.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
    transition: background 0.15s ease-in-out;
}
.slider::-moz-range-thumb {
    width: 30px;
    height: 30px;
    border: 0;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
    transition: background 0.15s ease-in-out;
}
.slider::-webkit-slider-thumb:hover {
    background: #2E8B57;
}
.slider:active::-webkit-slider-thumb {
    background: #2E8B57;
}
.slider::-moz-range-thumb:hover {
    background: #2E8B57;
}
.sliderControls {
  max-width: 40ch;
  margin: auto;
  padding-bottom: 20px;
}
.value {
    text-align: center;
}
button#reseed {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 0.5em 1.0em;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin: auto;
}
button#reseed:hover {
  background-color: #2E8B57;
}

/* New styles for the control container */
.controls-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin: 10px auto;
    text-align: center;
    width: 100%;
}

</style>

I've been playing around lately with procedural map generation and different ways to generate contiguous areas on a hexagonal grid.
To keep things a simple as possible I started with a [Random Walk](https://en.wikipedia.org/wiki/Random_walk) (also known as "Drunkard's Walk") but found it a bit lacking.
Part of my map generation needs to include dead-ends (or hiding spots) that will be difficult to discover when traversing distance from one hex to another hex.

A simple "Drunkard's Walk" is to start at one cell and pick a random neighbor that hasn't been visited yet.
If there are no neighbors that haven't already been visited, take all remaining visited cells that have unvisited neighbors and pick one at random.
This can be repeated until a percentage of cells have been picked and will result in a contiguous area that can be used for a map.

Here is how it looks, taking a random contiguous path for 70% of the cells on the grid:

<div id="game-container-no-dead-ends"></div>

Note that in the above hex map, every cell has at least 2 entry points.
What I would like to change is an increased likelyhood of "hiding spots" or cells with only one entry point so that when traversed, players in these dead-end cells are less likely to be discovered.

Here is the same walk, filling 70% of the cells but with more dead-ends:

<div id="game-container-dead-ends"></div>

This is very similar to the other logic, except with a set probability, if the current cell has 5 neighbors that haven't been visited, it is added to a list of dead-ends.
Then, instead of picking one of those neighbors to visit next, we pick a random hex in the list of visited cells.
If there are no cells that meet that criteria, then we start at a random cell in the dead-end list.

As the map density is increased, there are fewer dead-ends as they will be re-purposed to fill the map, resulting in mostly "horseshoe" hexes.
Below you can play with the cell density and the probability of marking a dead-end.
For my own map, a density of 60% and a dead-end probability of 40% is about right.

<div class="controls-container">
    <div style="display: flex; align-items: center; gap: 10px;">
        <button id="reseed">Reseed</button>
        <span>Dead end count: <span id="deadEndCount">0</span></span>
    </div>
</div>

<div id="game-container"></div>

<div class="sliderControls">
  <div>
    <input type="range" min="0" max="1" value="0.5" step="0.01" id="densitySlider" class="slider">
    <div class="value">Density: <span id="densityValue">0.5</span></div>
  </div>
  <div>
    <input type="range" min="0" max="1" value="0" step="0.01" id="deadEndSlider" class="slider">
    <div class="value">Dead end probability: <span id="deadEndValue">0</span></div>
  </div>
</div>

If you read this far, I'm hoping to write a few posts on writing a multi-player 2D game and hopefully this is the first post of many (we will see).
The game is called [Star Dewar](https://stardewar.com) which is an anagram for an old BBS game I liked as a kid.

<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/phaser.min.js"></script>
<script src="/js/hexmap.js?{{< cachebust >}}"></script>
