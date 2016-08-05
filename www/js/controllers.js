angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal

})

.controller('PhotoCtrl', function($scope, $cordovaCamera, $cordovaFile) {
    $scope.images = [];

    $scope.addImage = function() {
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
            onImageSuccess(imageData);

            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                    fileEntry.copyTo(
                        fileSystem2,
                        newName,
                        onCopySuccess,
                        fail
                    );
                }, fail);
            }

            function onCopySuccess(entry) {
                $scope.$apply(function () {
                    $scope.images[0] = entry.nativeURL;
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i=0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

        }, function(err) {
            console.log(err);
        });
    };

    $scope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        return trueOrigin;
    };
})

.service('LoginMdpService', function($q) {
    return {

        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
 
            if (name == 'pseudo' && pw == 'secret') {
                //window.localStorage.setItem("username", username);
                //window.localStorage.setItem("password", password);
                deferred.resolve('Welcome ' + name + '!');
            } else {
                deferred.reject('Wrong credentials.');
            }
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})

.controller('LoginMdpCtrl', function($scope, LoginMdpService, $ionicPopup, $state) {

    $scope.data = {};
    $scope.data.username = "pseudo";
    $scope.data.password = "secret";
 
    $scope.login = function() {
        console.log("LOGIN user: " + $scope.data.username + " - PW: " + $scope.data.password);
        LoginMdpService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
            $state.go('app.map');
        }).error(function(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Identification incorrecte ...',
                template: 'Vérifier vos données !'
            });
        });
    }
})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
    var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var PjislatLng = new google.maps.LatLng(position.coords.latitude + 0.0005, position.coords.longitude + 0.0005);

        var mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

        google.maps.event.addListenerOnce($scope.map, 'idle', function(){
            $scope.marker = new google.maps.Marker({
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                position: latLng,
                icon : "../img/man.png"
            });
        });

        var PjisImage = "../img/pjis.png";
        var PJISmarker = new google.maps.Marker({
            map: $scope.map,
            position: PjislatLng,
            icon : PjisImage
        });
    }, function(error){
        console.log("Could not get location");
        console.log(error);
    });

    $cordovaGeolocation.watchPosition().then(function(position){

        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        $scope.marker = new google.maps.Marker({
            map: $scope.map,
            position: latLng,
            icon : "../img/man.png"
        });
    });
});
