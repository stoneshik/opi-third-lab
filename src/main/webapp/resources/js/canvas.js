function findCenter(canvasObj) {
    canvasObj.center.x = Math.round(canvasObj.width / canvasObj.step.x / 2) * canvasObj.step.x;
    canvasObj.center.y = Math.round(canvasObj.height / canvasObj.step.y / 2) * canvasObj.step.y;
}

function drawArea(ctx, canvasObj, color) {
    const center = canvasObj.center;
    const r = canvasObj.r;

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.arc(center.x, center.y, r.step.x, Math.PI, Math.PI + Math.PI / 2);
    ctx.lineTo(center.x + r.step.x * 2, center.y);
    ctx.lineTo(center.x + r.step.x * 2, center.y + r.step.y * 2);
    ctx.lineTo(center.x, center.y + (r.step.y * 2));
    ctx.lineTo(center.x, center.y);

    ctx.fillStyle = color;
    ctx.fill();
}

function drawGrid(ctx, canvasObj, color){
    const stepX = canvasObj.step.x;
    const stepY = canvasObj.step.y;
    ctx.beginPath();
    for(let i = 1 + stepX; i < canvasObj.width; i += stepX){
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasObj.height);
    }
    for(let j = 1 + stepY; j < canvasObj.height; j += stepY){
        ctx.moveTo(0, j);
        ctx.lineTo(canvasObj.width, j);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = canvasObj.lineWidth;
    ctx.stroke();
}

function drawAxes(ctx, canvasObj, color) {
    const center = canvasObj.center;
    const step = canvasObj.step;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = canvasObj.lineWidth;
    //ось X
    ctx.beginPath();
    ctx.moveTo(0, center.y);
    ctx.lineTo(canvasObj.width, center.y);
    //ось Y
    ctx.moveTo(center.x, canvasObj.height);
    ctx.lineTo(center.x, 0);
    ctx.stroke();

    //отрисовка стрелок
    const halfStepX = Math.round(step.x / 2);
    const halfStepY = Math.round(step.y / 2);
    //для X
    ctx.beginPath();
    ctx.moveTo(canvasObj.width, center.y);
    ctx.lineTo(canvasObj.width - halfStepX, center.y + halfStepY);
    ctx.lineTo(canvasObj.width - halfStepX, center.y - halfStepY);
    ctx.fill();
    //для Y
    ctx.beginPath();
    ctx.moveTo(center.x - halfStepX, halfStepY);
    ctx.lineTo(center.x, 0);
    ctx.lineTo(center.x + halfStepX, halfStepY);
    ctx.fill();
}

function drawSerifs(ctx, canvasObj, color) {
    const center = canvasObj.center;
    const step = canvasObj.step;
    const serif = canvasObj.serif;
    const r = canvasObj.r;
    const startSerifX = center.x - (r.step.x * serif.numSerif.x);
    const startSerifY = center.y - (r.step.y * serif.numSerif.y);

    ctx.beginPath();
    // Рисуем для оси X
    for (let i=0; i < serif.numSerif.x * 2 + 1; i++) {
        ctx.moveTo(startSerifX + (r.step.x * i), center.y - Math.round(step.y / 2));
        ctx.lineTo(startSerifX + (r.step.x * i), center.y + Math.round(step.y / 2));
    }
    // Рисуем для оси Y
    for (let i=0; i < serif.numSerif.y * 2 + 1; i++) {
        ctx.moveTo(center.x - Math.round(step.x / 2), startSerifY + (r.step.y * i));
        ctx.lineTo(center.x + Math.round(step.x / 2), startSerifY + (r.step.y * i));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = canvasObj.lineWidth;
    ctx.stroke();
}

function drawLabels(ctx, canvasObj, color) {
    const center = canvasObj.center;
    const step = canvasObj.step;
    const r = canvasObj.r;

    ctx.font = canvasObj.font;
    // Для оси X
    ctx.strokeText('-R', center.x - (r.step.x * 2) - Math.round(step.x / 2), center.y - step.y);
    ctx.strokeText('-R/2', center.x - r.step.x - Math.round(step.x / 2), center.y - step.y);
    ctx.strokeText('R/2', center.x + r.step.x - Math.round(step.x / 2), center.y - step.y);
    ctx.strokeText('R', center.x + (r.step.x * 2) - Math.round(step.x / 4), center.y - step.y);
    ctx.strokeText('x', canvasObj.width - Math.round(step.x * 0.6), center.y - step.y);
    // Для оси Y
    ctx.strokeText('-R', center.x + step.x, center.y + (r.step.y * 2) + Math.round(step.y / 4));
    ctx.strokeText('-R/2', center.x + step.x, center.y + r.step.y + Math.round(step.y / 4));
    ctx.strokeText('R/2', center.x + step.x, center.y - r.step.y + Math.round(step.y / 4));
    ctx.strokeText('R', center.x + step.x, center.y - (r.step.y * 2) + Math.round(step.y / 4));
    ctx.strokeText('y', center.x + step.x, Math.round(step.y * 0.6));
}

function drawDots(ctx, canvasObj, colorWhenDotIsHit, colorWhenDotIsNotHit, dotsData) {
    let isHit, x, y, r;
    const center = canvasObj.center;
    const stepR = canvasObj.r.step;
    for (let i=0; i < dotsData.dots.length; i++) {
        isHit = dotsData.dots[i].isHit;
        x = dotsData.dots[i].x;
        y = dotsData.dots[i].y;
        r = dotsData.dots[i].r;
        ctx.beginPath();
        ctx.arc(
            center.x + ((x / r) * stepR.x * 2),
            center.y - ((y / r) * stepR.y * 2),
            Math.round(canvasObj.step.x / 4),
            0,
            Math.PI * 2
        );
        if (isHit) {
            ctx.fillStyle = colorWhenDotIsHit;
        } else {
            ctx.fillStyle = colorWhenDotIsNotHit;
        }
        ctx.fill();
    }
}

// Работа с данными точек, считываемыми из таблицы результатов
function newDot(isHit, x, y, r) {
    return {isHit: isHit, x: x, y: y, r: r};
}
function addDot(dotsData, dot) {
    dotsData.dots.push(dot);
}
function loadDataFromTable(dataTable, dotsData) {
    const resultRows = dataTable.querySelectorAll('tbody > tr');
    const stringWhenIsHit = 'Попала';
    let isHit, x, y, r;
    dotsData.r = 0;  // Для разных r канвас должен быть разным
    for (let i=0; i < resultRows.length; i++) {
        if (resultRows[i].children.length === undefined || resultRows[i].children.length == null
            || resultRows[i].children.length < 4) {
            continue;
        }
        isHit = (resultRows[i].children[0].innerText.trim() === stringWhenIsHit);
        x = parseFloat(resultRows[i].children[1].innerText.trim());
        y = parseFloat(resultRows[i].children[2].innerText.trim());
        r = parseFloat(resultRows[i].children[3].innerText.trim());
        if (!isNaN(x) && !isNaN(y) && !isNaN(r) && x != null && y != null && r != null) {
            if (dotsData.r === 0) {
                dotsData.r = r;
            }
            if (r !== dotsData.r) {
                break;
            }
            addDot(
                dotsData,
                newDot(isHit, x, y, r)
            );
        }
    }
}
function calcCoordinates(canvasObj, offsetX, offsetY, r) {
    return {
        'x': ((offsetX - canvasObj.center.x) / (canvasObj.r.step.x * 2)) * r,
        'y': -(((offsetY - canvasObj.center.y) / (canvasObj.r.step.y * 2)) * r)
    };
}

function drawCanvas(canvasObj, dotsData) {
    const ctx = canvasObj.canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasObj.canvas.width, canvasObj.canvas.height);
    findCenter(canvasObj);
    drawArea(ctx, canvasObj, '#4A90E2');
    drawGrid(ctx, canvasObj, 'lightgray');
    drawAxes(ctx, canvasObj, 'black');
    drawSerifs(ctx, canvasObj, 'black');
    drawLabels(ctx, canvasObj, 'black');
    if (dotsData.dots.length !== 0) {
        drawDots(ctx, canvasObj, '#25D500', '#F60018', dotsData);
    }
}

/* Объект канваса */
const canvasObj = {
    canvas: undefined,
    width: undefined,
    height: undefined,
    font: "16px serif",
    center: {x: 0, y: 0},
    dotArgs: {x: 0, y: 0, r: 0},
    step: {x: 17, y: 17},
    serif: {
        numSerif: {x: 2, y: 2},
        numStepForSerif: {x: 3, y: 3}
    },
    r: {},
    lineWidth: 1,
};
function setCanvasData(canvasObj) {
    canvasObj.canvas = document.getElementById('canvas');
    canvasObj.width = canvasObj.canvas.width;
    canvasObj.height = canvasObj.canvas.height;
    canvasObj.r = {
        step: {
            x: canvasObj.serif.numStepForSerif.x * canvasObj.step.x,
            y: canvasObj.serif.numStepForSerif.y * canvasObj.step.y
        }
    };
}
/* Объект канваса */
