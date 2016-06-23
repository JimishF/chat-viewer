	var jimx ={};

	 jimx.ChatViewer = angular.module('viewerApp', []);

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
	                        scope.fileread = loadEvent.target.result;
	                        
	                         controller.type = controller.getType(scope.fileread);
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

	jimx.ChatViewer.controller('DataController', function DataController($scope) {
	   
	   var vm = this;

	   vm.askWhoAreYou = function(ar){
	   		if ( confirm("Are you "+ ar[0]) )
	   			return 0;
	   		return 1;
	   }
	   vm.getType =  function ( filereadtmp ){
			   	
		   	filereadtmp = filereadtmp.split(',');
		   	filereadtmp.shift();
			filereadtmp.join(',');

			 vm.chatData = (atob(filereadtmp)).split("\n");
				
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

						console.log(firstUser);
	   					console.log(secondUser);

				return [firstUser,secondUser];

	   }

		vm.InitiateWhatsapp = function(){
		 	vm.persons = {
				twoUsers : vm.getPersonsName()
		 	};
				vm.persons.myIndex = vm.askWhoAreYou(vm.persons.twoUsers);
				vm.persons.me = vm.persons.twoUsers[ vm.persons.myIndex ];
				vm.persons.other = vm.persons.twoUsers[ + !Boolean(vm.persons.myIndex) ];

				console.log(vm.persons);
			
		};
		 vm.InitiateHike = function(){
		 	vm.persons = {
				twoUsers : vm.getPersonsName()
		 	};	

		 		vm.persons.myIndex = vm.persons.twoUsers[0] == "me" ? 0 : 1;
				vm.persons.me = vm.persons.twoUsers[ vm.persons.myIndex ]; 
				vm.persons.other = vm.persons.twoUsers[ + ! Boolean(vm.persons.myIndex) ];

				console.log(vm.persons);


		};



		

	});
