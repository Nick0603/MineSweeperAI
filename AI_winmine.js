
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
		if(posArray[i].row == pos.row &&
		   posArray[i].col == pos.col){
			return true;
		}
	}
	return false
}

function isPossibleCombInArray(comb,combArray){
	for(var i = 0 ; i<combArray.length;i++){
		var commbArrayMineCounter = combArray[i].mineCounter;
		var commbArrayPositions = combArray[i].positions;
		if(commbArrayMineCounter != comb.mineCounter)continue;
		if(commbArrayPositions.length != comb.positions.length)continue;
		for(var j = 0 ; j<comb.positions.length;j++){
			if( !isPosInArray(comb.positions[j],commbArrayPositions)){
				break;
			}
		}
		if(j == comb.positions.length){
			return true;
		}
	}
	return false;
}


function getRandom(min,max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initiDate(){
	[rows,cols] = getSize();
	cantFoundWorkCounter = 0;
	possibleMineCombStore = [];
}

function randomClickGrid(rows,cols){
	var enabledGrids = document.querySelectorAll(".enabled");
	var grid = enabledGrids[getRandom(0,enabledGrids.length)];
	gridClick("trigger",grid);
}

function gridClick(mode,grid){

	var changeModeBtn = document.getElementById("change-mode")
	// flagged or Trigger Mode
	if(mode != "flagged" && mode != "trigger"){
		throw new UserException('InvalidClickMode');
	}
	if( (mode == "flagged" && changeModeBtn.innerText != "Flag Mode"   ) ||
		(mode == "trigger" && changeModeBtn.innerText != "Trigger Mode")
	){
		changeModeBtn.click();
	}

	grid.click();
	// 檢測是否踩到地雷
	pos = getPosition(grid);
	afterGrid = document.getElementById("position-" + pos['row'] + "-" + pos['col'] );
	classNames = afterGrid.className.split(" ");
	if(classNames.indexOf("mine") != -1){
		stopAutoPlay();
	}
}

function solveGame(){


	var grids = document.querySelectorAll(".grid-unit");
	var sweptGrids = document.querySelectorAll(".swept");
	if(sweptGrids.length == 0){
		randomClickGrid(rows,cols);
		return ;
	}

	// item format [  {row: , col:},{row: , col:}]
	var thisTurnFindMines = [];
	var thisTurnFindSecure = [];
	var newPossibleMineCombStore = [];

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
		var enablePosArray = [];

		if(mineNumber == 0)continue;
		// count surround status ( flagged 、 enable)
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
						enablePosArray.push({row:r,col:c});
					}
				}
			}
		}

// solve
		
/*
	strategy 1:
		compare the mineNumber and the surround enableCounter
		to find obvious mine pos or secure pos
*/
		//detect absolute mine pos
		if(mineNumber - flaggedCounter == enableCounter){
			for(let i =0;i<enablePosArray.length;i++){
				if(!isPosInArray(enablePosArray[i],thisTurnFindMines)){
					thisTurnFindMines.push(enablePosArray[i]);
				}
			}
		//detect absolute secure pos
		}else if(mineNumber - flaggedCounter == 0){
			for(let i =0;i<enablePosArray.length;i++){
				if(!isPosInArray(enablePosArray[i],thisTurnFindSecure)){
					thisTurnFindSecure.push(enablePosArray[i]);
				}
			}
		}else{
/*
	strategy 2:
		search possibleMineCombStore to find poiiableComb that can be completly contained in enabledPosArray 
		filter the enabledPos that match with mineComb
		use strategy 1 to search the left enabledPos to find new falgged or secure  pos
*/
			for(var i = 0;i<possibleMineCombStore.length;i++){
				var possibleMineComb = possibleMineCombStore[i];
				var possibleMineCombPosArray = possibleMineComb.positions;
				var possibleMineNumber = possibleMineComb.mineCounter;
				for( j=0 ; j<possibleMineCombPosArray.length ; j++ ){
					CombPosition = possibleMineCombPosArray[j];
					if(!isPosInArray(CombPosition,enablePosArray))break;
				}
				if(j == possibleMineCombPosArray.length){
					var filteredMineNumber = mineNumber - possibleMineNumber;
					var filteredEnableCounter = enableCounter - possibleMineCombPosArray.length;
					if(filteredEnableCounter == 0)continue;
					if(filteredMineNumber - flaggedCounter  == filteredEnableCounter){
						for(let k =0;k<enablePosArray.length;k++){
							if(!isPosInArray(enablePosArray[k],thisTurnFindMines) && !isPosInArray(enablePosArray[k],possibleMineCombPosArray)){
								thisTurnFindMines.push(enablePosArray[k]);
							}
						}
					}else if(filteredMineNumber - flaggedCounter == 0){
						for(let k=0;k<enablePosArray.length;k++){
							if(!isPosInArray(enablePosArray[k],thisTurnFindSecure)  && !isPosInArray(enablePosArray[k],possibleMineCombPosArray) ){
								thisTurnFindSecure.push(enablePosArray[k]);
							}
						}
					}
				}
			}
		}

		//save possiableComb Data
		if(mineNumber - flaggedCounter == (enableCounter - 1) ){
			// console.log("happened:" + pos["row"] + " , " + pos["col"]);
			// console.log("mineNumber:" + mineNumber, "flaggedCount:"+flaggedCounter,"enableCounter"+enableCounter);
			// console.log(enablePosArray);

			var possibleComb = {
				mineCounter : mineNumber - flaggedCounter ,
				positions : []
			}
			for(var i = 0 ; i<enablePosArray.length;i++){
				possibleComb.positions.push({
					row:enablePosArray[i].row,
					col:enablePosArray[i].col
				});
			}
			if(!isPossibleCombInArray(possibleComb , newPossibleMineCombStore)){
				newPossibleMineCombStore.push(possibleComb)
			}
		}
	}

	for(var i=0;i<thisTurnFindMines.length;i++){
		pos = thisTurnFindMines[i];
		grid = getGrid(grids,pos["row"],pos["col"]);
		gridClick("flagged",grid);
	}
	for(var i=0;i<thisTurnFindSecure.length;i++){
		pos = thisTurnFindSecure[i];
		grid = getGrid(grids,pos["row"],pos["col"]);
		gridClick("trigger",grid);
	}

	possibleMineCombStore = newPossibleMineCombStore;

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


function printPossibleMineComb(possibleMineCombStore){
	for(var i =0 ; i<possibleMineCombStore.length ; i++){
		var possibleMineComb = possibleMineCombStore[i];
		console.log("以下區塊中會有 " + possibleMineComb.mineCounter + " 格是炸彈");
		for(var j=0 ; j<possibleMineComb.positions.length ; j++){
			var pos = possibleMineComb.positions[j];
			console.log("row:"+ pos["row"],"col:"+ pos["col"]);
		}
		console.log("____");
	}
}
function work(){
	if( isSuccess() ){
		stopAutoPlay();
	}

	thisSweptGrids = solveGame();
	if(lastSweptGrids === thisSweptGrids){
		cantFoundWorkCounter ++;
		if(cantFoundWorkCounter >= 3){
			randomClickGrid(rows,cols);
		}
	}else{
		cantFoundWorkCounter = 0;
		lastSweptGrids = thisSweptGrids;
	}
}

function autoPlay(millis){
	if(!millis && millis != 0)millis = 500;
	initiDate();
	AIIntervalID = setInterval(work,millis);
}
function stopAutoPlay(){
	clearInterval(AIIntervalID);
	// console.log(" --------------- ");
	// console.log("stopAutoPlay");
}

var rows = null;
var cols = null;
var lastSweptGrids = null;
var cantFoundWorkCounter = null ;
// fomat [  <預測> , {   mineCounter:<潛在個數> , positions:[ <淺在位置>,{row:,col:} ]    }   ]
var possibleMineCombStore = [];
var AIIntervalID = null;
