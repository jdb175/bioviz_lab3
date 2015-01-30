/* Configuration of spaces for classic game of life
*/
function SetInitialState() {
	curGeneration = [];
	for(var i = 0; i < rows; ++i){
		for(var j = 0; j < columns; ++j){
			curGeneration.push(false);
		}
	}
}


function SetRandomState() {
	curGeneration = [];
	for(var i = 0; i < rows; ++i){
		for(var j = 0; j < columns; ++j){
			var val = Math.random() >0.5;
			population += val;
			curGeneration.push(val);
		}
	}
}


function simItem(row, column, value) {
	var liveCount = countAdjacent(1, row, column);
	if(!value) {
		//We become live iff have 3 alive neighbors
		if(liveCount == 3) {
			changes++;
			population++;
			return true;
		} else {
			return false;
		}
	} else {
		//We die if we have more than 2 or less than 3 alive neighbors
		if(liveCount == 2 || liveCount == 3) {
			return true;
		} else {
			changes++;
			population--;
			return false;
		}
	}
}

function clickItem(value) {
	if(!value) {
		population ++;
		return 1;
	} else {
		population--;
		return 0;
	}
}

function getColor(value) {
	if(value == 0) {
		return  "#eeeeee";
	} else {
		return "lightblue";
	}
}

//counts adjacent cells of type
function countAdjacent(val, row, column) {
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
			if(curGeneration[index] == val) {
				++ret;
			}
		}
	}

	return ret;
}