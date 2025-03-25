/* global Phaser */
// Grid dimensions
const GRID_WIDTH = 15;
const GRID_HEIGHT = 15;

// Hex dimensions (based on your sprite)
const HEX_WIDTH = 32;
const HEX_HEIGHT = 32;
const FV = 1;

// Sliders
const densitySlider = document.getElementById("densitySlider");
const densityValue = document.getElementById("densityValue");
const deadEndSlider = document.getElementById("deadEndSlider");
const deadEndValue = document.getElementById("deadEndValue");
const reseedButton = document.getElementById("reseed");
const deadEndCount = document.getElementById("deadEndCount");

function createSeededRandom(seed) {
  let state = seed;

  return function () {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

const config = {
  type: Phaser.AUTO,
  width: GRID_WIDTH * HEX_WIDTH + HEX_WIDTH / 2,
  height: GRID_HEIGHT * ((3 * HEX_WIDTH) / 4) + HEX_WIDTH / 4,
  backgroundColor: "#5B5B66",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  scene: {
    preload: preload,
    update: update,
  },
};

const configNoDeadEnds = {
  ...config,
  parent: "game-container-no-dead-ends",
  scene: {
    ...config.scene,
    create: createNoDeadEnds,
  },
};

const configDeadEnds = {
  ...config,
  parent: "game-container-dead-ends",
  scene: {
    ...config.scene,
    create: createDeadEnds,
  },
};
const configSelect = {
  ...config,
  parent: "game-container",
  scene: {
    ...config.scene,
    create: create,
  },
};

new Phaser.Game(configSelect);
new Phaser.Game(configNoDeadEnds);
new Phaser.Game(configDeadEnds);

function preload() {
  this.load.spritesheet("hexes", `/img/hexmap-${HEX_WIDTH}px-multi.png`, {
    frameWidth: HEX_WIDTH,
    frameHeight: HEX_HEIGHT,
  });
}

function createNoDeadEnds() {
  createContinuous(this, 0.7, 0);
}

function createDeadEnds() {
  createContinuous(this, 0.7, 0.5);
}

function createContinuous(scene, density, deadEndProb) {
  let hexContainer = scene.add.container(0, 0);
  let seedVal = "1234";
  let genInterval = null;
  const [gridHeight, gridWidth] = [GRID_HEIGHT, GRID_WIDTH];

  const start = () => {
    clearHexGrid(hexContainer, genInterval);
    const steps = generateDrunkardsWalk(
      density,
      deadEndProb,
      gridHeight,
      gridWidth,
      createSeededRandom(seedVal),
    );
    const rslt = generateHexGrid(scene, steps, hexContainer, 100);
    genInterval = rslt.intervalId;
    rslt.promise.then(() => {
      setTimeout(start, 2000);
    });
  };

  start();
}

function create() {
  let hexContainer = this.add.container(0, 0);
  let seedVal = "1234";
  let genInterval = null;
  const [gridHeight, gridWidth] = [GRID_HEIGHT, GRID_WIDTH];

  const start = (density, deadEndProb) => {
    clearHexGrid(hexContainer, genInterval);
    deadEndCount.innerHTML = "";
    const steps = generateDrunkardsWalk(
      density,
      deadEndProb,
      gridHeight,
      gridWidth,
      createSeededRandom(seedVal),
    );
    const rslt = generateHexGrid(this, steps, hexContainer);
    genInterval = rslt.intervalId;
    rslt.promise.then(() => {
      deadEndCount.innerHTML = getDeadEnds(steps, gridHeight, gridWidth).length;
    });
  };

  densitySlider.oninput = function () {
    densityValue.innerHTML = this.value;
    start(densitySlider.value, deadEndSlider.value);
  };
  deadEndSlider.oninput = function () {
    deadEndValue.innerHTML = this.value;
    start(densitySlider.value, deadEndSlider.value);
  };

  reseedButton.addEventListener("click", function () {
    seedVal = Date.now();
    start(densitySlider.value, deadEndSlider.value);
  });

  densityValue.innerHTML = densitySlider.value;
  deadEndValue.innerHTML = deadEndSlider.value;
  start(densitySlider.value, deadEndSlider.value);
}

function containsSubarray(array, subarray) {
  return array.some(
    (item) =>
      item.length === subarray.length &&
      item.every((val, index) => val === subarray[index]),
  );
}

function generateDrunkardsWalk(
  density,
  deadEndProb,
  gridHeight,
  gridWidth,
  rng,
) {
  let [curRow, curCol] = [
    Math.round(gridHeight / 2),
    Math.round(gridWidth / 2),
  ];

  const totalCells = gridHeight * gridWidth;
  const targetFilled = Math.round(totalCells * density);
  const steps = [];
  const deadEndNeighbors = [];

  const popRandomValue = (array) => {
    const randomIndex = Math.floor(rng() * array.length);
    const [removedItem] = array.splice(randomIndex, 1);

    return removedItem;
  };

  const isUnvisited = (row, col) => {
    if (
      containsSubarray(deadEndNeighbors, [row, col]) ||
      containsSubarray(steps, [row, col])
    ) {
      return false;
    }

    return col >= 0 && col < gridWidth && row >= 0 && row < gridHeight;
  };

  const getUnvisitedNeighbors = (row, col) => {
    const unvisitedNeighbors = [];
    getNeighbors(row, col, gridHeight, gridWidth).forEach((n) => {
      if (isUnvisited(...n)) {
        unvisitedNeighbors.push(n);
      }
    });
    return unvisitedNeighbors;
  };

  const getValidCells = () => {
    const validCells = [];
    steps.forEach((step) => {
      if (getUnvisitedNeighbors(...step).length > 0) {
        validCells.push(step);
      }
    });

    return validCells;
  };

  steps.push([curRow, curCol]);
  let filledCount = 1;

  for (;;) {
    if (filledCount >= targetFilled) {
      break;
    }

    const unvisitedNeighbors = getUnvisitedNeighbors(curRow, curCol);

    if (unvisitedNeighbors.length === 0) {
      const validCells = getValidCells();
      if (validCells.length != 0) {
        [curRow, curCol] = validCells[Math.floor(rng() * validCells.length)];
        continue;
      }

      // No more valid cells, we can try to pick one from deadEndNeighbors
      if (deadEndNeighbors.length !== 0) {
        [curRow, curCol] = popRandomValue(deadEndNeighbors);
        steps.push([curRow, curCol]);
        filledCount++;
        continue;
      }
      console.error("no valid cells!");
      break;
    }

    if (unvisitedNeighbors.length === 5 && rng() < deadEndProb) {
      deadEndNeighbors.push(...unvisitedNeighbors);
      continue;
    }

    [curRow, curCol] =
      unvisitedNeighbors[Math.floor(rng() * unvisitedNeighbors.length)];
    steps.push([curRow, curCol]);
    filledCount++;
  }

  return steps;
}

function generateHexGrid(scene, steps, hexContainer, delay = 20) {
  let genInterval;
  const promise = new Promise((resolve) => {
    const leaderValue = 0;
    let i = 0;
    const hexes = []; // Array to keep track of all hexes

    genInterval = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(genInterval);
        resolve();
        return;
      }

      hexes.forEach((hex) => {
        hex.setFrame(FV);
      });

      const [row, col] = steps[i];
      let x = col * HEX_WIDTH;
      let y = row * HEX_HEIGHT * 0.75;
      if (row % 2 === 1) {
        x += HEX_WIDTH / 2;
      }

      const hex = scene.add.sprite(x, y, "hexes", leaderValue);
      hex.setOrigin(0, 0);
      hexContainer.add(hex);
      hexes.push(hex);

      i++;
    }, delay);

    return genInterval;
  });
  return {
    promise,
    intervalId: genInterval,
  };
}

function clearHexGrid(hexContainer, genInterval) {
  if (genInterval !== null) {
    clearInterval(genInterval);
    genInterval = null;
  }
  hexContainer.removeAll(true); // true = destroy children
}

function update() {}

function getDeadEnds(steps, gridHeight, gridWidth) {
  // a deadend is a step with only one exit
  const deadEnds = [];
  steps.forEach((step) => {
    const neighbors = getNeighbors(...step, gridHeight, gridWidth);
    if (
      neighbors.filter((n) => {
        return containsSubarray(steps, n) === true;
      }).length === 1
    ) {
      deadEnds.push(step);
    }
  });
  return deadEnds;
}

function getNeighbors(row, col, gridHeight, gridWidth) {
  const neighbors = [];

  const isOddRow = row % 2 === 1;

  const directions = isOddRow
    ? [
        [-1, 0], // top-left
        [-1, 1], // top-right
        [0, -1], // left
        [0, 1], // right
        [1, 0], // bottom-left
        [1, 1], // bottom-right
      ]
    : [
        [-1, -1], // top-left
        [-1, 0], // top-right
        [0, -1], // left
        [0, 1], // right
        [1, -1], // bottom-left
        [1, 0], // bottom-right
      ];

  for (const [rowOffset, colOffset] of directions) {
    const newRow = row + rowOffset;
    const newCol = col + colOffset;

    // Only add valid cells that are within grid bounds
    if (
      newRow >= 0 &&
      newRow < gridHeight &&
      newCol >= 0 &&
      newCol < gridWidth
    ) {
      neighbors.push([newRow, newCol]);
    }
  }

  return neighbors;
}
