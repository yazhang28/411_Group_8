angular.module('Spotter', ['ngAnimate', 'ui.bootstrap']);
angular.module('Spotter')
    .directive('nameDisplay', function() {
        return {
            scope: true,
            restrict: 'EA',
            template: "<b>This can be anything {{name}}</b>"}
    })
    .controller('spotterCtrl', function($scope, $http){

        $scope.upper = function (){
            $scope.name = $scope.name.toUpperCase();

        };

        $scope.getArtist = function(name) {
            $http.get('http://localhost:3000/users/db/' + name)
                .then(function(response){
                    $scope.artists = response.data;
                })
        };

        $scope.getAllArtists = function() {
            $http.get('http://localhost:3000/users/db')
                .then(function(response){
                    $scope.artists = response.data;
                })
        };

        $scope.createUser = function() {
            var request = {
                method: 'post',
                url: 'http://localhost:3000/api/db',
                data: {
                    name: $scope.name,
                    UID: $scope.UID,
                    department: $scope.department
                }
            };
            $http(request)
                .then(function(response){
                    $scope.getArtist();
                })

        }
    })
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

        $scope.getAllArtists = function() {
            $http.get('http://localhost:3000/users/db')
                .then(function(response){
                    $scope.artists = response.data;
                })
        };
    });