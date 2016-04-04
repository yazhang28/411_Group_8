angular.module('Spotter', [])
    .directive('nameDisplay', function() {
        return {
            scope: true,
            restrict: 'EA',
            template: "<b>This can be anything {{name}}</b>"}
    })
    .controller('spotterCtrl', function($scope, $http){
        $scope.hello = "Hello!";
        $scope.upper = function (){
            $scope.name = $scope.name.toUpperCase();

        };
        $scope.getArtist = function(name) {
            $http.get('http://localhost:3000/users/db/' + name)
                .then(function(response){
                    $scope.users = response.data;
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
    });