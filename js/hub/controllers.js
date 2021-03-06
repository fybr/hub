app.controller('root', ['$scope', 'api', function($scope, api) {

	$scope.data = {
		sms : []
	};

	$scope.emoji = emoji;

	$scope.api = api;
	//api.login("dharun@ly.ht", "lol");
	
}])

app.controller('login', ['$scope', function($scope) {

	$scope.credentials = {
		email : "",
		password : ""
	};

	$scope.login = function() {
		$scope.api.login($scope.credentials.email, $scope.credentials.password);
	}

	$scope.register = function() {
		$scope.api.register($scope.credentials.email, $scope.credentials.password);
	}

	//api.login("dharun@ly.ht", "lol");
	
}])


var notif = new Audio("/sounds/hollow.wav");

app.controller("notification", ["$scope", "api", function($scope, api) {
	$scope.notifications = {};

	api.on("notification", function(v) {
		if(v.app == "Hangouts") return;
		$scope.notifications[v.id] = v;
		$scope.$apply();
		notif.play();
	})

	api.on("dismiss", function(v) {
		delete $scope.notifications[v.id];
		$scope.$apply();
	})

	$scope.dismiss = function(model) {
		model.dismiss = true;
		api.send({ id : model.id, type : "dismiss", tag : model.tag, name : model.name  })
	}
}])

app.controller("battery", ["$scope", "api", function($scope, api) {
	api.events("battery").success(function(levels) {
		$scope.level = _.last(levels).level;
	});
	api.on("battery", function(v) {
		$scope.level = v.level;
		$scope.$apply();
	})

}])

app.controller('sms', ['$scope', '$http', function($scope, $http) {

	var api = $scope.api;

	var root = "http://api.fybr.ws/";

	$scope.threads = [];
	$scope.contacts = {};
	$scope.message = { text : "" };

	$scope.send = function() {
		api.send({ message : $scope.message.text, number : $scope.active.id, type : "sms"  })
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


	var initialized = false;
	function parse(data) {
		var model = data;
		var thread = _.find($scope.threads, function(t) {
			return t.id == model.thread; 
		});

		if(!thread) {
			thread = { 
				unread : 0, 
				id : model.thread, 
				messages : [], 
				last : 0,
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

		if(thread.messages.length > 50) {
			thread.messages.shift();
		}

		if(message.from != "me" && initialized) {
			thread.unread++;
			notif.play();
		}

		if(message.from == "me")
			thread.unread = 0;

		var parsed = emoji(model.message);
		message.texts.push(parsed);
		thread.recent = parsed;
		if(message.from == "me")
			thread.recent = "You: " + thread.recent;
		thread.date = (moment(model.created).format("MMM Do"));
		thread.last = model.id;

		if(initialized) {
			message.animate++;
		}

		if($scope.active != undefined && !$scope.$$phase) {
			$scope.$apply();
		}
	}

	api.events("contact").success(function(contacts) {
		_.forEach(contacts, function(value) {
			$scope.contacts[value.number] = value;
			$scope.threads.push({ unread : 0, id : value.number, messages : [], last : -1});
		});

		api.events("sms").success(function(texts) {
			_.forEach(texts, function(value) {
				parse(value);
			})
			initialized = true;
		})

	});
	api.on("sms", parse)

}])