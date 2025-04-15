date_echeance = null;
date_courante = null;

$("#heures").text((new Date()).getHours());
$("#minutes").text((new Date()).getMinutes());
$("#secondes").text((new Date()).getSeconds());

function update(){
    updateTime()
    updateDisplay()
}

function updateTime(){
const heures = (new Date()).getHours();
const minutes = (new Date()).getMinutes();
const secondes = (new Date()).getSeconds();

    $("#heures").text(heures);
    $("#minutes").text(minutes);
    $("#secondes").text(secondes);

}

function updateDisplay(){
    $("#heures-sep").toggleClass("sep-display")
    $("#minutes-sep").toggleClass("sep-display")

}

setInterval(update, 500);