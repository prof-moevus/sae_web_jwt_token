$("#heure").text((new Date()).getHours());
$("#minutes").text((new Date()).getMinutes());
$("#secondes").text((new Date()).getSeconds());

console.log($('a').attr('href'));
$('a').attr('href',  "/mon-site-de-hacker-allo")

$("#countdown-timer").before('<p>Contenu ajouté à la fin</p>');