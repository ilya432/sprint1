'use strict'
//App - minesweeper
var MINE = 'MINE', EMPTY_CELL = 'EMPTY_CELL', BLOWN = 'BLOWN', FLAG = 'FLAG'
var gIsShownCells = false, gIsShownMines = false;

var gLevel = 'easy', gflagsCount = 6, gSetMines = 4, gBoardSizeX = 5, gBoardSizeY = 5

var gBoard = null;
var gIsGameOver = false;
var gIsIntervalStart = false;
var gTimerInterval;
var gTick = 0;
initGame();
disableRightClick();
function initGame() {
    gBoard = buildBoard(gBoardSizeX, gBoardSizeY);
    createRandomMines(gSetMines);
    
    renderBoard();
    getflagsLeft();
}
function getflagsLeft() {
    var flagsSpan = document.querySelector('.flagsSpan');
    flagsSpan.innerText = gflagsCount;
}
function tick() {
    gTick = gTick+1;
    var flagsSpan = document.querySelector('.timerSpan');
    flagsSpan.innerText = gTick;
}
function buildBoard(rows, cols) {
    var board = [];
    for (var i = 0; i <= rows; i++) {
        board[i] = [];
        for (var j = 0; j <= cols; j++) {
            board[i][j] = createCell(i, j, EMPTY_CELL, gIsShownCells);
        }
    }
    return board;
}
function createCell(i, j, type, isShown) {
    var img = '';
    if (type !== EMPTY_CELL) {
        if (isShown) {
            img = `<img class="cellImg " src="img/${type}.png" >`;
        } else {
            img = `<img class="cellImg hidden" src="img/${type}.png" >`;
        }
    }
    var cell = {
        pos: { i: i, j: j },
        type: type,
        isShown: isShown,
        minesAround: 0,
        imgTag: img,
        font: '',
        flag: false
    }
    return cell;
}
function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr class="tr-${i}"> `;
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (!gIsGameOver) {//if game over the clicked mine becoms 'BLOWN' and
                currCell.minesAround = +setMinesNegsCount(currCell.pos, 1);//get nags
            }
            var bgColor = ';';
            if (currCell.minesAround === 0 && currCell.isShown && currCell.type === EMPTY_CELL) {
                bgColor = `background-color:#808080;`;
            }
            var cellClass = getClassName({ i: i, j: j });
            var tdId = 'cell-' + i + '-' + j;

            strHTML += `<td class="cell ${cellClass}" data-id="${tdId}" onclick="cellClicked(this)" ` +
                `style="${bgColor}" onContextMenu="cellMarked(this)" >`;
            if (currCell.type === EMPTY_CELL && currCell.isShown) {
                // get mines negs count from cell object
                var fontWeight = '';
                if (currCell.font === 'bold') {
                    fontWeight = `font-weight:${currCell.font};`;
                }
                strHTML += `<span class="tdSpan"` +
                    `style="color:${getSpanColor(currCell.minesAround)};` +
                    `${fontWeight}${bgColor}">${currCell.minesAround}` +
                    `</span>`;
            }
            if (currCell.type !== EMPTY_CELL) {//mine or flag (all, shown and hidden)
                strHTML += currCell.imgTag;
            }
            strHTML += ' </td>';
        }
    }
    strHTML += ' </tr>';
    var table = document.querySelector('.tableBody');
    table.innerHTML = strHTML;
}
function cellClicked(elCell) {
    if (!gIsIntervalStart) {
        gTimerInterval = setInterval(tick(), 1000);
        gIsIntervalStart = true;
    }
    var cellCoord = getCellCoord(elCell.dataset.id);
    var cell = gBoard[cellCoord.i][cellCoord.j];
    if (cell.type === MINE) {//Game over!
        gameOver(cell);
    } else if (cell.type === EMPTY_CELL) {//
        cell.isShown = true;
        expandEmptyCells(cell.pos, 1);
    }
    renderBoard();
}
function cellMarked(elCell) {
    var cellCoord = getCellCoord(elCell.dataset.id);
    var cell = gBoard[cellCoord.i][cellCoord.j];
    if (!cell.isShown) {//hidden
        cell.flag = true;//add flag in
        cell.isShown = true;
        cell.type = FLAG;
        cell.imgTag = `<img class="cellImg " src="img/flag.png" >`; //style="z-index:1000;"
        gflagsCount--;
        getflagsLeft();
    }
    renderBoard();
}
function setMinesNegsCount(pos, distance) {
    var minesCount = 0;
    for (var i = pos.i - 1; i <= pos.i + distance; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + distance; j++) {
            if (j < 0 || j >= gBoard[0].length) continue; //same cell           
            if (i === pos.i && j === pos.j) continue;
            if (i < 0 || i >= gBoard.length) continue;
            if (gBoard[i][j].type === MINE) minesCount++;
        }
    }
    return minesCount;
}
function expandEmptyCells(pos, distance) {
    for (var i = pos.i - 1; i <= pos.i + distance; i++) {
        // if i is out of bounderies - go to the next i 
        if (i < 0 || i >= gBoard.length) continue;  //continue to the next i         
        for (var j = pos.j - 1; j <= pos.j + distance; j++) {
            // if j is out of bounderies - go to the next j:
            if (j < 0 || j >= gBoard[0].length) continue; // continue to the next j.
            var cell = gBoard[i][j];
            if (i === pos.i && j === pos.j) continue;
            if (cell.minesAround === 0) {
                cell.isShown = true;
            }
            if (cell.minesAround > 0) {
                cell.isShown = true;
                cell.font = 'bold'
            }
        }
    }
}
function createRandomMines(minesNum) {
    for (var mine = 1; mine <= minesNum; mine++) {
        var i = getRandomInteger(0, gBoard.length - 1), j = getRandomInteger(0, gBoard.length - 1);
        gBoard[i][j] = createCell(i, j, MINE, gIsShownMines);
    }
}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}
function getSpanColor(num) {
    var strColor = '';
    switch (num) {
        case 1:
            return strColor = '#000dff;';//blue
        case 2:
            return strColor = '#088212;';//green
        case 3:
            return strColor = '#fa0202;';//red
        default:
            break;
    }
    return strColor;
}
function gameOver(cell) {
    gIsGameOver = true;
    cell.type = 'BLOWN';
    cell.imgTag = `<img class="cellImg" src="img/${cell.type}.png" >`;
    showAllCells(cell.pos);
}
function showAllCells(pos) {
    // gBoard.forEach(function(el){el.status = "active";}) 
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j];
            if (cell.pos !== pos) {
                cell.isShown = true;
                cell.imgTag = `<img class="cellImg" src="img/${cell.type}.png" >`;
            }
        }
    }
}
function RestartGame() {
    gBoard = null;
    gIsGameOver = false;
    clearInterval(gTimerInterval);
    gTimerInterval = null;
    if (gIsIntervalStart) gIsIntervalStart = false;
    gTick = 0;
    initGame();
}
function disableRightClick() {
    var table = document.querySelector('.gameTable');
    window.onload = function () {
        table.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, false);
    };
}
function changeLevel(level){
    gLevel = level;
    switch (level) {
        case 'easy':
                gSetMines = 4;
                gflagsCount = 6;
                gBoardSizeX = 5;
                gBoardSizeY = 5;
                renderBoard();
            break; 
        case 'hard':
                gSetMines = 7;
                gflagsCount = 8;
                gBoardSizeX = 9;
                gBoardSizeY = 9;
                renderBoard();
            break;
        case 'expert':
                gSetMines = 12;
                gflagsCount = 7;
                gBoardSizeX = 12;
                gBoardSizeY = 12;
                renderBoard();
            break;    
        default:
            break;
    }
}
