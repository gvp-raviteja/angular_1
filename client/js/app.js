var myApp = angular.module('myApp', ['ngResource','ngRoute','ngCookies','ngSanitize']);
myApp.run(function($rootScope,$http,$location){
    $rootScope.user=null;
    $rootScope.islogged=false;
    $rootScope.logout = function(){
        $rootScope.message = 'Logged out.';
        $http.post('/logout');
        $rootScope.user=null;
        $rootScope.islogged=false;
        $location.path('/');
    };
})


	myApp.config(function ($routeProvider, $locationProvider,$httpProvider){
        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function(user){
                // Authenticated
                if (user !== '0'){
                    $rootScope.user=user.username;
                    $rootScope.islogged=true;
                    $timeout(deferred.resolve, 0);
                }
                // Not Authenticated
                else {
                    $rootScope.message = 'You need to log in.';
                    $rootScope.user=null;
                    $rootScope.islogged=false;
                    $timeout(function(){deferred.reject();}, 0);
                    $location.url('/');
                }
            });
            return deferred.promise;
        };
		$routeProvider
		.when('/',{templateUrl:'/home.html'})
        .when('/user',{templateUrl:'/home.html',resolve:{loggedin:checkLoggedin}})
        .when('/ide',{controller:ideCtrl,templateUrl:'/ide.html'})
		.when('/prgm/:id',{controller:'prgmCtrl',templateUrl:'/codeSpace.html',resolve:{loggedin:checkLoggedin}})
        .when('/login',{controller:loginCtrl,templateUrl:'/login.html'})
        .when('/logged',{controller:userCtrl,templateUrl:'/list.html',resolve:{loggedin:checkLoggedin}})
        .when('/signup',{controller:signupCtrl,templateUrl:'/signup.html'})
		.otherwise({redirectTo:'/'});
		
		/*$locationProvider.html5Mode(true);*/
        /*this interceptor is to  to watch for 401 errors.
        to check whether the user is logged in or not.. if not redirect to login page*/
       /* var interceptor = ['$q', '$location', '$rootScope', function ($q, $location, $rootScope) {
            function success(response) {
                return response;
            }

            function error(response) {
                var status = response.status;
                if (status == 401) {
                    $rootScope.redirect = $location.url(); // save the current url so we can redirect the user back
                    $rootScope.user = {}
                    $location.path('/login');
                }
                return $q.reject(response);
            }

            return function (promise) {
                return promise.then(success, error);
            }
        }];
        $httpProvider.responseInterceptors.push(interceptor);*/
        $httpProvider.responseInterceptors.push(function($q, $location) {
            return function(promise) {
                return promise.then(
                    // Success: just return the response
                    function(response){
                        return response;
                    },
                    // Error: check the error status to get only the 401
                    function(response) {
                        if (response.status === 401)
                            $location.url('/login');
                        return $q.reject(response);
                    }
                );
            }
        });


    });

myApp.factory('program', function($resource) {
  return $resource('/list/:id',{id:'@id'})
});

myApp.factory('compiler',function($resource){
    return $resource('/ide/:state',{state:'@state'})
})

    myApp.filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });


var PrgmCtrl = myApp.controller('prgmCtrl', function($scope,$rootScope,$routeParams,program,$location)
	{
        console.log("bondy");
		var id = $routeParams.id;
		console.log($routeParams.id);
		program.get({id:id},function(resp){
			$scope.prgm=resp;
		});
        $scope.submit=function(){
        program.save({id:id,code:$scope.code},function(resp){
            $scope.result=resp;
        });
        };
	});

    function ideCtrl($scope,$routeParams,compiler,$rootScope) {
        $scope.compile=function(){
            var state='compile';
            compiler.save({state:state,code:$scope.code},function(resp){
                $scope.resp=resp;
            })
        }
        $scope.run=function(){
            var state='run';
            compiler.save({state:state,code:$scope.code,input:$scope.input},function(resp){
                console.log(resp);
                $scope.resp=resp;
                console.log($scope.out);
            })
        }
    }

    

    function userCtrl($scope,$location,program,$rootScope,$http){

        $scope.username=$rootScope.user
         $scope.programs=program.query();
		   $scope.option=['date','id'];
		   $scope.orderProp='id';
    }

    function signupCtrl($scope,$rootScope,$http,$location){
       $scope.signup=function(){
           $http.post('/signup',{username:$scope.username,password:$scope.password})
           .success(function(resp,status,headers,config){
                $location.path('/');
           })
           .error(function(data,status,headers,config){
                console.log(status);
                console.log("failed");
           })
       }
    }

    function loginCtrl($scope,$rootScope,$http,$location){
        $scope.login=function(){
            $http.post('/login',{username:$scope.username,password:$scope.password})
            .success(function(data, status, headers, config) {
                $location.path('/user')
            })
            .error(function(data, status, headers, config) { 
               $scope.var=data;
                if(status===401)
                console.log("ffff");
               $location.path('/login');
        
            });
        }
    }