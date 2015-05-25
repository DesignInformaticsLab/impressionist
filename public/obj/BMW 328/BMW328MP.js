var scale = 140;
var zheight = 0;
var answer = ['BMW'];
THREE.SceneLoad = function () {
	THREEScene  = new THREE.Scene();
    THREEScene.name = "BMW 328";
    THREEScene.FaceArray = [];



    var r = "textures/bridge/";
    var urls = [ r + "posx.jpg", r + "negx.jpg",
        r + "posy.jpg", r + "negy.jpg",
        r + "posz.jpg", r + "negz.jpg" ];

    textureCube = THREE.ImageUtils.loadTextureCube( urls );




    THREEScene.name = 'BMW328';


		$.getJSON("obj/BMW 328/chassis.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
            objects.name = ("selectable");
			THREEScene.add(objects);
            objects.name = ("1");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/exhaust.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("2");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/turnIndicators.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("3");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
				
		$.getJSON("obj/BMW 328/WindowShieldFrame.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("4");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/headlightCenter.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("5");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/headlightHousingInner.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("6");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/miscHeadlight.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("7");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} ); 
		
		$.getJSON("obj/BMW 328/angelEyes.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("8");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} ); 
		
		$.getJSON("obj/BMW 328/headlightCover.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			objects.material.opacity  = 0.1;
			objects.material.reflectivity = 0.05;
			THREEScene.add(objects);
            objects.name = ("9");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} ); 

		$.getJSON("obj/BMW 328/WheelBackground.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("10");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/RearLights.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("11");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/windowFrame.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("12");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/seats.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("13");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/windowFrame2.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("14");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		$.getJSON("obj/BMW 328/BLTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("15");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/BLRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("16");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/BLBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("17");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/BLVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("18");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		

		$.getJSON("obj/BMW 328/BRTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("19");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/BRRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("20");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/BRBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("21");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/BRVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("22");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		
		$.getJSON("obj/BMW 328/FLTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("23");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/FLRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("24");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/FLBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("25");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/FLVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("26");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		
		
		$.getJSON("obj/BMW 328/FRTire.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("27");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/FRRim.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("28");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/FRBolts.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("29");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );
		$.getJSON("obj/BMW 328/FRVeneer.json", function( object) {
			parsedFile = object;
			objects = JSONMeshParser(object);
			objects.scale.set(scale,scale,scale);
			THREEScene.add(objects);
            objects.name = ("30");
            objects.allSelectedID = [];
            THREEScene.FaceArray.push(objects.geometry.faces.length);
		} );

	
	THREEScene.position.y = zheight;
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

    for (var i =0; i< geometry.faces.length; i++) {
        geometry.faces[i].selected = false;

    }

	//diff
	if (object.materials[0].type == "MeshPhongMaterial") {
			
		var material = new THREE.MeshPhongMaterial({
    		ambient	 	 : object.materials[0].ambient,
        	color 		 : new THREE.Color(object.materials[0].color),
        	emissive 	 : object.materials[0].emissive,
        	name 		 : object.materials[0].name,
        	//shininess 	 : object.materials[0].shininess,
        	specular 	 : object.materials[0].specular,
        	uuid 		 : object.materials[0].uuid,
        	vertexColors : object.materials[0].vertexColors,
            envMap       : textureCube

		});	
	}

    if (material.name == "Body") {
        material.reflectivity = 0.15;
    }

	var mesh = new THREE.Mesh(geometry, material);


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



