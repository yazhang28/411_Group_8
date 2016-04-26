(function () {
    'use strict';

    // ['ngAnimate', 'ui.bootstrap']
    angular.module('myApp.controllers')
        .controller('DemoCtrl2', ['$scope', '$http', function($scope, $http) {

            $scope.title = "DemoCtrl2";

            // default data when first load app
            $scope.d3Data = [
                {title: "Artist 1", score:15},
                {title: "Artist 2", score:30},
                {title: "Artist 3", score: 45}
            ];

            $scope.currentTab = 0;


            $scope.onClick = function(item) {
                console.log('got here');
                $scope.$apply(function() {
                    if (!$scope.showDetailPanel)
                        $scope.showDetailPanel = true;
                    $scope.detailItem = item;
                });
            };

            $scope.getArtistData = function(i) {

                // tests to see if name is a number, only looking for words
                var name = ($scope.d3Data[i].score).toString();
                var matches = name.match(/\d+/g);
                if (matches != null) {
                    console.log('number detected');
                } else {

                    $http.get('http://localhost:3000/users/db/' + name)
                        .then(function (response) {

                            //based on tab index, display designated data to screen

                            if ($scope.currentTab == 0) {
                                $scope.d3Data[i].score = Math.round(response.data[0].danceability * 100);
                            }

                            if ($scope.currentTab == 1) {
                                $scope.d3Data[i].score = Math.round(response.data[0].energy * 100);
                            }

                            if ($scope.currentTab == 2) {
                                $scope.d3Data[i].score = Math.round(response.data[0].speechiness * 100);
                            }

                            if ($scope.currentTab == 3) {
                                $scope.d3Data[i].score = Math.round(response.data[0].tempo / 5);
                            }

                            if ($scope.currentTab == 4) {
                                $scope.d3Data[i].score = Math.round(response.data[0].popularity / 100000);
                            }

                            if ($scope.currentTab == 5) {
                                var data = response.data[0];

                                var total = data.danceability * 1 + data.energy * 1 + data.speechiness * 1;

                                $scope.d3Data[i].score = Math.round(total * 50);
                            }

                            $scope.d3Data[i].title = name;
                        });
                }
            };

            $scope.getArtist = function(name) {

                // if number is detected don't proceed
                var matches = name.match(/\d+/g);
                if (matches != null) {
                    console.log('number detected');
                } else {
                    $http.get('http://localhost:3000/users/db/' + name)
                        .then(function (response) {
                            $scope.artists = response.data;
                        })
                }
            };


            // returns all artists to front end to see what is in database

            $scope.getAllArtists = function() {
                $http.get('http://localhost:3000/users/db')
                    .then(function(response){
                        $scope.artists = response.data;
                    })
            };



            // detecting tab change

            $scope.tabChanged = function(index) {

                // change index
                $scope.currentTab = index;

                // update artist data for each input unless it is stock name
                if($scope.d3Data[0].title != 'Artist 1') {

                    $scope.d3Data[0].score = $scope.d3Data[0].title;
                    $scope.getArtistData(0);
                }

                if($scope.d3Data[1].title != 'Artist 2') {

                    $scope.d3Data[1].score = $scope.d3Data[1].title;
                    $scope.getArtistData(1);
                }

                if($scope.d3Data[2].title != 'Artist 3') {

                    $scope.d3Data[2].score = $scope.d3Data[2].title;
                    $scope.getArtistData(2);
                }
            };
        }]);
}());