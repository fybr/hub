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
            console.log('lol');
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


app.directive("animate", [function() {
    return function (scope, element, attr) {

        var apply = function() {
            element.removeClass("animate");
            if(attr.hasOwnProperty("hide"))
                element.addClass("ng-hide");
        }

        element.on("webkitAnimationEnd oanimationend msAnimationEnd animationend", apply);

        element.on("transitionend webkitTransitionEnd", apply)

        scope.$watch(attr.animate, function(nv, ov) {
            if(!nv) return;
            element.addClass("animate");
        })
    }
}]);

app.directive("raw", [function() {
    return function(scope, element, attr) {
        var cancel = scope.$watch(attr.raw, function(nv) {
            element.html(nv);
        })
    }
}])

app.directive("contactPicture", function() {
    return function(scope, element, attr) {
        var cancel = scope.$watch(attr.contactPicture, function(nv) {
            var contact = scope.contacts[nv];
            if(contact == undefined) return;
            element.attr("src", scope.contacts[nv].picture);
            cancel();
        })
    }
});