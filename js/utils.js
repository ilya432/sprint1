'use strict'

//Utils

function getClassName(location) {//accepts object
	// debugger;
	var cellClass = `cell-${location.i}-${location.j}`
	return cellClass;
}

//The maximum is inclusive and the minimum is inclusive 
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function copyValuesObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function compare(a, b) {
    // return a - b;
    return b - a;
}

// Should return Positive number if num1 is bigger
// Should return Negative number if num2 is bigger
// Should return 0 if equal
function compareNums(num1, num2) {
    return num1 - num2;    
    if (num1 > num2) return 1;
    if (num2 > num1) return -1;
    return 0;
}


function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}
