/* Объекты форм */
const mainForm = {
    name: 'dot_form',
    form: undefined,
    fields: {x: undefined, y: undefined, r: undefined},
    formError: undefined,
};
const hiddenForm = {
    name: 'canvas_hidden_form',
    form: undefined,
    fields: {x: undefined, y: undefined, r: undefined},
    formError: undefined,
};
function setMainFormData(mainForm) {
    mainForm.form = document.getElementById(mainForm.name);
    mainForm.fields = {
        x: document.getElementById(mainForm.name + ':x'),
        y: document.getElementById(mainForm.name + ':y'),
        r: document.getElementById(mainForm.name + ':r'),
    };
    mainForm.formError = document.getElementById('form_error');
}
function setHiddenFormData(hiddenForm) {
    hiddenForm.form = document.getElementById(hiddenForm.name);
    hiddenForm.fields = {
        x: document.getElementById(hiddenForm.name + ':x_hidden'),
        y: document.getElementById(hiddenForm.name + ':y_hidden'),
        r: document.getElementById(hiddenForm.name + ':r_hidden'),
    };
    hiddenForm.formError = document.getElementById('canvas_error');
}
/* Объекты форм */


/* Вспомогательные функции */
function setAttr(element, valueName, value) {
    element.setAttribute(valueName, value);
}
function removeAttr(element, nameAttr) {
    element.removeAttribute(nameAttr);
}
function removeClass(element, className) {
    element.classList.remove(className);
}
function addClass(element, nameClass) {
    element.classList.add(nameClass);
}
function writeText(element, text) {
    if (element == null) {
        return;
    }
    if (typeof element.innerText !== 'undefined') {
        // IE8
        element.innerText = text;
    } else {
        // Остальные браузеры
        element.textContent = text;
    }
}
function cleanTextInElement(element) {
    writeText(element, '');
}
function findValueFromFieldset(fieldset) {
    if (fieldset == null || fieldset.elements == null) {
        return '';
    }
    for (let i=0; i < fieldset.elements.length - 1; i++) {
        let input = fieldset.elements[i];
        if (input.checked) {
            return input.value.trim();
        }
    }
    return '';
}
/* Вспомогательные функции */


/* Функции валидации формы */
function writeErrorMessages(elementError, stringForOneError, stringForManyErrors, args) {
    let stringArr = [];
    for (let key in args) {
        if (args[key] === '' || args[key] == null) {
            stringArr.push(key);
        }
    }
    let stringArrCount = stringArr.length;
    if (stringArrCount === 1) {
        writeText(elementError, stringForOneError + stringArr[0]);
        return;
    }
    let stringErr = stringForManyErrors;
    for (let i=0; i < stringArrCount; i++) {
        if (i > 0) {
            stringErr += ",";
        }
        stringErr += " " + stringArr[i];
    }
    writeText(elementError, stringErr);
}
function getValuesStringFromFieldForForm(fieldX, fieldY, fieldR, formError) {
    let valueX = fieldX.value.trim();
    let valueY = fieldY.value.trim();
    let valueR = fieldR.value.trim();

    if (valueX === '' || valueY === '' || valueR === '') {
        writeErrorMessages(
            formError,
            'Передан пустой аргумент: ',
            'Переданы пустые аргументы:',
            {'X': valueX, 'Y': valueY, 'R': valueR}
        );
        return '';
    }
    return {'x': valueX, 'y': valueY, 'r': valueR};
}
function parseValuesFromStringForForm(valueX, valueY, valueR, formError) {
    const regex = '^[-+]?[0-9]{0,9}(?:[.,][0-9]{1,9})*$';
    let resultX = valueX.match(regex);
    let resultY = valueY.match(regex);
    let resultR = valueR.match(regex);

    if (resultX == null || resultY == null || resultR == null) {
        writeErrorMessages(
            formError,
            'Неправильный формат аргумента: ',
            'Неправильный формат аргументов:',
            {'X': resultX, 'Y': resultY, 'R': resultR}
        );
        return '';
    }
    valueX = parseFloat(valueX);
    valueY = parseFloat(valueY);
    valueR = parseFloat(valueR);
    return {'x': valueX, 'y': valueY, 'r': valueR};
}
function validateRange(valueX, valueY, valueR, formError) {
    if ((valueX < -4.0 || valueX > 4.0) ||
        (valueY < -5.0 || valueY > 3.0) ||
        (valueR < 1.0 || valueR > 4.0)) {
        if (valueX < -4.0 || valueX > 4.0) {
            valueX = '';
        }
        if (valueY < -5.0 || valueY > 3.0) {
            valueY = '';
        }
        if (valueR < 1.0 || valueR > 4.0) {
            valueR = '';
        }
        writeErrorMessages(
            formError,
            'Значение выходит за допустимый диапазон: ',
            'Значения выходят за допустимый диапазон:',
            {'X': valueX, 'Y': valueY, 'R': valueR}
        );
        return false;
    }
    return true;
}
function formHandler(form) {
    cleanTextInElement(form.formError);
    const rawFieldValues = getValuesStringFromFieldForForm(
        form.fields.x,
        form.fields.y,
        form.fields.r,
        form.formError
    );
    if (rawFieldValues === '') {
        return false;
    }
    const parsedValues = parseValuesFromStringForForm(
        rawFieldValues['x'],
        rawFieldValues['y'],
        rawFieldValues['r'],
        form.formError
    );
    if (parsedValues === '') {
        return false;
    }
    return validateRange(
        parsedValues['x'],
        parsedValues['y'],
        parsedValues['r'],
        form.formError
    );
}
/* Функции валидации формы */


/* Функции редактирующие отображение времени в результатах у клиента в соответствии с его временным поясом */
function parseTime(t) {
    const regexp = /(\d+)(?::(\d{1,2}))(?::(\d{1,2}))/;
    let date = new Date();
    let time = t.match(regexp);
    date.setUTCHours(parseInt(time[1]));
    date.setUTCMinutes(parseInt(time[2]));
    date.setUTCSeconds(parseInt(time[3]));
    return date;
}
function timeReduction(dataTable) {
    const resultRows = dataTable.querySelectorAll('tbody > tr');
    let timeDate;
    let timeDateElement;
    for (let i=0; i < resultRows.length; i++) {
        if (resultRows[i].children.length === undefined || resultRows[i].children.length == null
            || resultRows[i].children.length < 5) {
            continue;
        }
        timeDateElement = resultRows[i].children[4];
        timeDate = parseTime(timeDateElement.innerText.trim());
        writeText(
            timeDateElement,
            timeDate.getHours() + ':' + timeDate.getMinutes() + ':' + timeDate.getSeconds()
        );
    }
}
/* Функции редактирующие отображение времени в результатах у клиента в соответствии с его временным поясом */


/* Функция раскраски строк таблицы результатов */
function paintingRows(dataTable) {
    const resultRows = dataTable.querySelectorAll('tbody > tr');
    const stringWhenIsHit = 'Попала';
    const classWhenIsHit = 'success';
    const classWhenIsNotHit = 'fail';
    let isHit;
    for (let i=0; i < resultRows.length; i++) {
        if (resultRows[i].children.length === undefined || resultRows[i].children.length == null
            || resultRows[i].children.length < 4) {
            continue;
        }
        isHit = (resultRows[i].children[0].innerText.trim() === stringWhenIsHit);
        if (isHit) {
            addClass(resultRows[i], classWhenIsHit);
        } else {
            addClass(resultRows[i], classWhenIsNotHit);
        }
    }
}
/* Функция раскраски строк таблицы результатов */


/* Функции канваса */
// Запись координат клика мыши по канвасу в атрибуты x и y канваса
function canvasHandler(e) {
    canvasObj.canvas.setAttribute('x', e.offsetX);
    canvasObj.canvas.setAttribute('y', e.offsetY);
}
function updateHiddenFieldsForCanvas(hiddenForm, x, y, r) {
    setAttr(hiddenForm.fields.x, 'value', x);
    setAttr(hiddenForm.fields.y, 'value', y);
    setAttr(hiddenForm.fields.r, 'value', r);
}
// Обновление значений формы при клике на канвас
function clickOnCanvasHandler() {
    const r = parseFloat(mainForm.fields.r.value.trim());
    if (r === undefined || isNaN(r) || r == null || r < 1 || r > 4) {
        updateHiddenFieldsForCanvas(hiddenForm, 0, 0, r);
        return;
    }
    const offsetX = parseInt(canvasObj.canvas.getAttribute('x').trim());
    const offsetY = parseInt(canvasObj.canvas.getAttribute('y').trim());
    if (offsetX === undefined || offsetY === undefined || isNaN(offsetX) || isNaN(offsetY)
        || offsetX == null || offsetY == null) {
        return;
    }
    const xy = calcCoordinates(canvasObj, offsetX, offsetY, r);
    const x = xy['x'].toFixed(4);
    const y = xy['y'].toFixed(4);
    if (x === undefined || y === undefined || x == null || y == null) {
        return;
    }
    updateHiddenFieldsForCanvas(hiddenForm, x, y, r);
}
function updateCanvas() {
    const dotsData = {dots: [], r: 0};
    const dataTable = document.getElementById('results');
    if (dataTable === undefined) {return;}
    loadDataFromTable(dataTable, dotsData);
    drawCanvas(canvasObj, dotsData);
    paintingRows(dataTable);
    timeReduction(dataTable);
}
/* Функции канваса */


/* Функции очищения таблицы данных */
function cleanDataTable(dataTable) {
    const thead = dataTable.querySelector('thead');
    const tbody = dataTable.querySelector('tbody');
    if (thead === undefined || tbody === undefined || thead == null || tbody == null) {
        return;
    }
    thead.remove();
    tbody.remove();
    dataTable.createTBody();
}
function removeAllDots() {
    const dataTable = document.getElementById('results');
    cleanDataTable(dataTable);
    updateCanvas();
}
/* Функции очищения таблицы данных */


/* Функции обработки форм */
function updateCanvasByAjax(onEvent) {
    if (onEvent.status === 'success') {
        updateCanvas();
    }
}
/* Функции обработки форм */


/* Функции вызываемые из шаблона */
function cleanAllCommandLink() {
    const elements = document.querySelectorAll('.option-command-link-selected');
    for (let i=0; i < elements.length; i++) {
        removeAttr(elements[i], 'class');
    }
}
function selectCommandLink(element, num, idSelect) {
    cleanAllCommandLink();
    const commandLink = document.getElementById(idSelect);
    addClass(commandLink, 'option-command-link-selected');
    setAttr(element, 'value', num);
}
function selectX(num, idSelect) {
    selectCommandLink(mainForm.fields.x, num, idSelect);
}
/* Функции вызываемые из шаблона */


/* Вызов всех функций */
window.onload = function() {
    setMainFormData(mainForm);
    setHiddenFormData(hiddenForm);
    setCanvasData(canvasObj);
    canvasObj.canvas.addEventListener('click', canvasHandler);
    updateCanvas();
}
/* Вызов всех функций */