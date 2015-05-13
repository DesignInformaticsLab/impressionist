THREE.SceneLoad = function () {
	THREEScene  = new THREE.Scene();

	var test = false;
	var  scale = 45;

	if (test == false) {
		$.getJSON("obj/iPhone/data (34).json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
			for (var i =0; i<objects.geometry.faces.length; i++)
				objects.geometry.faces[i].color.setHex( 0x303030);


		} );

		$.getJSON("obj/iPhone/data (35).json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);

			for (var i =0; i<objects.geometry.faces.length; i++)
				objects.geometry.faces[i].color.setHex( 0x252525);


		} );

		$.getJSON("obj/iPhone/data (36).json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);

			for (var i =0; i<objects.geometry.faces.length; i++)
				objects.geometry.faces[i].color.setHex( 0x252525);


		} );

		$.getJSON("obj/iPhone/data (37).json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);

			for (var i =0; i<objects.geometry.faces.length; i++)
				objects.geometry.faces[i].color.setHex( 0x252525);


		} );

		$.getJSON("obj/iPhone/data (42).json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);

			for (var i =0; i<objects.geometry.faces.length; i++)
				objects.geometry.faces[i].color.setHex( 0xffffff);


		} );

		$.getJSON("obj/iPhone/screen.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);

			for (var i =0; i<objects.geometry.faces.length; i++)
				objects.geometry.faces[i].color.setHex( 0x050507);


		} );



	} else {
		$.getJSON("obj/iPhone/data (34).json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);

			for (var i =0; i<objects.geometry.faces.length; i++)
				objects.geometry.faces[i].color.setHex( 0x050505);


		} );
	}

	//THREEScene.position.y = -60;
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
	//if (object.materials[0].type == "MeshPhongMaterial") {

		var material = new THREE.MeshPhongMaterial({
    		//ambient	 	 : new THREE.Color(object.materials[0].ambient.toString(16)),
        	//color 		 : new THREE.Color(object.materials[0].color.toString(16)),
        	emissive 	 : new THREE.Color(object.materials[0].emissive.toString(16)),
        	name 		 : object.materials[0].name,
        	shininess 	 : new THREE.Color(object.materials[0].shininess.toString(16)),
        	specular 	 : new THREE.Color(object.materials[0].specular.toString(16)),
        	uuid 		 : object.materials[0].uuid,
        	vertexColors : THREE.FaceColors
		});
	//}

	var mesh = new THREE.Mesh(geometry, material);

	//mesh.parsed = new THREE.SortMeshObject(geometry);

	mesh.sorted = SortMeshObjects(geometry);

	return mesh;
}

function SortMeshObjects(geometry) {
	var faceSorted = [[],[],[],[],[],[]];
	var faceSorted2 = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
	var faceSorted3 = [[],[],[]];

	var sorted = [faceSorted, faceSorted2, faceSorted3];
	console.log(geometry.faces.length);
	for (var j = 0; j < geometry.faces.length; j++) {
		//faceSorted[0][car.children[0].geometry.faces[j].a]= j;
		//cube.faces[i].a;
		sortFaceInformation(geometry.faces[j].a, geometry.faces[j].b, geometry.faces[j].c,j)
		sortFaceInformation2(geometry.faces[j].a, geometry.faces[j].b, geometry.faces[j].c,j)
		sortFaceInformation3(geometry.faces[j].a, geometry.faces[j].b, geometry.faces[j].c,j);

	}

	return sorted;
//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	// sorts the vertex information for sorting algorithm 2 /////////////
	function sortFaceInformation(a,b,c,faceNum) {
		if (faceSorted[0][a] == undefined) {
			faceSorted[0][a]= faceNum;
		} else {
			faceSorted[1][a]= faceNum;
		}

		if (faceSorted[2][b] == undefined) {
			faceSorted[2][b]= faceNum;
		} else {
			faceSorted[3][b]= faceNum;
		}

		if (faceSorted[4][c] == undefined) {
			faceSorted[4][c]= faceNum;
		} else {
			faceSorted[5][c]= faceNum;
		}
	}

	//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	// sorts the vertex information for sorting algorithm 3\\\\\\\\\\\\\\
	function sortFaceInformation2(a,b,c,faceNum) {
		sortRightWay(a, faceNum);
		sortRightWay(b, faceNum);
		sortRightWay(c, faceNum);
	}


	//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
	// does the actual storing for the above function ///////////////////
	// indexed by vertex
	function sortRightWay(vertex, face) {
		if (faceSorted2[0][vertex] == undefined) {
			faceSorted2[0][vertex]= face;

		} else if (faceSorted2[1][vertex] == undefined) {
			faceSorted2[1][vertex]= face;

		} else if (faceSorted2[2][vertex] == undefined) {
			faceSorted2[2][vertex]= face;

		} else if (faceSorted2[3][vertex] == undefined) {
			faceSorted2[3][vertex]= face;

		} else if (faceSorted2[4][vertex] == undefined) {
			faceSorted2[4][vertex]= face;

		} else if (faceSorted2[5][vertex] == undefined) {
			faceSorted2[5][vertex]= face;

		} else if (faceSorted2[6][vertex] == undefined) {
			faceSorted2[6][vertex]= face;

		} else if (faceSorted2[7][vertex] == undefined) {
			faceSorted2[7][vertex]= face;

		} else if (faceSorted2[8][vertex] == undefined) {
			faceSorted2[8][vertex]= face;

		} else if (faceSorted2[9][vertex] == undefined) {
			faceSorted2[9][vertex]= face;

		} else if (faceSorted2[10][vertex] == undefined) {
			faceSorted2[10][vertex]= face;

		} else if (faceSorted2[11][vertex] == undefined) {
			faceSorted2[11][vertex]= face;

		} else if (faceSorted2[12][vertex] == undefined) {
			faceSorted2[12][vertex]= face;

		} else if (faceSorted2[13][vertex] == undefined) {
			faceSorted2[13][vertex]= face;

		} else if (faceSorted2[14][vertex] == undefined) {
			faceSorted2[14][vertex]= face;

		}

	}

	function sortFaceInformation3(a,b,c,faceIndex) {
		faceSorted3[0][faceIndex] = a;
		faceSorted3[1][faceIndex] = b;
		faceSorted3[2][faceIndex] = c;
	}

}
	

	
