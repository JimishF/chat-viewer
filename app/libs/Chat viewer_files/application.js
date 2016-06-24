	function makEentity(str){
	   return str.replace( "&",'&amp;').replace( "<",'&lt;').replace(">",'&gt;');
	}

	


	var jimx ={};
	
	jimx.worngLanding =  true;

	jimx.ChatViewer = angular.module('ChatViewer', ['ngRoute','ngSanitize']);

	 jimx.ChatViewer.config(function($routeProvider) {
        $routeProvider

            .when('/', {
                templateUrl : 'homeindex.html',
                controller  : 'DataController'
            })	

            .when('/whatsapp', {
                templateUrl : 'whatsapp/index.html',
                controller  : 'WhatsController',
                caseInsensitiveMatch: true
            })
            .when('/hike', {
                templateUrl : 'hike/index.html',
                controller  : 'HikeController',
                caseInsensitiveMatch: true
            })	

        });

	 jimx.ChatViewer.service('sharedProperty', function () {
        var property = [];

        return {
            get: function () {
                return property;
            },
            set: function(value) {
                property = value;
            }
        };
    });


	jimx.ChatViewer .directive("fileread", [function () {
	    return ({
	        controller: "DataController",
		    controllerAs: "vm",
	        scope: {
	            fileread: "="
	        },
	        link: function (scope, element, attributes, controller) {
	        	// console.log(controller);
	            element.bind("change", function (changeEvent) {
	                var reader = new FileReader();
	                reader.onload = function (loadEvent) {
	                    scope.$apply(function () {
	                    	// console.log(scope);
	                		
	                		jimx.worngLanding = false;
	                		    	
	                        scope.fileread = loadEvent.target.result;
	                        
	                         controller.type = controller.getType(scope.fileread,scope);
	                        // console.log(controller);
		                        if ( controller.type == "w"){
		                        	controller.InitiateWhatsapp();
		                        }else if( controller.type == "h"){
		                        	controller.InitiateHike();
		                        }

	                    });
	                }
	                reader.readAsDataURL(changeEvent.target.files[0]);
	            });
	        }
	    })
	}]);

	// Whatsapp.match(/(.*)\,(.*)-(.*)\:(.*)/);
	// Hike.match(/(.*) (.*?\:.*?\:.*?)\:(.*)-(.*)/);

	jimx.ChatViewer.controller('DataController', function DataController($scope, $location,sharedProperty) {
	   
	   var vm = this;
	   vm.chatData = [];
	   vm.askWhoAreYou = function(ar){
	   		if ( confirm("Are you "+ ar[0]) )
	   			return 0;
	   		return 1;
	   }
	   vm.getType =  function ( filereadtmp,scope ){
			   	
		   	filereadtmp = filereadtmp.split(',');
		   	filereadtmp.shift();
			filereadtmp.join(',').toString();
		   

			 vm.chatData = (Base64.decode(filereadtmp[0])).split("\n");
				
				if( vm.chatData[0].charAt(0) == "C" ){
			   		return "h";					
				}   	
		   		return "w";	
		   		
	   };

	   vm.getPersonsName = function(){

	   			var firstUser = "";
	   			var secondUser = "__someone!_jimx_have_no_idea";
	   			var bothFounded = false;

	   			for ( i in vm.chatData)
				{
					var currentMsg = {
						data :  vm.chatData[i],
					};

			   		if( vm.type == "w" )
			   		{
						currentMsg.user =  (currentMsg.data.match(/(.*)\,(.*)-(.*)\:(.*)/)) [3];
	   					if( currentMsg.user != firstUser && firstUser != ""){
		   					secondUser = currentMsg.user;
		   					break;
		   				}else{
		   					firstUser = currentMsg.user;
		   				}
		   			}
		   			else if(vm.type == "h")
		   			{
		   				if(i == 0) continue;
						currentMsg.user =  (currentMsg.data.match(/(.*) (.*?\:.*?\:.*?)\:(.*)-(.*)/)) [3];
	   					if( currentMsg.user != firstUser && firstUser != "" && firstUser != "me"){
	   						secondUser = currentMsg.user;
	   						break;	
	   					}else{
	   						firstUser = currentMsg.user;
	   					}
		   			}

				}

						// console.log(firstUser);
	   					// console.log(secondUser);

				return [firstUser,secondUser];

	   }

	   vm.parseWhatsappMatch = function(ar){
	   			ar = makEentity(ar);
			var con = ar.match(/(.*),(.*)-(.*)\:(.*)/ );
				con.shift();
	
				// con[2] = minEmoji( con[2] );
				con[3] = minEmoji( con[3] );

				console.log(con);
	
			return con;   	
	   }

	   vm.InitiateWhatsapp = function(){
			 	vm.persons = {
					twoUsers : vm.getPersonsName()
			 	};
				
				vm.persons.myIndex = vm.askWhoAreYou(vm.persons.twoUsers);
				vm.persons.me = vm.persons.twoUsers[ vm.persons.myIndex ];
				vm.persons.other = vm.persons.twoUsers[ + !Boolean(vm.persons.myIndex) ];
				vm.chatData = vm.chatData.map(vm.parseWhatsappMatch);
				sharedProperty.set(vm);

				$location.path("/whatsapp");
			
		};
		 vm.InitiateHike = function(){
		 	vm.persons = {
				twoUsers : vm.getPersonsName()
		 	};	

		 		vm.persons.myIndex = vm.persons.twoUsers[0] == "me" ? 0 : 1;
				vm.persons.me = vm.persons.twoUsers[ vm.persons.myIndex ]; 
				vm.persons.other = vm.persons.twoUsers[ + ! Boolean(vm.persons.myIndex) ];
				$location.path("/hike");

				// console.log(vm.persons);

		};


	});



jimx.ChatViewer.controller('WhatsController',function($scope,$location,sharedProperty){
			
		
			$scope.fetchChatData = function(){

				if ( jimx.worngLanding ){
					$location.path("/");
					return
				}

				$scope.vmCopy = sharedProperty.get();
				console.dir( $scope.vmCopy.chatData ); 	
			}

			$scope.meFlag = function($index){
					return $scope.vmCopy.chatData[ $index ][2] == $scope.vmCopy.persons.me ? true : false;

			}
			$scope.dateChanged = function($index){
				return false;
			}

});

jimx.ChatViewer.controller('HikeController',function($scope,$location,sharedProperty){


});

