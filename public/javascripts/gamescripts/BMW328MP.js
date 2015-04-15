THREE.SceneLoad = function () {
	THREEScene  = new THREE.Scene();
	
	var test = true; 
	
	if (test == true) {
		$.getJSON("obj/BMW 328/chassis.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/exhaust.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/turnIndicators.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
				
		$.getJSON("obj/BMW 328/WindowShieldFrame.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/headlightCenter.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/headlightHousingInner.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/miscHeadlight.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} ); 
		
		$.getJSON("obj/BMW 328/angelEyes.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} ); 
		
		$.getJSON("obj/BMW 328/headlightCover.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			objects.material.opacity  = 0.1;
			objects.material.reflectivity = 0.05;
			THREEScene.add(objects);
			
		} ); 

		$.getJSON("obj/BMW 328/WheelBackground.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/RearLights.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/windowFrame.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/seats.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/windowFrame2.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		$.getJSON("obj/BMW 328/BLTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/BLRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/BLBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/BLVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		

		$.getJSON("obj/BMW 328/BRTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/BRRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/BRBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/BRVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		
		$.getJSON("obj/BMW 328/FLTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/FLRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/FLBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/FLVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
		
		$.getJSON("obj/BMW 328/FRTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/FRRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/FRBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		$.getJSON("obj/BMW 328/FRVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );
		
	} else {
		
		$.getJSON("obj/BMW 328/data (1).json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(80,80,80);
			THREEScene.add(objects);
			
		} );}
	
	THREEScene.position.y = -120;
	return THREEScene;

}

function JSONMeshParser(object) {
 	
	var geometry = new THREE.Geometry();
	
	//parse vertices
	for (var i = 0; i<object.geometries[0].data.vertices[0].length; i++) {
		geometry.vertices.push(new THREE.Vector3(
			object.geometries[0].data.vertices[0][i], 
			object.geometries[0].data.vertices[1][i],
			object.geometries[0].data.vertices[2][i]) );
	}
	
	// parse faces, face normals and vertice normal.
	// vertices are stored in the same 2D array as the vertices
	// but are stored in the face object in THREE.JS
	for (var i = 0; i<object.geometries[0].data.faces[0].length; i++) {
		geometry.faces.push(new THREE.Face3())
		
		geometry.faces[i].a =  object.geometries[0].data.faces[0][i];
		geometry.faces[i].b =  object.geometries[0].data.faces[1][i];
		geometry.faces[i].c =  object.geometries[0].data.faces[2][i];
		
		geometry.faces[i].normal = new THREE.Vector3(
			object.geometries[0].data.faces[3][i],
			object.geometries[0].data.faces[4][i],
			object.geometries[0].data.faces[5][i]);
			
		geometry.faces[i].vertexNormals.push(new THREE.Vector3(
			object.geometries[0].data.vertices[3][geometry.faces[i].a], 
			object.geometries[0].data.vertices[4][geometry.faces[i].a],
			object.geometries[0].data.vertices[5][geometry.faces[i].a]) ); 
			
		geometry.faces[i].vertexNormals.push(new THREE.Vector3(
			object.geometries[0].data.vertices[3][geometry.faces[i].b], 
			object.geometries[0].data.vertices[4][geometry.faces[i].b],
			object.geometries[0].data.vertices[5][geometry.faces[i].b]) ); 
			
		geometry.faces[i].vertexNormals.push(new THREE.Vector3(
			object.geometries[0].data.vertices[3][geometry.faces[i].c], 
			object.geometries[0].data.vertices[4][geometry.faces[i].c],
			object.geometries[0].data.vertices[5][geometry.faces[i].c]) );        		
	}
	
	//diff
	if (object.materials[0].type == "MeshPhongMaterial") {
			
		var material = new THREE.MeshPhongMaterial({
    		ambient	 	 : object.materials[0].ambient,
        	color 		 : new THREE.Color(object.materials[0].color),
        	emissive 	 : object.materials[0].emissive,
        	name 		 : object.materials[0].name,
        	shininess 	 : object.materials[0].shininess,
        	specular 	 : object.materials[0].specular,
        	uuid 		 : object.materials[0].uuid,
        	vertexColors : object.materials[0].vertexColors
		});	
	}
	
	var mesh = new THREE.Mesh(geometry, material);
	
	
	return mesh;
}