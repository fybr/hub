app.factory("api", ["$http", "$cookies", function($http, $cookies) {

	var root = "http://api.fybr.ws/";

	var subs = {};

	var result = {
		session : "",
		login : function(email, password) {
			if(result.session) return;
			var promise = $http.post(root + "users/login", {email : email, password : password});
			promise.success(function(data) {
				$cookies.session = data;
				initialize();
			});
			return promise;
		},
		register : function(email, password) {
			if(result.session) return;
			var promise = $http.post(root + "users", {email : email, password : password});
			promise.success(function(data) {
				$cookies.session = data;
				initialize();
			});
			return promise;
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
		},
		send : function(data) {
			return $http.post(root + "users/devices/push?session=" + result.session, data);
		}
	};



	function initialize() {
		result.session = $cookies.session;
		if(!result.session) return;

		var ws = new ReconnectingWebSocket("ws://api.fybr.ws/hose/" + result.session); 
		ws.onmessage = function(evt) {
			console.log(evt.data);
			var json = (JSON.parse(evt.data));
			_.forEach(subs[json.type], function(cb) {
				cb(json);
			})
		};
		ws.onclose = function(evt) {
		}
	}

	initialize(); 
	return result;

}])