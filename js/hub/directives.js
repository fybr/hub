app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});

app.directive('scroll', function() {
    return function(scope, element, attrs) {
        var e = element[0];
        scope.$watch(function() {
            return e.scrollHeight;
        }, function(nv, ov) {
            e.scrollTop = e.scrollHeight;
        });
    };
});

app.directive('error', function() {
    return function(scope, element, attrs) {

        if(!attrs.ngSrc)
            element.attr("src", attrs.error);

        element.on("error", function() {
            element.attr("src", attrs.error);
        })
    };
});