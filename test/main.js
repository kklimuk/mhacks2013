(function() {
	'use strict';

	var currentState = 'game';
	var controllers = {
		intro: document.getElementById('intro'),
		game: document.getElementById('game'),
		crash: document.getElementById('crash')
	};

	var team = {
		name: null,
		score: 0,
		tosses: 0
	};

	var onload = function() {
		for (var state in controllers) {
			controllers[state].style.display = 'none';
		}
		controllers[currentState].style.display = 'block';
	};
	document.body.onload = onload;

	var phoneState = {
		state: 'held',
		alpha: 0,
		beta: 0,
		gamma: 0,

		// highestAcceleration: {
		// 	x: 0,
		// 	y: 0,
		// 	z: 0
		// },
		velocity: {
			x: 0,
			y: 0,
			z: 0
		},
		distance: {
			x: 0,
			y: 0,
			z: 0
		}
	};

	var listenToAccelerometer = function(event) {
		// figure out experimentally what the total value is for thrown item
		var accelerations = getAccelerations(event, getAndRecordOrientations(event));
		var distances = getAndRecordDistance(accelerations, getAndRecordVelocity(accelerations, event.interval), event.interval);
		team.score = phoneState.distance.x + phoneState.distance.y + phoneState.distance.z * 0.75;
		document.getElementById('score').innerText = team.score.toFixed(2);
		// switch (phoneState.state) {
		// case 'held':
		// 	listenHeldState(accelerations, event.interval);
		// 	break;
		// case 'throwing':
		// 	listenThrowingState(accelerations, event.interval);
		// 	break;
		// case 'thrown':
		// 	listenThrownState(accelerations, event.interval);
		// 	break;
		// case 'caught':
		// 	listenCaughtState();
		// 	break;
		// case 'crashed':
		// 	listenCrashedState();
		// 	break;
		// default:
		// 	break;
		// }
	};

	var getAndRecordOrientations = function(event) {
		for (var rate in event.rotationRate) {
			phoneState[rate] = (phoneState[rate] + event.rotationRate[rate] * event.interval) % 360;
		}

		return {
			A: phoneState.alpha,
			B: phoneState.beta,
			C: phoneState.gamma
		};
	};

	var getAccelerations = function(event, orientations) {
		var x = event.acceleration.x;
		var y = event.acceleration.y;
		var z = event.acceleration.z;

		var A = orientations.A;
		var B = orientations.B;
		var C = orientations.C;

		window.alert(x.toFixed(4) + '\n' + (x * Math.cos(B) + x * Math.cos(C) + y * Math.sin(C) + z * Math.sin(B)).toFixed(4));

		return {
			x: x * Math.cos(B) + x * Math.cos(C) + y * Math.sin(C) + z * Math.sin(B),
			y: x * Math.sin(C) + y * Math.cos(A) + y * Math.cos(C) + z * Math.sin(A),
			z: x * Math.sin(B) + y * Math.sin(A) + z * Math.cos(A) + z * Math.cos(B)
		};
	};

	var getAndRecordVelocity = function(accelerations, interval) {
		phoneState.velocity = {
			x: phoneState.velocity.x + accelerations.x * interval,
			y: phoneState.velocity.y + accelerations.y * interval,
			z: phoneState.velocity.z + accelerations.z * interval
		};

		return phoneState.velocity;
	};

	var getAndRecordDistance = function(accelerations, velocities, interval) {
		phoneState.distance = {
			x: phoneState.distance.x + Math.abs(velocities.x * interval + 0.5 * accelerations.x * interval * interval),
			y: phoneState.distance.y + Math.abs(velocities.y * interval + 0.5 * accelerations.y * interval * interval),
			z: phoneState.distance.z + Math.abs(velocities.z * interval + 0.5 * accelerations.z * interval * interval)
		};

		return phoneState.distance;
	};

	var heldThreshold = 30;
	var listenHeldState = function(accelerations, interval) {
		if (Math.abs(accelerations.x) + Math.abs(accelerations.y) + Math.abs(accelerations.z) > heldThreshold) {
			phoneState.state = 'throwing';
			phoneState.highestAcceleration = accelerations;
			phoneState.velocity = getVelocity(accelerations, interval);
		}
	};

	var throwingThreshold = 1;
	var listenThrowingState = function(accelerations, interval) {
		phoneState.velocity = getVelocity(accelerations, interval);

		if (Math.abs(accelerations.x) + Math.abs(accelerations.y) + Math.abs(accelerations.z) < throwingThreshold) {
			phoneState.state = 'thrown';
		}
	};

	var listenThrownState = function(accelerations, interval) {
		phoneState.velocity = getVelocity(accelerations, interval);

		// TODO: fix the arbitrary thresholds
		if (Math.abs(accelerations.x) + Math.abs(accelerations.y) + Math.abs(accelerations.z) >
			0.01 * (Math.abs(phoneState.highestAcceleration.x) + Math.abs(phoneState.highestAcceleration.z) + Math.abs(phoneState.highestAcceleration.z))) {
			phoneState.state = 'caught';
			window.alert(Math.abs(accelerations.x) + Math.abs(accelerations.y) + Math.abs(accelerations.z));
		}

		if (phoneState.state === 'crashed' || phoneState.state === 'caught') {
			return;
		}

		phoneState.distance.x += Math.abs(phoneState.velocity.x * interval + 0.5 * accelerations.x * interval * interval);
		phoneState.distance.y += Math.abs(phoneState.velocity.y * interval + 0.5 * accelerations.y * interval * interval);
		phoneState.distance.z += Math.abs(phoneState.velocity.z * interval + 0.5 * accelerations.z * interval * interval);
	};

	var listenCaughtState = function() {

		team.score += phoneState.distance.x + phoneState.distance.y + phoneState.distance.z * 0.75;
		team.tosses += 1;

		document.getElementById('tosses').innerText = team.tosses;
		document.getElementById('score').innerText = team.score.toFixed(0);

		phoneState.highestAcceleration = {
			x: 0,
			y: 0,
			z: 0
		};

		phoneState.velocity = {
			x: 0,
			y: 0,
			z: 0
		};

		phoneState.distance = {
			x: 0,
			y: 0,
			z: 0
		};

		phoneState.state = 'held';
	};

	var listenCrashedState = function() {
		currentState = 'crash';
		onload();
	};

	window.addEventListener('devicemotion', listenToAccelerometer);

	// listening to the button event
	document.getElementById('submit').addEventListener('touchstart', function() {
		team.name = controllers.intro.getElementsByTagName('input')[0].value;
		currentState = 'game';

		// window.addEventListener('devicemotion', listenToAccelerometer);
		onload();
	});

})();