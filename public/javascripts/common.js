
/*
 * ON DOC READY
 */

$(document).ready(function(){
	
	$("#gyroViewer").gyroViewer();
   
});

/*
 * THE PLUGIN
 */

$.fn.gyroViewer = function(options){
	
	var defaults = {
		image : "media/images/chicago.jpg"
	};
	var options = $.extend(defaults,options);
	var viewer	= $(this);
	var data 	= {
		manualControl 	: false,
		longitude 		: 0,
		latitude		: 0,
		savedLongitude 	: 0,
		savedLatitude	: 0,
		savedX			: 0,
		savedY			: 0,
		winWidth		: $(window).width(),
		winHeight		: $(window).height(),
		viewerWidth		: viewer.width(),
		viewerHeight	: viewer.height(),
		resizeListener	: null,
		direction		: 0,
		tiltFB			: 0,
		tiltLR			: 0,
		isIOS			: (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false)
	};
	
	viewer.init = function(){
		
		viewer.build();
		viewer.render();
		viewer.bindEvents();

	};
	
	viewer.build = function(){
		
		//clear viewer
		viewer.html("").css("overflow","hidden");
		
		//create the renderer
		try{
			viewer.renderer = new THREE.WebGLRenderer();
			viewer.renderer.setSize(data.viewerWidth,data.viewerHeight);
			viewer.append(viewer.renderer.domElement);
		}catch(e){
			viewer.debug("WEBGL not supported");
			return false;
		}
		
		//creating a new scene
		viewer.scene = new THREE.Scene();
		
		//adding a camera
		viewer.camera = new THREE.PerspectiveCamera(75,data.viewerWidth/data.viewerHeight,1,1000);
		viewer.camera.target = new THREE.Vector3(0,0,0);
		
		//creation of a big sphere geometry
		viewer.sphere = new THREE.SphereGeometry(100,100,40);
		viewer.sphere.applyMatrix(new THREE.Matrix4().makeScale(-1,1,1));
		
		//creation of the sphere material
		viewer.sphereMaterial = new THREE.MeshBasicMaterial();
		viewer.sphereMaterial.map = THREE.ImageUtils.loadTexture(options.image);
		
		//geometry + material = mesh (actual object)
		viewer.sphereMesh = new THREE.Mesh(viewer.sphere,viewer.sphereMaterial);
		viewer.scene.add(viewer.sphereMesh);
		
	};
	
	viewer.render = function(){
		
		requestAnimationFrame(viewer.render);
		
		if(!data.manualControl && !viewer.shouldUseGyro()){
			data.longitude += 0.1;
		}
	
		//limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
	    data.latitude = Math.max(-85,Math.min(85,data.latitude));
		
		//moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
		viewer.camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - data.latitude)) * Math.cos(THREE.Math.degToRad(data.longitude));
		viewer.camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - data.latitude));
		viewer.camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - data.latitude)) * Math.sin(THREE.Math.degToRad(data.longitude));
		viewer.camera.lookAt(viewer.camera.target);
	
		//calling render function
		viewer.renderer.render(viewer.scene,viewer.camera);
		
	};
	
	viewer.bindEvents = function(){
		
		//on resize
		$(window).on("resize",viewer.resize);
		
		//if using gyro
		if(viewer.shouldUseGyro()){
			
			//on orientation change
			//window.addEventListener("deviceorientation",viewer.onDeviceOrientation);
			viewer.deviceOrientation = false;
			var promise = new FULLTILT.getDeviceOrientation({ 
				"type" : "world"
			});
			promise.then(function(controller){
				viewer.deviceOrientation = controller;
				viewer.deviceOrientation.listen(viewer.onDeviceOrientation);
			}).catch(function(message){
				//viewer.debug(message);
			});
			
		//else using mouse and touches	
		}else{
			
			//on mousedown / touchstart
			if(Modernizr.touch){
				viewer.on("touchstart",viewer.onMouseDown);
			}else{
				viewer.on("mousedown",viewer.onMouseDown);
			}
			
			//on mousemove / touchmove
			if(Modernizr.touch){
				viewer.on("touchmove",viewer.onMouseMove);
			}else{
				viewer.on("mousemove",viewer.onMouseMove);
			}
			
			//on mouseup / touchstop
			if(Modernizr.touch){
				viewer.on("touchstop",viewer.onMouseUp);	
			}else{
				viewer.on("mouseup",viewer.onMouseUp);
			}
			
		}

	};
	
	viewer.onMouseDown = function(e){
		
		e.preventDefault();

		data.manualControl = true;
		
		var x = e.clientX || e.originalEvent.touches[0].clientX;
		var y = e.clientY || e.originalEvent.touches[0].clientY;
		
		data.savedX = x;
		data.savedY = y;
		
		data.savedLongitude = data.longitude;
		data.savedLatitude  = data.latitude;

	};
	
	viewer.onMouseMove = function(e){
		
		if(data.manualControl){
			var x = e.clientX || e.originalEvent.touches[0].clientX;
			var y = e.clientY || e.originalEvent.touches[0].clientY;
			data.longitude = (data.savedX - x) * 0.1 + data.savedLongitude;
			data.latitude  = (y - data.savedY) * 0.1 + data.savedLatitude;
		}
		
	};
	
	viewer.onMouseUp = function(e){
		data.manualControl = false;
	};
	
	viewer.onDeviceOrientation = function(e){
		
		//get the orientation data
		//var q = viewer.deviceOrientation.getScreenAdjustedQuaternion();
      	//var m = viewer.deviceOrientation.getScreenAdjustedMatrix();
      	var e = viewer.deviceOrientation.getScreenAdjustedEuler();
      	data.direction 	= Math.round(e.alpha);
		data.tiltFB 	= Math.round(e.beta);
		data.tiltLR 	= Math.round(e.gamma);
	
		viewer.debug(data.direction+","+data.tiltFB+","+data.tiltLR);
		
		//update longitude
		if(data.tiltFB < 0){
			data.tiltFB = data.tiltFB*-1;
		}
		data.latitude = (data.tiltFB)-(180/2);
		
		var alphaRad 	= e.alpha * (Math.PI / 180);
	 	var betaRad 	= e.beta * (Math.PI / 180);
	  	var gammaRad 	= e.gamma * (Math.PI / 180);
	  	
		//Calculate equation component
		var cA = Math.cos(alphaRad);
		var sA = Math.sin(alphaRad);
		var cB = Math.cos(betaRad);
		var sB = Math.sin(betaRad);
		var cG = Math.cos(gammaRad);
		var sG = Math.sin(gammaRad);
		
		//Calculate A, B, C rotation components
		var rA = - cA * sG - sA * sB * cG;
		var rB = - sA * sG + cA * sB * cG;
		var rC = - cB * cG;
		
		//Calculate compass heading
		var compassHeading = Math.atan(rA / rB);
		
		//Convert from half unit circle to whole unit circle
		if(rB < 0) {
			compassHeading += Math.PI;
		}else if(rA < 0) {
			compassHeading += 2 * Math.PI;
		}
		
		//Convert radians to degrees
		compassHeading *= 180/Math.PI;
		
		//viewer.debug(Math.round(compassHeading));
		
		//update latitude
		data.longitude = compassHeading;

	};
	
	viewer.resize = function(){
		
		clearTimeout(data.resizeListener);
		data.resizeListener = setTimeout(function(){
			viewer.afterResize();
		},500);
		
	};
	
	viewer.afterResize = function(){
		
		data.winWidth 		= $(window).width();
		data.winHeight 		= $(window).height();
		data.viewerWidth 	= viewer.width();
		data.viewerHeight	= viewer.height();
		
		viewer.build();
		
	};
	
	viewer.shouldUseGyro = function(){
		if(viewer.hasOrientation() && Modernizr.touch){
			return true;
		}else{
			return false;
		}
	};
	
	viewer.hasOrientation = function(){
		if(window.DeviceOrientationEvent || window.OrientationEvent || typeof(window.onorientationchange) != "undefined"){
			return true;
		}else{
			return false;
		}
	};
	
	viewer.onImageLoaded = function(src,callback){
		var img = new Image();
		img.onLoad = function(){
			if(typeof(callback) == "function"){
				callback(img);
			}
		};
		img.src = src;
	};
	
	viewer.debug = function(string){
		console.log(string);
	};

	return this.each(function(){
		viewer.init();
	});

};
		