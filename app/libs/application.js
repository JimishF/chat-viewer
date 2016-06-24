
	function makEentity(str){
	   return str.replace( "&",'&amp;').replace( "<",'&lt;').replace(">",'&gt;');
	}

	Array.prototype.cleanup = function(val) {
	  for (var i = 0; i < this.length; i++) {
	    if (this[i] == val) {         
	      this.splice(i, 1);
	      i--;
	    }
	  }
	  return this;
	};



	var jimx ={};

	
	jimx.worngLanding =  true;

	jimx.ChatViewer = angular.module('ChatViewer', ['ngRoute','ngSanitize']);

	 jimx.ChatViewer.config(function($routeProvider) {
        $routeProvider

            .when('/', {
                templateUrl : 'homeindex.html',
                controller  : 'DataController',
                 animation: 'first'
            })	

            .when('/whatsapp', {
                templateUrl : 'whatsapp/index.html',
                controller  : 'WhatsController',
                 animation: 'second',
                caseInsensitiveMatch: true
            })
            .when('/hike', {
                templateUrl : 'hike/index.html',
                controller  : 'HikeController',
                 animation: 'second',
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

	jimx.ChatViewer.controller('DataController', function DataController($scope, $location, sharedProperty) {
	   
	   var vm = this;

	   vm.chatData = [];
	   vm.askWhoAreYou = function(ar){
	   		if ( confirm("If you are '"+ ar[0] + "then click ok.. otherwise cancle.." ) )
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
	
				con[3] = minEmoji( con[3] );

			return con;   	
	   }

   	   vm.parseHikeMatch = function(ar){


	   			ar = makEentity(ar);
			var con = ar.match(/(.*) (.*?\:.*?\:.*?)\:(.*)-(.*)/);
				con.shift();
				// console.log(con);
	
			// 	con[3] = minEmoji( con[3] );

			return con;   	
	   }

	   vm.InitiateWhatsapp = function(){
			 	vm.persons = {
					twoUsers : vm.getPersonsName()
			 	};
				
				vm.persons.myIndex = vm.askWhoAreYou(vm.persons.twoUsers);
				vm.persons.me = vm.persons.twoUsers[ vm.persons.myIndex ];
				vm.persons.other = vm.persons.twoUsers[ + !Boolean(vm.persons.myIndex) ];
				
				$scope.sameValo = vm.persons.other ;
				//remove blank, null and undefined values
				vm.chatData.cleanup("");
				vm.chatData.cleanup(null);
				vm.chatData.cleanup(undefined);
				
				// Generate proper message
				vm.chatData = vm.chatData.map(vm.parseWhatsappMatch);
				
				// Share with all
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

				
				// first line is for intro so skip that one..
				vm.chatData.shift();
				
				//remove blank, null and undefined values
				vm.chatData.cleanup("");
				vm.chatData.cleanup(null);
				vm.chatData.cleanup(undefined);

				// Generate proper message
				vm.chatData = vm.chatData.map(vm.parseHikeMatch);
				
				// Share with all
				sharedProperty.set(vm);

				$location.path("/hike");
				

		};

		$scope.parseDate = function(date){

				
				var parts = date.split("/");
				var date = new Date( parts[1] +"/"+ parts[0]+ "/"+parts[2] );

				var monthNames = [
				  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"
				];

				var day = date.getDate();
				var monthIndex = date.getMonth();
				var year = date.getFullYear();

				return( monthNames[monthIndex]+" "+day+", "+year);
			}
		
	
		$scope.goBack = function(){
			jimx.worngLanding= true;
				$location.path("/");
		}


	});



jimx.ChatViewer.controller('WhatsController',function($scope,$location,sharedProperty){
		
			$scope.NewDateUpdated = "";
			$scope.fetchChatData = function(){

				if ( jimx.worngLanding ){
					$location.path("/");
					return
				}

				$scope.vmCopy = sharedProperty.get();
				$scope.sameValo = $scope.vmCopy.persons.other ;
				// console.dir( $scope.vmCopy.chatData ); 	
			}

			$scope.meFlag = function($index){
					return $scope.vmCopy.chatData[ $index ][2] == $scope.vmCopy.persons.me ? true : false;

			}
			$scope.dateChanged = function($index){

						console.log($scope.vmCopy.chatData[ $index ][0]);
				if ($scope.vmCopy.chatData[ $index ][0] != $scope.NewDateUpdated )
				{
				
						$scope.NewDateUpdated = $scope.vmCopy.chatData[ $index ][0];
						return true;
				}
				return false;
			}


});

jimx.ChatViewer.controller('HikeController',function($scope,$location,sharedProperty){

		$scope.NewDateUpdated = "";
		$scope.fetchChatData = function(){

				if ( jimx.worngLanding ){
					$location.path("/");
					return
				}

				$scope.vmCopy = sharedProperty.get();
				$scope.sameValo = $scope.vmCopy.persons.other ;
				
				// console.log($scope.vmCopy.chatData);
			}

			$scope.meFlag = function($index){
				
					return  $scope.vmCopy.chatData[ $index ][2] == $scope.vmCopy.persons.me ? true : false;
			
			}
			$scope.dateChanged = function($index){

				if ($scope.vmCopy.chatData[ $index ][0] != $scope.NewDateUpdated )
				{
						$scope.NewDateUpdated = $scope.vmCopy.chatData[ $index ][0];
						return true;
				}	
				return false;
			}

});

