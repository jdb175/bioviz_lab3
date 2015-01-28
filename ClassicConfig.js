/* Configuration of spaces for classic game of life
*/
function SetInitialState() {
	curGeneration = [];
	for(var i = 0; i < rows; ++i){
		for(var j = 0; j < columns; ++j){
			curGeneration.push(new Dead(i,j));
		}
	}
}
//class for a dead cell
function Dead(row, column) {
	this.row = row;
	this.column = column;
	this.color = "#eeeeee";

	this.simulate = function() {
		//We become live iff have 3 alive neighbors
		if(countAdjacent(Alive, row, column) == 3) {
			changes++;
			population++;
			return new Alive(row, column);
		} else {
			return this;
		}
	}

	this.clicked = function() {
		population++;
		placeAt(new Alive(row, column), row, column)
	};
}

//class for an alive cell
function Alive(row, column) {
	this.row = row;
	this.column = column;
	this.color = "lightblue";

	this.simulate = function() {
		//Count live neighbors
		var liveCount = countAdjacent(Alive, row, column);
		//We die if we have more than 2 or less than 3 alive neighbors
		if(liveCount == 2 || liveCount == 3) {
			return this;
		} else {
			changes++;
			population--;
			return new Dead(row, column);
		}
	}

	this.clicked = function() {
		population--;
		placeAt(new Dead(row, column), row, column)
	};
}

//counts adjacent cells of type
function countAdjacent(type, row, column) {
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