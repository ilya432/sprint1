'use strict'
//App - minesweeper
var MINE = 'MINE', FLAG = 'FLAG', EMPTY_CELL = 'EMPTY_CELL'

var gBoard = null;


function initGame() {
    gBoard = buildBoard(3, 3);
    console.log(gBoard);
    renderBoard();
}
function buildBoard(iN, jN) {
    // debugger;
    var board = [];
    for (var i = 0; i <= iN; i++) {
        board[i] = [];
        for (var j = 0; j <= jN; j++) {
            //cells
            board[i][j] = createCell(i, j, EMPTY_CELL, false, '');
        }
    }
    board[3][2] = createCell(i, j, MINE, false);
    board[1][1] = createCell(i, j, MINE, false);
    board[0][2] = createCell(i, j, FLAG, false);

    return board;
}
function createCell(i, j, type, bool) {
    var cell = {
        pos: { i: i, j: j },
        type: type,
        isShown: bool,
        minesAround: 0
    }
    return cell;
}
function renderBoard() {
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr class="tr-${i}"> `;
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            currCell.minesAround = +countNegsMines(currCell.pos, 1);//get nags
            var cellClass = getClassName({ i: i, j: j });
            var tdId = 'cell-' + i + '-' + j;
            var img = '';

            strHTML += `<td class="cell ${cellClass}" data-id="${tdId}" " onclick="cellClicked(this)" >`;

            if (currCell.isShown && currCell.type === EMPTY_CELL) {
                strHTML += currCell.minesAround;  // epmty - to show mines negs
            } 
            
            if (currCell.isShown && (currCell.type === MINE || currCell.type === FLAG)) {
                if (currCell.type === FLAG) {
                    img = '<img class="cellImg " src="img/flag.png" >';
                    console.log('1');
                    strHTML += img;
                }
                else if (currCell.type === MINE) {
                    img = '<img class="cellImg " src="img/mine.png" >';
                    console.log('2');
                    strHTML += img;
                }
            }
            if (!currCell.isShown && (currCell.type === MINE || currCell.type === FLAG)) {//hide with img
                if (currCell.type === FLAG) {
                    img = '<img class="cellImg hidden" src="img/flag.png" >';
                    console.log('3');
                    strHTML += img;

                }
                else if (currCell.type === MINE) {
                    img = '<img class="cellImg hidden" src="img/mine.png" >';
                    console.log('4');
                    strHTML += img;
                }
            }
            strHTML += ' </td>';
        }
    }
    strHTML += ' </tr>';

    var table = document.querySelector('.tableBody');
    table.innerHTML = strHTML;
}
function cellClicked(elCell) {
    // debugger;
    var cellCoord = getCellCoord(elCell.dataset.id);
    var cell = gBoard[cellCoord.i][cellCoord.j];


    





    if(cell.type == MINE){debugger;
        elCell.src = 'img/mineBlown.png';
    }
    cell.isShown = true;
    renderBoard();
}

function countNegsMines(pos, distance) {
    var minesCount = 0;
    for (var i = pos.i - 1; i <= pos.i + distance; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + distance; j++) {
            if (j < 0 || j >= gBoard[0].length) continue; //same cell           
            if (i === pos.i && j === pos.j) continue;
            if (gBoard[i][j].type === MINE) minesCount++;
        }
    }
    return minesCount;
}
function RestartGame() {
    gBoard = null;
    initGame();
}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };

    return coord;
}

function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j
}

