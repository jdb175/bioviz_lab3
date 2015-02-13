//Canvas settings
var rows = 45;
var columns = 45;
var width = 500;
var height = 700;
var sideMargin = 38;
var betweenMargin = 10;
var canvas;
var trails = false;

//State info
var changes = 0;
var population = 0;
var painted = false; // Have we painted on the canvas? (making history beyond this bad)
var stopSim = false; // should the simulation stop if running?
var simulating = false; // are we currently simulating?
var generation = 0;
var curGeneration = [];
var selectedGen = null; // generation selected on bottom graph, if applies

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

/*
	Initialize
*/
window.onload = function () {
	//Set initial state
	SetInitialState();

	canvas = d3.select("svg")
		.attr("width", width + 2*sideMargin)
		.attr("height", height + 2*sideMargin + betweenMargin)
		.on('click', function() {svgMouse(this)})
		.on('mouseover', function() {if(mouseDown) {svgMouse(this)}});

	showGrid();
	showPopulationGraph();

	//Handle mouse listeners
	document.body.onmousedown = function() { 
	  mouseDown = 1;
	};
	document.body.onmouseup = function() {
	  mouseDown = 0;
	  paintState = null;
	};

	//hitting space stops/starts the simulation,
	//the right arrow moves it forward
	document.onkeydown = (handleKeyPress);
}

/************ SIMULATION ***********/

/*
	Begins the simulation on timeout
*/
function beginSimulation() {
	simulating = true;
	simulate(true);
	if(changes > 0 && !stopSim) {
    	setTimeout(beginSimulation, 40);
	} else {
		simulating = false;
		stopSim = false;
	}
}

/*
	Saves current state, simulates one step
*/
function simulate(showGraphs) {
	painted = false;
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
		var row = Math.floor(i/rows);
		var column = i - row*rows;
		nextData[i] = simItem(row, column, curGeneration[i]);
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
		curGeneration = nextData;
		//Show changes
		if(showGraphs) {
			document.getElementById("Generation").innerHTML = generation;
			document.getElementById("Population").innerHTML = population;
			showGrid();
			showPopulationGraph();	
		}
	}
}

/*
	Applies a saved state to be current
*/
function applySavedState(index) {
	painted = false;
	var selected = prevGenerations[index];
	selectedGen = index;
	curGeneration = selected.state;
	generation = selected.number;
	population = selected.population;
	document.getElementById("Generation").innerHTML = generation;
	document.getElementById("Population").innerHTML = population;
	showGrid();
	showPopulationGraph();
	stopSim = true;
}

/*
	Applies the state at given index in the history. If the index is beyond the
	history or the current state is dirty and we are moving forward, we fastforward
	to it
*/
function applyState(index) {
	if(index < prevGenerations.length && (index < generation || !painted)) {
		applySavedState(index);
	} else {
		simulateTo(index);
	}
}

/*
	Simulates to the generation equivalent to given index in history
	(can be higher than max index in history)
*/
function simulateTo(index) {
	//Find starting state and generations to simulate
	selectedGen = index;
	var mostRecentOnHistory = prevGenerations[prevGenerations.length-1];
	if(mostRecentOnHistory != null && generation < mostRecentOnHistory.number){
		if(painted) {
			//If we've painted, then all history after us is corrupted
			prevGenerations = prevGenerations.slice(0, generation-1)
		} else {
			// otherwise we start at most recent history state
			generation = mostRecentOnHistory.number;
			population = mostRecentOnHistory.population;
			curGeneration = mostRecentOnHistory.state;
		}
	}
	//simulate as many times as necessary to get there
	var amount = index-generation;
	stopSim = false;
	for(var i = 0; i < amount; ++i){
		simulate(false);
	}

	//Show visuals
	document.getElementById("Generation").innerHTML = generation;
	document.getElementById("Population").innerHTML = population;
	showGrid();
	showPopulationGraph();
}

/*
	Resets the game state, clears history
*/
function reset() {
	SetInitialState();
	prevGenerations = [];
	generation = 0;
	population = 0;
	document.getElementById("Population").innerHTML = population;
	document.getElementById("Generation").innerHTML = generation;
	showGrid();
	showPopulationGraph();
	document.getElementById("resetButton").blur()
}

/*
	Resets the game state to a random state, clears history
*/
function randomize() {
	stopSim = true;
	prevGenerations = [];
	generation = 0;
	population = 0;
	SetRandomState();
	document.getElementById("Population").innerHTML = population;
	document.getElementById("Generation").innerHTML = generation;
	showGrid();
	showPopulationGraph();
	document.getElementById("randomizeButton").blur();
}

/********** GRAPHICS **********/

/*
	Populates the grid
*/
function showGrid(){
	//Show the grid
	var data = canvas.selectAll("circle")
		.data(curGeneration, function(d,i) {return i;});

	data.enter()
		.append("circle")
		.attr("r", width/rows/2-0.5)
		.attr("cy", function(d, i) {
			var row = Math.floor(i/rows);
			var column = i - row*rows;
	        return sideMargin + column*width/rows+width/rows/2;
		})
		.attr("cx", function(d, i) {
			var row = Math.floor(i/rows);
			var column = i - row*rows;
	        return sideMargin +row*width/rows+width/rows/2;
		})
		.attr("fill", function(d) { return getColor(d, trails); } );

	data.attr("fill", function(d) { return getColor(d, trails); } )
}

/*
	Shows the lower population chart
*/
function showPopulationGraph() {
	//Show population chart
	//clear existing gs
	canvas.selectAll("g")
		.remove();
	//handle scales
	//We want to scale from 0 to the max population on y
	var maxPop = Math.max.apply(Math,prevGenerations.map(function(o){return o.population;}));
	var yScale = d3.scale.linear().domain([0, Math.max(10, maxPop)]).range([height+sideMargin, width+betweenMargin+sideMargin]);

	//and across our stored generations for x, without scaling across when we have stored less than max
	var startGen = 0;
	if(prevGenerations.length >= 1) {
		startGen = prevGenerations[0].number;
	}
	var endGen = startGen + maxGenerationsStored;
	var xScale = d3.scale.linear().domain([startGen, endGen]).range([sideMargin, width+sideMargin+6]);

	//Now draw the line(s)
	var line =d3.svg.line()
		.x(function(d,i) { return xScale(d.number) })
		.y(function(d,i) { return yScale(d.population) });
	//handle before and after cursor
	var beforeSelection = prevGenerations;
	var afterSelection = [];
	if(selectedGen != null) {
		beforeSelection = prevGenerations.slice(0, selectedGen);
		afterSelection = prevGenerations.slice(Math.max(0, selectedGen-1));
	}
	//add it
	var group = canvas.append('g')
				.attr('id', 'populationLine');

	group.append('path')
		.attr('id', '#afterLine')
		.attr('fill', '#2D5866')
		.attr('fill-opacity', 0.4)
		.attr("stroke-width",1.5)
		.attr("stroke", "black")
		.attr('stroke-opacity', 0.5)
		.attr("d", line(processDataforPolygon(afterSelection)));	
	group.append('path')
		.attr('id', '#beforeLine')
		.attr('fill', 'lightblue')
		.attr("stroke-width",1.5)
		.attr("stroke", "black")
		.attr("d", line(processDataforPolygon(beforeSelection)));

	//Handle Axes
	canvas.selectAll("text").remove();
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("right");

	//Create an SVG group Element for the Axis elements and add axes
	canvas.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, "+(height+sideMargin)+")")
		.call(xAxis);
	canvas.append("g")
	    .attr("class", "y axis")
		.attr("transform", "translate("+(width+sideMargin)+",0)")
	    .call(yAxis)
	    .selectAll("line")
	    .attr("x1", -(width))
	    .attr("stroke-dasharray", "2,2");

	//Handle axes
	//Add axis labels
	canvas.append("text")
	    .attr("class", "x label")
	    .attr("text-anchor", "end")
	    .attr("x", width+sideMargin)
	    .attr("y", height+sideMargin - 4)
	    .text("generation");
	canvas.append("text")
	    .attr("class", "y label")
	    .attr("text-anchor", "end")
	    .attr("y", width+sideMargin-4)
	    .attr("x", -width-sideMargin-betweenMargin)
	    .attr("dy", ".75em")
	    .attr("transform", "rotate(-90)")
	    .text("population");
}

/* 
	Create a polygon dataset from data (adding points to fill shape)
*/
function processDataforPolygon (d) {
	if(d.length == 0)
		return [];
	poly = d.slice(0);
	//Add a copy of the first and last points with y=0
	var first = new savedState(poly[0].state, poly[0].number, 0);
	var last = new savedState(poly[poly.length-1].state, poly[poly.length-1].number, 0);
	poly.unshift(first);
	poly.push(last);
	return poly;
}

/********** LISTENERS **********/

/*
	Top-level mouse handling for svg to improve performance. Decides whether to 
	paint the grid or control the lower chart.
*/
function svgMouse (o) {
	var mPos = d3.mouse(o);
	mPos[0] -= sideMargin;
	mPos[1] -= sideMargin;
	if (mPos[0] > width || mPos[0] < 0) {
		return;
	} else if(mPos[1] > width+betweenMargin && mPos[1] < height) {
		//Handle generation switching
		var generationS = Math.round(mPos[0]/width*maxGenerationsStored);
		if(generationS >= 0) {
			applyState(generationS);
		}
	} else {
		var row = Math.round(mPos[0]/width*rows - 0.5);
		var col = Math.round(mPos[1]/width*columns - 0.5);
		var index = (row*rows) + col;

		var target = curGeneration[index];

		if(paintState == null) {
			paintState = target;
		}
		if(target == paintState) {
			painted = true;
			changes++; 
			curGeneration[index] = clickItem(target);
			document.getElementById("Population").innerHTML = population;
			showGrid();
		}
	}
}

/*
	Handles key presses. Space starts/stops simulation. Right arrow moves forward
	one generation. Left arrow moves back one
*/
function handleKeyPress(evt) {
    if (evt.keyCode == 32) { //space bar
    	//If we hit the
    	if(simulating) {
    		stopSim = true;
    	} else {
    		beginSimulation();
    	}
    } else if(evt.keyCode == 39 && !simulating) { //right arrow
    	//The right arrow moves forward a generation
    	if(selectedGen == null || selectedGen >= prevGenerations.length || painted) {
    		//If we are not able to pull from history, or we have painted (meaning history is not useful)
    		//We simulate one step
    		if(painted && selectedGen) {
    			prevGenerations = prevGenerations.slice(0, selectedGen)
    		}
    		selectedGen = null;
	    	stopSim = false;
	    	simulate(true);
    	} else {
    		//Otherwise we just move the selected state forward and pull it form history
    		selectedGen++;
	    	applySavedState(selectedGen);
    	}
    } else if(evt.keyCode == 37 && !simulating && prevGenerations.length > 0 && generation > 0) { //left arrow
    	//As long as there is a state before us, we pull it from history and apply it
    	if(selectedGen == null) {
    		selectedGen = prevGenerations.length-1;
    	} else {
    		selectedGen--;
    	}
    	applySavedState(selectedGen);
    }
}

/* Updates whether we use trails and reshows grid */
function updateTrails() {
	trails = document.getElementById("useTrails").checked;
	showGrid();
}