//Canvas settings
var rows = 35;
var columns = 35;
var width = 600;
var height = 600;
var canvas;

//State info
var changes = 0;
var population = 0;
var stopSim = false;
var simulating = false;
var generation = 0;
var curGeneration = [];

//Backtracking
var prevGenerations = []
var maxGenerationsStored = 400;
//Class for saved state
function savedState(state, number, population) {
	this.state = state;
	this.number = number;
	this.population = population;
}

//handle mouse info
var mouseDown = 0;
var paintState = null;


window.onload = function () {
	//Set initial state
	SetInitialState();

	canvas = d3.select("svg")
		.attr("width", width)
		.attr("height", height)
		.on('click', function() {svgPaint(this)})
		.on('mouseover', function() {if(mouseDown) {svgPaint(this)}});

	//Handle mouse listeners
	document.body.onmousedown = function() { 
	  ++mouseDown;
	};
	document.body.onmouseup = function() {
	  --mouseDown;
	  paintState = null;
	};

	//hitting space stops/starts the simulation,
	//the right arrow moves it forward
	document.onkeydown = (function(evt) {
	    if (evt.keyCode == 32) {
	    	if(simulating) {
	    		stopSim = true;
	    	} else {
	    		beginSimulation();
	    	}
	    } else if(evt.keyCode == 39 && !simulating) {
	    	simulate();
	    } else if(evt.keyCode == 37 && !simulating && prevGenerations.length > 0 && generation > 0) {
	    	var oldState = prevGenerations.pop();
	    	curGeneration = oldState.state;
	    	population = oldState.population
	    	generation = oldState.number;
    		document.getElementById("Generation").innerHTML = generation;
			document.getElementById("Population").innerHTML = population;
	    	showGrid();
	    }
  	});

	showGrid();
}

function reset() {
	SetInitialState();
	prevGenerations = [];
	generation = 0;
	population = 0;
	document.getElementById("Population").innerHTML = population;
	document.getElementById("Generation").innerHTML = generation;
	showGrid();
}

function placeAt(obj, row, column) {
	var index = (row*rows) + column;
	curGeneration[index] = obj;
	showGrid();
}

function beginSimulation() {
	simulating = true;
	simulate();
	if(changes > 0 && !stopSim) {
    	setTimeout(beginSimulation, 40);
	} else {
		simulating = false;
		stopSim = false;
	}
}

//Simulate one step
function simulate() {
	changes = 0;
	var nextData = [];

	//now simulate next
	var oldPop = population;
	for(var i = 0; i < curGeneration.length; ++i){
		nextData[i] = curGeneration[i].simulate();
	}
	if(changes > 0) {
		//Save current
		if(prevGenerations.length >= maxGenerationsStored) {
			prevGenerations = prevGenerations.slice(1);
		}
		var curState = new savedState(curGeneration, generation, oldPop);
		prevGenerations.push(curState);
		//Advance generation
		generation++;
		document.getElementById("Generation").innerHTML = generation;
		document.getElementById("Population").innerHTML = population;
		curGeneration = nextData;
		showGrid();
	}
}

//Shows the grid
function showGrid(){
	var data = canvas.selectAll("circle")
		.data(curGeneration);

	data.enter()
			.append("circle")
		.attr("r", width/rows/2-1)
		.attr("cy", function(d) {
	        return d.column*width/rows+width/rows/2;
		})
		.attr("cx", function(d) {
	        return d.row*width/rows+width/rows/2;
		})
		.attr("fill", function(d) { return d.color; } );

	data.transition().duration(100).attr("fill", function(d) { return d.color; } )
}

//Handles clicking at top level
function svgPaint (o) {
	var mPos = d3.mouse(o);
	var row = Math.round(mPos[0]/width*rows - 0.5);
	var col = Math.round(mPos[1]/width*columns - 0.5);
	var index = (row*rows) + col;

	var target = curGeneration[index];

	if(paintState == null) {
		paintState = target.constructor;
	}
	if(target instanceof paintState) {
		changes++; 
		target.clicked();
		document.getElementById("Population").innerHTML = population;
	}
}
//counts adjacent cells
function countAdjacent(type,row, column) {
	var ret = 0;
	//Iterate over adjacent
	for(var i = row-1; i <=row+1; ++i){
		for(var j = column-1; j <=column+1; ++j){
			if(i < 0 || i >=rows)
				continue
			if(j < 0 || j >= columns)
				continue
			if(i == row && j == column)
				continue

			//Increment in dictionary
			var index = (i*rows) + j;
			if(curGeneration[index] instanceof type) {
				++ret;
			}
		}
	}

	return ret;
}