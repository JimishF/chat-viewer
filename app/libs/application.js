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
	        	console.log(controller);
	            element.bind("change", function (changeEvent) {
	                var reader = new FileReader();
	                reader.onload = function (loadEvent) {
	                    scope.$apply(function () {
	                        scope.fileread = loadEvent.target.result;
	                        
	                        // console.log(controller);
	                         vm.type = controller.getType(scope.fileread);
		                        if ( vm.type == "w"){
		                        	controller.InitiateWhatsapp();
		                        }else if( type == "h"){
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

	   vm.getType =  function ( filereadtmp ){
			   	
		   	filereadtmp = filereadtmp.split(',');
		   	filereadtmp.shift();
			filereadtmp.join(',');

			 $scope.chatData = (atob(filereadtmp)).split("\n");
			
			if( $scope.chatData[0].charAt(0) == "C" ){
		   		return "h";					
			}   	
		   		return "w";	
	   };

	   vm.getName(firstLine){

	   }

		vm.InitiateWhatsapp = function(){
			
		};
		 vm.InitiateHike = function(){
			console.log("file of Hike !!");
		};




	});
