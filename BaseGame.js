//Canvas settings
var rows = 45;
var columns = 45;
var width = 500;
var height = 700;
var sideMargin = 38;
var betweenMargin = 10;
var canvas;

//State info
var changes = 0;
var population = 0;
var painted = false;
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
		.attr("width", width + 2*sideMargin)
		.attr("height", height + 2*sideMargin + betweenMargin)
		.on('click', function() {svgPaint(this)})
		.on('mouseover', function() {if(mouseDown) {svgPaint(this)}});

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
	document.onkeydown = (function(evt) {
	    if (evt.keyCode == 32) {
	    	if(simulating) {
	    		stopSim = true;
	    	} else {
	    		beginSimulation();
	    	}
	    } else if(evt.keyCode == 39 && !simulating) {
	    	if(selectedGen == null || selectedGen >= prevGenerations.length || painted) {
	    		if(painted && selectedGen) {
	    			prevGenerations = prevGenerations.slice(0, selectedGen)
	    		}
	    		selectedGen = null;
		    	stopSim = false;
		    	simulate(true);
	    	} else {
	    		selectedGen++;
		    	applySavedState(selectedGen);
	    	}
	    } else if(evt.keyCode == 37 && !simulating && prevGenerations.length > 0 && generation > 0) {
	    	if(selectedGen == null) {
	    		selectedGen = prevGenerations.length-1;
	    	} else {
	    		selectedGen--;
	    	}
	    	applySavedState(selectedGen);
	    }
  	});

	showGrid();
	showPopulationGraph();
}

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

//Simulate one step
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
		if(showGraphs) {
			document.getElementById("Generation").innerHTML = generation;
			document.getElementById("Population").innerHTML = population;
			showGrid();
			showPopulationGraph();	
		}
	}
}

//Shows the grid
function showGrid(){
	//Show the grid
	var data = canvas.selectAll("circle")
		.data(curGeneration);

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
		.attr("fill", function(d) { return getColor(d); } );

	data.attr("fill", function(d) { return getColor(d); } )
}

function showPopulationGraph(showCharts) {
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

//create a polygon dataset from data (adding points to fill shape)
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

function applyState(index) {
	if(index < prevGenerations.length && (index < generation || !painted)) {
		applySavedState(index);
	} else {
		simulateTo(index);
	}
}

function simulateTo(index) {
	selectedGen = index;
	var mostRecentOnHistory = prevGenerations[prevGenerations.length-1];
	if(mostRecentOnHistory != null && generation < mostRecentOnHistory.number){
		if(painted) {
			prevGenerations = prevGenerations.slice(0, generation-1)
		} else {
			generation = mostRecentOnHistory.number;
			population = mostRecentOnHistory.population;
			curGeneration = mostRecentOnHistory.state;
		}
	}
	var amount = index-generation;
	stopSim = false;
	for(var i = 0; i < amount; ++i){
		simulate(false);
	}
	document.getElementById("Generation").innerHTML = generation;
	document.getElementById("Population").innerHTML = population;
	showGrid();
	showPopulationGraph();
}

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

//Handles clicking at top level
function svgPaint (o) {
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