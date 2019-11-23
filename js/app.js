'use strict'
//App - minesweeper

//Game objects
var MINE = 'MINE', EMPTY_CELL = 'EMPTY_CELL', BLOWN = 'BLOWN', FLAG = 'FLAG'
var gShowCells = false, gShowMines = false, gIsFirstClick = true;
var gGame = {}, gLevel = 'easy';

var gBoard = null;
var gIsGameOver = false, gIsGameStart = false, gIsVictory = false;
var gTimerInterval = false, gTick = 0;

initGame();
disableRightClick();
function initGame() {//debugger;    
    gGame = createGame(gLevel, 4, 4, 2, 6);
    gBoard = buildBoard(gGame.sizeX, gGame.sizeY);
    createRandomMines(gGame.mines);
    renderBoard();
    getflagsLeft();
}
function createGame(level, sizeX, sizeY, mines, flags) {
    var game = {
        level: level,
        sizeX: sizeX,
        sizeY: sizeY,
        mines: mines,
        flags: flags,
        minesFlagged: 0
    }
    return game;
}
function buildBoard(rows, cols) {
    var board = [];
    for (var i = 0; i <= rows; i++) {
        board[i] = [];
        for (var j = 0; j <= cols; j++) {
            board[i][j] = createCell(i, j, EMPTY_CELL, gShowCells);
        }
    }
    console.log(board);
    return board;
}
function createRandomMines() {
    for (var mine = 1; mine <= gGame.mines; mine++) {
        var i = getRandomInteger(0, gBoard.length - 1), j = getRandomInteger(0, gBoard.length - 1);
        gBoard[i][j] = createCell(i, j, MINE, gShowMines);
    }
}
function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr class="tr-${i}"> `;
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];

            var bgColor = ';', cellSpan = '';
            var cellClass = getClassName({ i: i, j: j });
            var tdId = 'cell-' + i + '-' + j;
            if (!gIsGameOver) {//if game over the clicked mine becoms 'BLOWN' and
                currCell.minesAround = +setMinesNegsCount(currCell.pos, 1);//get nags
            }
            cellSpan = '';
            if (currCell.isShown) {
                if (currCell.minesAround === 0) {
                    bgColor = `background-color:#808080;`;//grey
                    cellSpan = '';//hide  number from cell
                }
                else if (currCell.type === MINE) {
                    bgColor = '';
                    cellSpan = '';//hide  number from cell
                }
                else if (currCell.type === EMPTY_CELL && currCell.minesAround > 0) {

                    var fontWeight = `font-weight:${currCell.font};`;
                    cellSpan = `<span class="tdSpan"` +
                        `style="color:${getSpanColor(currCell.minesAround)};` +
                        `${fontWeight}${bgColor}">${currCell.minesAround}` +
                        `</span>`;
                }
            }
            strHTML += `<td class="cell ${cellClass}" data-id="${tdId}" onclick="cellClicked(this)" ` +
                `style="${bgColor}" onContextMenu="cellMarked(this)" > ${cellSpan}`;

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
function getflagsLeft() {
    var flagsSpan = document.querySelector('.flagsSpan');
    flagsSpan.innerText = gGame.flags;
}
function tick() {
    gTick = gTick + 1;
    var flagsSpan = document.querySelector('.timerSpan');
    flagsSpan.innerText = gTick;
    console.log('tick-' + gTick);
}
function createCell(i, j, type, isShown) {
    var img = '';
    if (type !== EMPTY_CELL) {
        if (isShown) {
            img = `<img class="cellImg " src="img/${type}.png">`;
        } else {
            img = `<img class="cellImg hidden" src="img/${type}.png">`;
        }
    }
    var cell = {
        pos: { i: i, j: j },
        type: type,
        prevType: '',
        isShown: isShown,
        minesAround: 0,
        imgTag: img,
        isFlagged: false
    }
    return cell;
}
function cellClicked(elCell) {

    if (!gIsVictory) {
        if (!gTimerInterval) {
            gTimerInterval = setInterval(tick, 1000);
        }
        var cellCoord = getCellCoord(elCell.dataset.id);
        var cell = gBoard[cellCoord.i][cellCoord.j];

        if (cell.type === MINE) {//Game over!
            // debugger;
            if (gIsFirstClick) {
                gIsFirstClick = false;
                gBoard[cell.pos.i][cell.pos.j] = [];
                gBoard[cell.pos.i][cell.pos.j] = createCell(cell.pos.i, cell.pos.j, EMPTY_CELL, gShowCells);
                gGame.mines - 1;
                gBoard[cell.pos.i][cell.pos.j].isShown = true;
                createRandomMines();
            } else if (!gIsGameOver) {
                gameOver(cell);
            }
        }
        else if (cell.type === EMPTY_CELL) {//            
            gIsFirstClick = false;
            cell.isShown = true;
            expandEmptyCells(cell.pos, 1);
        }else{            
            gIsFirstClick = false;
        }
        renderBoard();
    }
}
function cellMarked(elCell) {//right click
    var cellCoord = getCellCoord(elCell.dataset.id);
    var cell = gBoard[cellCoord.i][cellCoord.j];
    if (!cell.isShown && gGame.flags > 0) {//to flag 
        cell.prevType = cell.type;
        cell.type = FLAG;
        cell.isFlagged = true;
        cell.isShown = true;
        cell.imgTag = `<img class="cellImg " src="img/flag.png" >`;
        gGame.flags--;
        if (cell.prevType === MINE) {
            gGame.minesFlagged++;
            if (gGame.minesFlagged === gGame.mines) {
                //victory!
                victory();
                // return;
            }
        }
        getflagsLeft();
    }

    else if (cell.isShown && cell.type === FLAG) {//to unflag
        // debugger;
        cell.isFlagged = false;
        cell.isShown = false;
        gGame.minesFlagged--;
        if (cell.prevType === MINE) {
            cell.type = cell.prevType;
            cell.prevType = '';
            cell.imgTag = `<img class="cellImg hidden " src="img/mine.png" >`;
            gGame.flags++;
            getflagsLeft();
        }
        else if (cell.prevType === EMPTY_CELL) {
            cell.type = cell.prevType;
            cell.prevType = '';
            cell.imgTag = '';
            gGame.flags++;
            getflagsLeft();
        }
    }
    else {
        return;
    }
    renderBoard();
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
            if (cell.minesAround === 0 && cell.type !== MINE) {
                cell.isShown = true;
            }
            if (cell.minesAround > 0 && cell.type !== MINE) {
                cell.isShown = true;
            }
        }
    }
}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}
function showAllCells(pos) {//debugger;
    // gBoard.forEach(function(el){el.status = "active";}) 
    if (gIsGameOver) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                var cell = gBoard[i][j];
                if (cell.pos !== pos) {
                    cell.isShown = true;
                    cell.isFlagged = false;
                    if (cell.type !== EMPTY_CELL) {
                        if (cell.type === FLAG) {
                            // if(cell.prevType){

                            // }
                            cell.type = cell.prevType;
                            cell.imgTag = `<img class="cellImg" src="img/${cell.prevType}.png" >`;
                        } else {
                            cell.imgTag = `<img class="cellImg" src="img/${cell.type}.png" >`;
                        }
                    } else {
                        cell.imgTag = '';
                    }
                }
            }
        }
    } else {//victory
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                var cell = gBoard[i][j];
                cell.isShown = true;
                cell.isFlagged = false;
                if (cell.type !== EMPTY_CELL) {
                    if (cell.type === FLAG) {
                        cell.type = cell.prevType;
                        cell.imgTag = `<img class="cellImg" src="img/${cell.prevType}.png" >`;
                    } else {
                        cell.imgTag = `<img class="cellImg" src="img/${cell.type}.png" >`;
                    }
                } else {
                    cell.imgTag = '';
                }
            }
        }
    }
}
function gameOver(cell) {
    clearInterval(gTimerInterval);
    gIsGameOver = true;
    cell.type = 'BLOWN';
    cell.imgTag = `<img class="cellImg" src="img/${cell.type}.png" >`;
    showAllCells(cell.pos);
    var smileyImg = document.querySelector('.smileyImg');
    smileyImg.src = './img/gameOver.png';
}
function restartGame(level) {//debugger;
    var vistoryDiv = document.querySelector('.victoryPop');
    vistoryDiv.classList.add('hidden');

    var smileyImg = document.querySelector('.smileyImg');
    smileyImg.src = './img/start.png';

    if (gLevel !== level) { gLevel = level };

    gGame = {};
    gBoard = [];
    //default params;
    if (gTimerInterval) clearInterval(gTimerInterval);
    gIsGameOver = false, gIsGameStart = false, gTimerInterval = null, gIsVictory = false;
    gIsFirstClick = true;
    var flagsSpan = document.querySelector('.timerSpan');
    flagsSpan.innerText = '';
    gTick = 0;
    //change image back to smiley
    var smileyImg = document.querySelector('.smileyImg');
    smileyImg.src = './img/start.png';
    //get level & params
    switch (gLevel) {
        case 'easy':
            gGame = createGame(level, 4, 4, 2, 6);
            break;
        case 'hard':
            gGame = createGame(level, 8, 8, 12, 8);
            break;
        case 'expert':
            gGame = createGame(level, 12, 12, 30, 8);
            break;
        default:
            break;
    }
    gBoard = buildBoard(gGame.sizeX, gGame.sizeY);
    createRandomMines(gGame.mines);
    renderBoard();
    getflagsLeft();
}
function disableRightClick() {
    var table = document.querySelector('.gameTable');
    window.onload = function () {
        table.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        }, false);
    };
}
function setMinesNegsCount(pos, distance) {
    var minesCount = 0;
    for (var i = pos.i - 1; i <= pos.i + distance; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + distance; j++) {
            if (j < 0 || j >= gBoard[0].length) continue; //same cell           
            if (i === pos.i && j === pos.j) continue;
            if (i < 0 || i >= gBoard.length) continue;
            if (gBoard[i][j].type === MINE || gBoard[i][j].prevType === MINE) minesCount++;
        }
    }
    return minesCount;
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
function victory() {
    gIsVictory = true;
    if (gTimerInterval) clearInterval(gTimerInterval);
    showAllCells();
    var vistoryDiv = document.querySelector('.victoryPop');
    vistoryDiv.classList.remove('hidden');    
    var smileyImg = document.querySelector('.smileyImg');
    smileyImg.src = './img/winSmiley.png';
}

