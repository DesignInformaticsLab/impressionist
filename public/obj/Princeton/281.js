var scale = 750;
var zheight = -120;
var answer = ['turtle'];

var loadobject = function(obj_string,scene,count,callback){
	var string = obj_string.shift();
	if(typeof string != 'undefined'){
		$.getJSON(string, function( object) {
			var objects = JSONMeshParser(object);
			objects.scale.set(scale, scale, scale);

            objects.rotation.x = 3.14 * 1.0
            objects.rotation.y = 3.14 * 0.0
			objects.rotation.z = -3.14 * 0.2

			objects.position.x = 0
			objects.position.y = 100
			objects.position.z = 600

			objects.name = ""+count;
			objects.allSelectedID = [];
            scene.add(objects);
			scene.FaceArray.push(objects.geometry.faces.length);
			count++;
			loadobject(obj_string,scene,count,callback);
		});
	}
	else{
		callback();
	}
};

THREE.SceneLoad = function (ajax) {
	THREEScene  = new THREE.Scene();
	THREEScene.name = "P281";
	THREEScene.FaceArray = [];

	var objstrings = ['obj/Princeton/m2/281.json',];
	loadobject(objstrings,THREEScene,0,function(){
		if (typeof ajax != 'undefined') ajax();
	});
	THREEScene.position.y = zheight;
	return THREEScene;

	//$.getJSON("obj/TeaPot/data(1).json", function( object) {
	//	parsedFile = object;
	//	objects = JSONMeshParser(object);
	//	objects.scale.set(scale,scale,scale);
	//   objects.name = "1";
	//	THREEScene.add(objects);
	//   objects.allSelectedID = [];
	//   THREEScene.FaceArray.push(objects.geometry.faces.length);


	//} );
}

function JSONMeshParser(object) {
    //var geom = new THREE.Geometry();
    //var v1 = new THREE.Vector3(0,0,0);
    //var v2 = new THREE.Vector3(0,500,0);
    //var v3 = new THREE.Vector3(0,500,500);
    //
    //geom.vertices.push(v1);
    //geom.vertices.push(v2);
    //geom.vertices.push(v3);
    //
    //geom.faces.push( new THREE.Face3( 0, 1, 2 ) );
    //
    //var mesh = new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );
	var geometry = new THREE.Geometry();
//
	//parse vertices
	for (var i = 0; i<object.parsed.vertexArray.length; i++) {
		geometry.vertices.push(new THREE.Vector3(
			object.parsed.vertexArray[i][0],
            object.parsed.vertexArray[i][1],
            object.parsed.vertexArray[i][2]) );
	}

	// parse faces, face normals and vertice normal.
	// vertices are stored in the same 2D array as the vertices
	// but are stored in the face object in THREE.JS
	for (var i = 0; i<object.parsed.faceArray.length; i++) {
        geometry.faces.push(new THREE.Face3(
            object.parsed.faceArray[i][0],
            object.parsed.faceArray[i][1],
            object.parsed.faceArray[i][2]))



        //geometry.faces[i].normal = new THREE.Vector3(
        //	object.geometries[0].data.faces[3][i],
        //	object.geometries[0].data.faces[4][i],
        //	object.geometries[0].data.faces[5][i]);

    }
//
//
//
//
//
//
//    ////
//	//	geometry.faces[i].vertexNormals.push(new THREE.Vector3(
//	//		object.geometries[0].data.vertices[3][geometry.faces[i].a],
//	//		object.geometries[0].data.vertices[4][geometry.faces[i].a],
//	//		object.geometries[0].data.vertices[5][geometry.faces[i].a]) );
//    //
//	//	geometry.faces[i].vertexNormals.push(new THREE.Vector3(
//	//		object.geometries[0].data.vertices[3][geometry.faces[i].b],
//	//		object.geometries[0].data.vertices[4][geometry.faces[i].b],
//	//		object.geometries[0].data.vertices[5][geometry.faces[i].b]) );
//    //
//	//	geometry.faces[i].vertexNormals.push(new THREE.Vector3(
//	//		object.geometries[0].data.vertices[3][geometry.faces[i].c],
//	//		object.geometries[0].data.vertices[4][geometry.faces[i].c],
//	//		object.geometries[0].data.vertices[5][geometry.faces[i].c]) );
//	//}
//    //
//	////diff
//	////if (object.materials[0].type == "MeshPhongMaterial") {
//    //
	var material = new THREE.MeshPhongMaterial({
		color	 	 : new THREE.Color(0x808080 ),
		//ambient 	 : new THREE.Color(0x808080 ),
		//emissive 	 : object.materials[0].emissive,
		//name 		 : object.materials[0].name,
		//shininess 	 : object.materials[0].shininess,
		//specular 	 : new THREE.Color(0x808080 ),
		vertexColors : THREE.FaceColors,
		//envMap       : textureCube,
		side         : THREE.DoubleSide
	});
//	////}
//    //
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
	var mesh = new THREE.Mesh(geometry,material);

//	////mesh.parsed = new THREE.SortMeshObject(geometry);
//    //
	mesh.sorted = SortMeshObjects(geometry);
	geometry.center();

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
	

	
