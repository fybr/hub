app.controller('root', ['$scope', 'api', function($scope, api) {

	$scope.data = {
		sms : []
	};

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

	//api.login("dharun@ly.ht", "lol");
	
}])

app.controller('sms', ['$scope', '$http', function($scope, $http) {

	var api = $scope.api;

	var root = "http://api.fybr.ws/";
	var notif = new Audio("/sounds/hollow.wav");

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