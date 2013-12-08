	var myApp = angular.module('myApp', ['ngResource','ngRoute','ngCookies']);
myApp.run(function($rootScope){
    $rootScope.sesion={username:'',islogged:false};
})


	myApp.config(function ($routeProvider, $locationProvider){
		$routeProvider
		.when('/',{templateUrl:'/home.html'})
        .when('/ide',{controller:ideCtrl,templateUrl:'/ide.html'})
		.when('/prgm/:id',{controller:'prgmCtrl',templateUrl:'/codeSpace.html',resolve:{app:PrgmCtrl.load}})
        .when('/login',{controller:loginCtrl,templateUrl:'/login.html'})
        .when('/logged',{controller:userCtrl,templateUrl:'/list.html'})
        .when('/signup',{controller:signupCtrl,templateUrl:'/signup.html'})
        .when('/logout',{controller:logoutCtrl,templateUrl:'/home.html'})
		.otherwise({redirectTo:'/'});
		
		/*$locationProvider.html5Mode(true);*/
				 });

/*
myApp.factory('myHttpResponseInterceptor',['$q','$location',function($q,$location){
  return {
    response: function(response){
      return promise.then(
        function success(response) {
        return response;
      },
      function error(response) {
        if(response.status === 401){
          $location.path('/signin');
          return $q.reject(response);
        }
        else{
          return $q.reject(response); 
        }
      });
    }
  }
}]);
*/
myApp.factory('program', function($resource) {
  return $resource('/list/:id')
});

myApp.factory('compiler',function($resource){
    return $resource('/ide/:state',{state:'@state'})
})


/*myApp.factory('compile',function($resource){
    return $resource('/list/:id/',)
});*/

	/*function listCtrl ($scope,program,sesion,$location)
	{
        if(sesion.islogged==true){
		   $scope.programs=program.query();
		   $scope.option=['date','id'];
		   $scope.orderProp='id';  
        }
        else{
             $location.path('/');
        }
        
	}*/
var PrgmCtrl = myApp.controller('prgmCtrl', function($scope,$rootScope,$routeParams,program,$location)
	{
        console.log("bondy");
        //if($rootScope.sesion.islogged==true){
        $scope.username=$rootScope.sesion.username;
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
       // }
        /*else{
            console.log("bondyyy");
            $location.path('/');
        }*/
	});

    PrgmCtrl.load=function($q){
        var defer=$q.defer();
        defer.resolve();
        console.log("bond");
        return defer.promise;

    }

    function ideCtrl($scope,$routeParams,compiler,$rootScope)
    {
        $scope.compile=function(){
            var state='compile';
            compiler.save({state:state,code:$scope.code},function(resp){
                $scope.out=resp;    
            })
        }
        $scope.run=function(){
            var state='run';
            compiler.save({state:state,code:$scope.code,input:$scope.input},function(resp){
                $scope.out=resp;
            })
        }
    }

    

    function userCtrl($scope,$location,program,$rootScope){
        if($rootScope.sesion.islogged==true){
        $scope.username=$rootScope.sesion.username
         $scope.programs=program.query();
		   $scope.option=['date','id'];
		   $scope.orderProp='id'; 
        }
        else{
            $location.path('/');
        }
    }

    function signupCtrl($scope,$rootScope,$http,$location){
       $scope.signup=function(){
           $http.post('/signup',{username:$scope.username,password:$scope.password})
           .success(function(resp,status,headers,config){
               console.log(resp+status);
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
                console.log(data);
                console.log(status);
                console.log(headers);
                console.log(config);
                $scope.var=data;
                $location.path('/')
            })
            .error(function(data, status, headers, config) { 
               $scope.var=data;
                if(status===401)
                console.log("ffff");
        
            });
        }
    }

    function logoutCtrl($scope,$location,$rootScope){
        $rootScope.sesion.username='';
        $rootScope.sesion.islogged=false;
        $location.path('/');
    }