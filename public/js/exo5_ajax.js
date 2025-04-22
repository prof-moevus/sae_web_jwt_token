$(document).ready(function() {
    // Variables pour stocker l'état de l'application
    let questionHistory = [];

    // Charger l'historique depuis le localStorage si disponible
    if (localStorage.getItem('yesnoHistory')) {
        try {
            questionHistory = JSON.parse(localStorage.getItem('yesnoHistory'));
            updateHistoryDisplay();
        } catch (e) {
            console.error('Erreur lors du chargement de l\'historique:', e);
            // Réinitialiser l'historique en cas d'erreur
            localStorage.removeItem('yesnoHistory');
            questionHistory = [];
        }
    }

    // Gestionnaire de soumission du formulaire
    $('#question-form').on('submit', function(event) {
        event.preventDefault();

        // Récupérer la question
        const question = $('#question-input').val().trim();

        if (question) {
            // Afficher l'indicateur de chargement
            $('#result-container').hide();
            $('#loading-spinner').show();

            // Appel à l'API YesNo.wtf
            fetchYesNoAnswer(question);
        }
    });

    // Gestionnaire pour effacer l'historique
    $('#clear-history').on('click', function() {
        // Confirmation avant suppression
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique?')) {
            questionHistory = [];
            localStorage.removeItem('yesnoHistory');
            updateHistoryDisplay();
        }
    });

    // Fonction pour faire la requête à l'API
    function fetchYesNoAnswer(question) {
        $.ajax({
            url: 'https://yesno.wtf/api',
            method: 'GET',
            dataType: 'json',
            timeout: 5000, // Timeout après 5 secondes
            success: function(data) {
                displayAnswer(question, data);
            },
            error: function(xhr, status, error) {
                // Gestion des erreurs
                console.error('Erreur lors de la requête à l\'API:', error);

                // Afficher un message d'erreur
                $('#loading-spinner').hide();
                $('#result-container').show();
                $('#question-display').text(question);
                $('#answer-display').text('Erreur: Impossible d\'obtenir une réponse');
                $('#answer-gif').attr('src', '').hide();
            }
        });
    }

    // Fonction pour afficher la réponse
    function displayAnswer(question, data) {
        // Masquer le loader et afficher le conteneur de résultat
        $('#loading-spinner').hide();
        $('#result-container').show();
        $('#answer-gif').attr('src', "").html();

        // Afficher la question posée
        $('#question-display').text(question + ' ?');

        // Charger et afficher le GIF
        if (data.image) {
            $('#answer-gif').attr('src', data.image).html();
            $('#answer-gif').show()
        } else {
            $('#answer-gif').hide();
        }

        // Traduire la réponse
        let answer;
        switch(data.answer.toLowerCase()) {
            case 'yes':
                answer = 'OUI';
                $('#answer-display').removeClass('no maybe').addClass('yes');
                break;
            case 'no':
                answer = 'NON';
                $('#answer-display').removeClass('yes maybe').addClass('no');
                break;
            case 'maybe':
                answer = 'PEUT-ÊTRE';
                $('#answer-display').removeClass('yes no').addClass('maybe');
                break;
            default:
                answer = data.answer;
        }

        // Afficher la réponse
        $('#answer-display').text(answer);



        // Ajouter à l'historique
        addToHistory(question, data.answer, data.image);

        // Effacer le champ de saisie
        $('#question-input').val('');
    }

    // Fonction pour ajouter une entrée à l'historique
    function addToHistory(question, answer, imageUrl) {
        // Créer un nouvel élément d'historique
        const historyItem = {
            question: question,
            answer: answer,
            image: imageUrl,
            timestamp: new Date().toISOString()
        };

        // Ajouter au début de l'historique
        questionHistory.unshift(historyItem);

        // Limiter l'historique à 10 entrées
        if (questionHistory.length > 10) {
            questionHistory.pop();
        }

        // Sauvegarder dans localStorage
        localStorage.setItem('yesnoHistory', JSON.stringify(questionHistory));

        // Mettre à jour l'affichage de l'historique
        updateHistoryDisplay();
    }

    // Fonction pour mettre à jour l'affichage de l'historique
    function updateHistoryDisplay() {
        const $historyList = $('#history-list');
        $historyList.empty();

        if (questionHistory.length === 0) {
            $historyList.append('<li>Aucune question dans l\'historique</li>');
            return;
        }

        // Ajouter chaque élément d'historique à la liste
        questionHistory.forEach(function(item) {
            // Traduire la réponse
            let answerText;
            let answerClass;

            switch(item.answer.toLowerCase()) {
                case 'yes':
                    answerText = 'OUI';
                    answerClass = 'yes';
                    break;
                case 'no':
                    answerText = 'NON';
                    answerClass = 'no';
                    break;
                case 'maybe':
                    answerText = 'PEUT-ÊTRE';
                    answerClass = 'maybe';
                    break;
                default:
                    answerText = item.answer;
                    answerClass = '';
            }

            const $historyItem = $(`
                <li>
                    <span class="history-question">${item.question}?</span>
                    <span class="history-answer ${answerClass}">${answerText}</span>
                </li>
            `);

            // Cliquer sur un élément d'historique pour revoir la réponse
            $historyItem.on('click', function() {
                $('#question-display').text(item.question + ' ?');
                $('#answer-display').text(answerText).removeClass('yes no maybe').addClass(answerClass);
                $('#answer-gif').attr('src', item.image).show();
                $('#result-container').show();

                // Faire défiler jusqu'à la réponse
                $('html, body').animate({
                    scrollTop: $('#answer-container').offset().top - 20
                }, 500);
            });

            $historyList.append($historyItem);
        });
    }

    // Gestion des erreurs globales AJAX
    $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
        console.error(`Erreur AJAX: ${thrownError} (${jqxhr.status})`);
    });
});
