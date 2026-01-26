let clock = undefined;

function writeText(element, text) {
    if (typeof element.innerText !== 'undefined') {
        // IE8
        element.innerText = text;
    } else {
        // Остальные браузеры
        element.textContent = text;
    }
}

function formatDate(date) {
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    let yy = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;

    return dd + '.' + mm + '.' + yy;
}

function setTime() {
    let timeDate = new Date();
    writeText(
        clock,
        formatDate(timeDate) + ', ' + timeDate.getHours() + ':' + timeDate.getMinutes() + ':' + timeDate.getSeconds()
    );
}

window.onload = function() {
    clock = document.getElementById('clock');
    const timeOut = 11_000;
    setTime(clock);
    setInterval(setTime, timeOut);
}