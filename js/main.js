(function($) {
	'use strict';

	var team = {
		name: '',
		score: 0
	};

	var scoreElement = $('#score-element');

	function handleAccelerometerData(event) {
		var score = 0;
		for (var property in event.acceleration) {
			score += event.acceleration[property] * event.acceleration[property];
		}
		score = +Math.sqrt(score).toFixed(2);
		if (score > 0.5) {
			team.score += score;
		}

		scoreElement.html(team.score.toFixed(0));
	}

	$(document).on('click', '#start', function() {
		team.name = $('#team-name').val();
		if (team.name === '') {
			return window.alert('Please add a team name!');
		}

		$(this).hide();
		$('#team-name').attr('disabled', true);
		$('#score').show();

		window.addEventListener('devicemotion', handleAccelerometerData);
	});

})(window.jQuery);