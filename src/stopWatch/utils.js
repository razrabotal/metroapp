function zeroPadded(number) {
    return number >= 10 ? number.toString() : `0${number}`;
}

function last2Digits(number) {
    return number.toString().slice(-2);
}

export function formatTime(milliseconds) {
    const mm = zeroPadded(Math.floor(milliseconds / 1000 / 60));
    const ss = zeroPadded(Math.floor(milliseconds / 1000) % 60);
    const t = last2Digits(Math.floor(milliseconds / 10));
    return `${mm}:${ss}.${t}`;
}