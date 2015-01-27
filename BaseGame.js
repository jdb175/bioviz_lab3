var rows = 50;
var columns = 50;
var curData = [];
var width = 600;
var height = 600;
var canvas;
var changes = 0;
var stopSim = false;
var simulating = false;
var generations = 0;

//handle mouse info
var mouseDown = 0;


window.onload = function () {
	//Set initial state
	SetInitialState();

	canvas = d3.select("body")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	//Handle mouse listeners
	document.body.onmousedown = function() { 
	  ++mouseDown;
	};
	document.body.onmouseup = function() {
	  --mouseDown;
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
	    }
  	});

	showGrid();
}

function placeAt(obj, row, column) {
	var index = (row*rows) + column;
	curData[index] = obj;
	showGrid();
}

function beginSimulation() {
	simulating = true;
	simulate();
	generations++;
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
	for(var i = 0; i < curData.length; ++i){
		nextData[i] = curData[i].simulate();
	}
	curData = nextData;
	showGrid();
}

//Shows the grid
function showGrid(){
	var data = canvas.selectAll("circle")
		.data(curData);

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
        .on('mouseover', function(d){ 
        	if(mouseDown) { 
        		d.clicked();
        	} 
        })
        .on('click', function(d){ 
    		d.clicked();
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
			if(curData[index] instanceof type) {
				++ret;
			}
		}
	}

	return ret;
}