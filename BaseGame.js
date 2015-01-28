//Canvas settings
var rows = 40;
var columns = 40;
var width = 600;
var height = 800;
var canvas;

//State info
var changes = 0;
var population = 0;
var stopSim = false;
var simulating = false;
var generation = 0;
var curGeneration = [];
var selectedGen = null;

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
	if(stopSim)
		return;
	changes = 0;
	var nextData = [];

	//handle popping off generation state
	if(selectedGen != null) {
		prevGenerations = prevGenerations.slice(0,selectedGen);
		selectedGen = null;
	}

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
	//Show the grid
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

	//Show population chart
	//handle scales
	//We want to scale from 0 to the max population on y
	var maxPop = Math.max.apply(Math,prevGenerations.map(function(o){return o.population;}));
	var yScale = d3.scale.linear().domain([0, maxPop]).range([height, width]);

	//and across our stored generations for x, without scaling across when we have stored less than max
	var startGen = 0;
	if(prevGenerations.length >= 1) {
		startGen = prevGenerations[0].number;
	}
	var endGen = startGen + maxGenerationsStored;

	var xScale = d3.scale.linear().domain([startGen, endGen]).range([0, width]);

	//create a line
	var line =d3.svg.line()
		.x(function(d,i) { return xScale(d.number) })
		.y(function(d,i) { return yScale(d.population) });
	//add it
	canvas.select("#line")
			.attr('fill', 'none')
			.attr("stroke-width",2)
			.attr("stroke", "black")
			.attr("d", line(prevGenerations));		
}

//Handles clicking at top level
function svgPaint (o) {
	var mPos = d3.mouse(o);
	if (mPos[0] > width) {
		return;
	} else if(mPos[1] > width) {
		//Handle generation switching
		var generationS = Math.round(mPos[0]/width*maxGenerationsStored);
		if(generationS < prevGenerations.length) {
			var selected = prevGenerations[generationS];
			selectedGen = generationS;
			curGeneration = selected.state;
			generation = selected.number;
			population = selected.population;
    		document.getElementById("Generation").innerHTML = generation;
			document.getElementById("Population").innerHTML = population;
	    	showGrid();
	    	stopSim = true;
		}
	} else {
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