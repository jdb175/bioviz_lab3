//Canvas settings
var rows = 40;
var columns = 40;
var width = 600;
var height = 600;
var canvas;

//State info
var changes = 0;
var stopSim = false;
var simulating = false;
var generation = 0;
var curGeneration = [];

//Backtracking
var prevGenerations = []
var maxGenerationsStored = 400;

//handle mouse info
var mouseDown = 0;
var paintState = null;


window.onload = function () {
	//Set initial state
	SetInitialState();

	canvas = d3.select("svg")
		.attr("width", width)
		.attr("height", height);

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
	    	curGeneration = prevGenerations.pop();
	    	generation--;
    		document.getElementById("Generation").innerHTML = generation;
	    	showGrid();
	    }
  	});

	showGrid();
}

function reset() {
	SetInitialState();
	prevGenerations = [];
	generation = 0;
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
	for(var i = 0; i < curGeneration.length; ++i){
		nextData[i] = curGeneration[i].simulate();
	}
	if(changes > 0) {
		//Save current
		if(prevGenerations.length >= maxGenerationsStored) {
			prevGenerations = prevGenerations.slice(1);
		}
		prevGenerations.push(curGeneration);
		//Advance generation
		generation++;
		document.getElementById("Generation").innerHTML = generation;
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
		});

	data.attr("fill", function(d) { return d.color; } )
		//Painting stuff
        .on('mouseover', function(d){ 
        	if(mouseDown) {
        		if(paintState == null) {
        			paintState = d.constructor;
        		}
        		if(d instanceof paintState) {
        			changes++; 
        			d.clicked();
        		}
        	} 
        })
        .on('click', function(d){ 
    		if(paintState == null) {
    			paintState = d.constructor;
    		}
    		if(d instanceof paintState) {
    			changes++; 
    			d.clicked();
    		}
        });
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