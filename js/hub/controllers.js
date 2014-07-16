app.controller('root', ['$scope', '$http', function($scope, $http) {

	$scope.data = {
		sms : []
	};


	
}])

app.controller('sms', ['$scope', '$http', function($scope, $http) {

	$scope.threads = [];

	$scope.contacts = {
		"6091234433" : {
			name : "John Smith",
			number : "6091234433",
			picture : "https://gp6.googleusercontent.com/-Pfva3RUlmi8/AAAAAAAAAAI/AAAAAAAAAAA/JE_HdaH7yJI/s48-c-k-no/photo.jpg",
		},
		"6096470301" : {
			name : "Pia Sawhney",
			number : "6096470301",
			picture : "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/t1.0-1/c0.58.160.160/p160x160/10431465_10152470222673944_1017186097111233592_n.jpg",
		},
		"7184046450" : {
			name : "Sapna Balal",
			number : "7184046450",
			picture : "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpa1/t1.0-1/c3.0.160.160/p160x160/10250115_10202064885568453_8765870365386025656_n.jpg",
		},
		"6093793425" : {
			name : "Kanye West",
			number : "6093793425",
			picture : "http://www.thestyleking.com/wp-content/uploads/2011/04/Kanye-west-1.1.jpg",
		},
		"me" : {
			name : "Dharun Ravi",
			number : "6094801889",
			picture : "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xap1/t1.0-1/c0.2.160.160/p160x160/10001536_10201746463406954_1662045091_n.jpg"
		},
		"6095788205" : {
			name : "Julia Fang",
			number : "6095788205"
		},
		"7325225803" : {
			name : "Ravi Pazhani",
			number : "7325225803",
		}
	}

	$scope.active = $scope.threads[0];
	$scope.message = { text : "" };

	$scope.send = function() {
		$http.post("http://fybr.jarvis.systems/push", { message : $scope.message.text, number : $scope.active.id, type : "sms"  })
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

	var ws = new ReconnectingWebSocket("ws://fybr.jarvis.systems/hose"); 
	ws.onmessage = function(evt) {
		parse(JSON.parse(evt.data));
	}

	var initialized = false;
	function parse(data) {
		var model = data;
		var thread = _.find($scope.threads, function(t) {
			return t.id == model.thread; 
		})

		if(!thread) {
			thread = { unread : 0, id : model.thread, messages : [], priority : 0 };
			$scope.threads.push(thread);
		}

		var message = _.last(thread.messages);
		if(!message || message.from != model.from) {
			message = {
				from : model.from,
				created : new Date(),
				texts : []
			}
			thread.messages.push(message);
		}
		if(message.from != "me" && initialized) {
			thread.unread++;
		}
		message.texts.push(model.message);

		if($scope.active != undefined && !$scope.$$phase) {
			console.log("Applying...");
			$scope.$apply();
		}
	}

	$http.get("http://fybr.jarvis.systems/users/whatever/devices/whatever/events/sms").then(function(ev) {
		_.forEach(ev.data, function(value) {
			parse(value);
		})
		initialized = true;
		$scope.active = $scope.threads[0];
	})

}])