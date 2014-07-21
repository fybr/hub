var app = angular.module('hub', ["angularMoment", "ngCookies"]);

app.config(['$httpProvider', '$sceDelegateProvider', function($httpProvider, $sceDelegateProvider) {
	
	$httpProvider.defaults.withCredentials = true;

}])

var beep = (function () {
    var ctx = new(window.audioContext || window.webkitAudioContext);
    return function (duration, type, finishedCallback) {

        duration = +duration;

        // Only 0-4 are valid types.
        type = (type % 5) || 0;

        if (typeof finishedCallback != "function") {
            finishedCallback = function () {};
        }

        var osc = ctx.createOscillator();

        osc.type = type;

        osc.connect(ctx.destination);
        osc.noteOn(0);

        setTimeout(function () {
            osc.noteOff(0);
            finishedCallback();
        }, duration);

    };
})();