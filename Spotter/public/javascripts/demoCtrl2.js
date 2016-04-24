(function () {
    'use strict';

    // ['ngAnimate', 'ui.bootstrap']
    angular.module('myApp.controllers')
        .controller('DemoCtrl2', ['$scope', '$http', function($scope, $http){
            $scope.title = "DemoCtrl2";
            $scope.d3Data = [
                {title: "Artist 1", score:12},
                {title: "Artist 2", score:43},
                {title: "Artist 3", score: 87}
            ];

            $scope.test = 0;

            $scope.d3OnClick = function(item){
                alert(item.name);
            };

            $scope.getArtistInfo = function() {
                //$http.get('http://localhost:3000/users/db' + name)
                //    .then(function(response){
                //        //$scope.artists = response.data;
                //    })
                return 5;
            };
        }])


        .controller('TabsDemoCtrl', function ($scope, $window) {
            $scope.tabs = [
                { title:'Dynamic Title 1', content:'Dynamic content 1' },
                { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
            ];

            $scope.alertMe = function() {
                setTimeout(function() {
                    $window.alert('You\'ve selected the alert tab!');
                });
            };

            $scope.model = {
                name: 'Tabs'
            };
        });

}());