app.controller('root', ['$scope', '$http', function($scope, $http) {

	$scope.data = {
		sms : []
	};


	
}])

app.controller('sms', ['$scope', '$http', function($scope, $http) {

	var root = "http://api.fybr.ws/";

	var session = "2d044ab4-c422-4827-8baa-6998cdd7a22d";
	var notif = new Audio("/sounds/hollow.wav");

	$scope.threads = [];

	$scope.contacts = {};

	$scope.message = { text : "" };

	$scope.send = function() {
		$http.post(root + "users/devices/push?session=" + session, { message : $scope.message.text, number : $scope.active.id, type : "sms"  })
		$scope.message.text = "";
		$scope.active.unread = 0;
	}

	$scope.activate = function(thread) {
		if($scope.active)
			$scope.active.priority = 0;
		$scope.active = thread;
		$scope.active.priority = 1000;
		thread.unread = 0;
	}

	$scope.getLast = function(thread) {
		if(thread.messages.length == 0)
			return "";
		var message = _.last(thread.messages);
		if(message.texts.length == 0)
			return "";
		var text = _.last(message.texts);
		if(message.from == "me")
			text = "You: " + text;
		return text;
	}

	var ws = new ReconnectingWebSocket("ws://api.fybr.ws/hose"); 
	ws.onmessage = function(evt) {
		parse(JSON.parse(evt.data));
	}

	var initialized = false;
	function parse(data) {
		if(data.type != "sms") return;
		var model = data;
		var thread = _.find($scope.threads, function(t) {
			return t.id == model.thread; 
		});

		if(!thread) {
			thread = { 
				unread : 0, 
				id : model.thread, 
				messages : [], 
				priority : 0,
			};
			$scope.threads.push(thread);
		}

		if(!initialized)
			$scope.active = thread;

		var message = _.last(thread.messages);
		if(!message || message.from != model.from) {
			message = {
				from : model.from,
				created : new Date(),
				texts : [],
				animate : 0,
			}
			thread.messages.push(message);
		}

		if(message.from != "me" && initialized) {
			thread.unread++;
			notif.play();
		}

		message.texts.push(model.message);
		thread.date = (moment(model.created).format("MMM Do"));
		thread.modified = model.created;

		if(initialized) {
			message.animate++;
		}

		if($scope.active != undefined && !$scope.$$phase) {
			$scope.$apply();
		}
	}

	$http.get(root + "users/events/contact?session=" + session).then(function(ev) {
		_.forEach(ev.data, function(value) {
			$scope.contacts[value.number] = value;
		});


		$http.get(root + "users/events/sms?session=" + session).then(function(ev) {
			_.forEach(_.sortBy(ev.data, function(value) {
				return value.created;
			}), function(value) {
				parse(value);
			})
			initialized = true;
			//$scope.active = $scope.threads[0];
		})
	})

}])