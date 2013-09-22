(function() {
	'use strict';

	var elements = {
		x: document.getElementById('x-axis'),
		y: document.getElementById('y-axis'),
		z: document.getElementById('z-axis'),
		alpha: document.getElementById('alpha'),
		beta: document.getElementById('beta'),
		gamma: document.getElementById('gamma'),
		interval: document.getElementById('interval')
	};

	var maxAccelerations = {
		x: 0,
		y: 0,
		z: 0
	};
	var accelerationProperties = Object.keys(maxAccelerations);

	var maxRotations = {
		alpha: 0,
		beta: 0,
		gamma: 0
	};
	var rotationProperties = Object.keys(maxRotations);

	window.addEventListener('devicemotion', function(event) {
		elements.interval.innerText = event.interval.toFixed(2) + ' s';

		for (var i = 0; i < accelerationProperties.length; i++) {
			var acceleration = accelerationProperties[i];
			if (maxAccelerations[acceleration] < Math.abs(event.acceleration[acceleration])) {
				maxAccelerations[acceleration] = Math.abs(event.acceleration[acceleration]);
				elements[acceleration].innerText = event.acceleration[acceleration] + ' m/s^2';
			}
		}

		for (i = 0; i < rotationProperties.length; i++) {
			var rotation = rotationProperties[i];
			if (maxRotations[rotation] < Math.abs(event.rotationRate[rotation])) {
				maxRotations[rotation] = Math.abs(event.rotationRate[rotation]);
				elements[rotation].innerText = event.rotationRate[rotation] + ' deg/s';
			}
		}
	});
})();
