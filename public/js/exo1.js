const element = document.querySelector('h1');

$(document).ready(() => {
$('.item').css('color', 'red').on('click', function () {
    if (this.style.fontWeight !== 'bold') {
        this.style.fontWeight = 'bold';
    } else {
        this.style.fontWeight = 'normal';
    }
});

})