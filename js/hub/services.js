app.factory("api", ["$http", "$cookies", function($http, $cookies) {

	var root = "http://api.fybr.ws/";

	var subs = {};

	var result = {
		session : "",
		login : function(email, password) {
			if(result.session) return;
			$http.post(root + "users/login", {email : email, password : password}).success(function(data) {
				$cookies.session = data;
				initialize();
			});
		},
		events : function(type) {
			return $http.get(root + "users/events/" + type + "?session=" + result.session);
		}, 
		on : function(type, callback) {
			var cbs = subs[type];
			if(!cbs) {
				cbs = [];
				subs[type] = cbs;
			}
			cbs.push(callback);
			console.log(subs)
		},
		send : function(data) {
			return $http.post(root + "users/devices/push?session=" + result.session, data);
		}
	};



	function initialize() {
		result.session = $cookies.session;
		if(!result.session) return;
		console.log("Session: " + result.session);

		var ws = new ReconnectingWebSocket("ws://api.fybr.ws/hose"); 
		ws.onmessage = function(evt) {
			var json = (JSON.parse(evt.data));
			_.forEach(subs[json.type], function(cb) {
				cb(json);
			})
		}
	}

	initialize(); 
	return result;

}])