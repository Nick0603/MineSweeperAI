function getSize(){
	var rows = 0;
	while(true){
		var nextRowGrid = document.getElementById("position-1-" + (rows+1));
		if(nextRowGrid){
			rows++
		}else{
			break;
		}
	}
	var cols = 0;
	while(true){
		var nextColGrid = document.getElementById("position-" + (cols+1) + "-1");
		if(nextColGrid){
			cols++
		}else{
			break;
		}
	}
	return [rows,cols];
}

function getGrid(grids,row,col){
	if( 1 <= row && row <= rows &&
		1 <= col && col <= cols ){
		return grids[(row-1) * rows + (col-1)];
	}else{
		return null;
	}	
}
function getPosition(grid){
	// str format:  position-<row>-<col>
	var posString = grid['id'];
	var cutStrs = posString.split("-");
	var row = parseInt( cutStrs[1] );
	var col = parseInt( cutStrs[2] );
	return {row:row,col:col};	
}

function hasClass(elem,className){
	classNames = elem.className.split(" ");
	if(classNames.indexOf(className) != -1){
		return true;
	}else{
		return false;
	}
}

function isPosInArray(pos,posArray){
	for(var i = 0 ; i<posArray.length;i++){
		if(posArray[i].r == pos.r &&
		   posArray[i].c == pos.c){
			return true;
		}
	}
	return false
}

function getRandom(min,max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initiDate(){
	[rows,cols] = getSize();
}

function randomClickGrid(rows,cols){
	var changeModeBtn = document.getElementById("change-mode")
	var enabledGrids = document.querySelectorAll(".enabled");
	if(changeModeBtn.innerText != "Trigger Mode")changeModeBtn.click();
	var grid = enabledGrids[getRandom(0,enabledGrids.length)];
	gridClick(grid);
}

function gridClick(grid){
	grid.click();
	// 檢測是否踩到地雷
	pos = getPosition(grid);
	afterGrid = document.getElementById("position-" + pos['row'] + "-" + pos['col'] );
	classNames = afterGrid.className.split(" ");
	if(classNames.indexOf("mine") != -1){
		stop();
	}
}

function playGame(){

	var grids = document.querySelectorAll(".grid-unit");
	var sweptGrids = document.querySelectorAll(".swept");

	// item format [  {row: , col:},{row: , col:}]
	var thisTurnFindMines = [];
	var thisTurnFindSecure = [];

	for(let item=0;item<sweptGrids.length;item++){
		var grid = sweptGrids[item];
		//id == position / position-<row>-<col>
		var pos = getPosition( grid );
		// format : "grid-unit swept swept-num-<number>"
		var mineNumberClass = grid.className.split(" ")[2]
		// format : swept-num-<number>"
		var mineNumber = parseInt(mineNumberClass.split("-")[2])
		var flaggedCounter = 0;
		var enableCounter = 0;
		var enablePos = [];
		for(var r = pos["row"]-1 ; r <= pos["row"]+ 1 ; r++){
			for(var c = pos["col"]-1 ; c <= pos["col"]+ 1 ; c++){
				if(r == pos["row"] && c == pos["col"])continue;
				targetGrid = getGrid(grids,r,c);
				if(targetGrid != null){
					if(hasClass(targetGrid,"flagged")){
						flaggedCounter ++;
					}
					if(hasClass(targetGrid,"enabled")){
						enableCounter++;
						enablePos.push({r,c});
					}
				}
			}
		}

		if(mineNumber - flaggedCounter == enableCounter){
			for(let i =0;i<enablePos.length;i++){
				if(!isPosInArray(enablePos[i],thisTurnFindMines)){
					thisTurnFindMines.push(enablePos[i]);
				}
			}
		}else if(mineNumber - flaggedCounter == 0){
			for(let i =0;i<enablePos.length;i++){
				if(!isPosInArray(enablePos[i],thisTurnFindSecure)){
					thisTurnFindSecure.push(enablePos[i]);
				}
			}
		}
	}

	var changeModeBtn = document.getElementById("change-mode")
	if(sweptGrids.length == 0){
		randomClickGrid(rows,cols);
	}else{
		if(changeModeBtn.innerText != "Flag Mode")changeModeBtn.click();
		for(var i=0;i<thisTurnFindMines.length;i++){
			pos = thisTurnFindMines[i];
			grid = getGrid(grids,pos["r"],pos["c"]);
			gridClick(grid);
		}
		if(changeModeBtn.innerText != "Trigger Mode")changeModeBtn.click();
		for(var i=0;i<thisTurnFindSecure.length;i++){
			pos = thisTurnFindSecure[i];
			grid = getGrid(grids,pos["r"],pos["c"]);
			gridClick(grid);
		}
	}
	return sweptGrids.length;
}

function isSuccess(){
	var successDiv = document.getElementById("success-modal");
	if(successDiv.style.display == "block"){
		return true;
	}else{
		return false;
	}
}

function work(){
	if( isSuccess() ){
		stop();
	}

	thisSweptGrids = playGame();
	if(lastSweptGrids === thisSweptGrids){
		cantFoundWorkCounter ++;
		if(cantFoundWorkCounter >= 3){
			randomClickGrid();
		}
	}else{
		cantFoundWorkCounter = 0;
		lastSweptGrids = thisSweptGrids;
	}
}

function start(millis){
	if(!millis)millis = 500;
	AIIntervalID = setInterval(work,millis);
}
function stop(){
	clearInterval(AIIntervalID);
}

var rows = null;
var cols = null;
var lastSweptGrids = null;
var cantFoundWorkCounter = 0;
var AIIntervalID = null;
initiDate();






