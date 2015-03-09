
//Global Variables\\
var container, stats;
var camera, scene, raycaster, renderer;
var vrEffect;
var vrControls;
var mouseControls;
var headControls;

var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster, intersects;

// camera vars
var HEIGHT =300;
var radius = 1500;
theta = 0;
var testVar;

//environment
var directionalLight1, directionalLight2, directionalLight3, directionalLight4, pointLight;
var signGeometry;

var cylinder, cylinderSmall, line;
var faceSorted;
var faceSorted2;
var faceSorted3;

var selected = true;
var numSelected;
var perSelected;

var totalSelectable = 0;

var selectedStrings = [];
var deselectedStrings;

var selectionRadius = 250;

var intersPoint;

var scale = 75;

var selectedVertices;

//End Global Variables\\




init();
animate();

////////////////////////////INITIALIZING\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//////////////////////////////FUNCTION\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// sets up the environment \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );


    var info = document.createElement( 'div' );
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - interactive cubes';
    container.appendChild( info );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );


    scene = new THREE.Scene();
    background = new THREE.Scene();
    background.name = "background";
    car = new THREE.Scene();
    car.name = "car";


    car.castShadow  = true;

    //lighting from Car.html

    camera.position.x = -radius;
    camera.position.y = HEIGHT; //don't change
    camera.position.z = 0;


    var sphere = new THREE.SphereGeometry( 100, 16, 8 );

    var mesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) );
    mesh.scale.set( 0.05, 0.05, 0.05 );


    renderer = new THREE.WebGLRenderer();
    renderer.shadowMapEnabled = true;


    container.appendChild( renderer.domElement );

    createLights();
    createCar(createTextureCube(  ));




    scene.add(background);
    createBackground()


    testVar = [[],[]];
    faceSorted = [[],[],[],[],[],[]];
    faceSorted2 = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    faceSorted3 = [[],[],[]];
    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );

    var fullScreenButton = document.querySelector( '.full-screen' );
    var mouseLookButton = document.querySelector( '.mouse-look' );
    var mouseLook = false;

    vrControls = new THREE.VRControls(camera);
    mouseControls = new THREE.MouseControls(camera);
    headControls = vrControls;

    fullScreenButton.onclick = function() {

        mouseLook = !mouseLook;
        headControls = vrControls;
        vrEffect.setFullScreen( true );
        headControls.zeroSensor();
    };
    mouseLookButton.onclick = function() {

        mouseLook = !mouseLook;

        if (mouseLook) {
            headControls = mouseControls;
            mouseLookButton.classList.add('enabled');
        } else {
            headControls = vrControls;
            mouseLookButton.classList.remove('enabled');
            headControls.zeroSensor();
        }
    }

    vrEffect = new THREE.VREffect(renderer, VREffectLoaded);
    function VREffectLoaded(error) {
        if (error) {
            fullScreenButton.innerHTML = error;
            fullScreenButton.classList.add('error');
        }
    }



    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);
    //

    window.addEventListener( 'resize', onWindowResize, false );



}

////////////////////////////////MAIN\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//////////////////////////////FUNCTION\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// conitnously renders the car and environment\\\\\\\\\\\\\\\\\\\\\\\
function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}
///////////////////////////////END MAIN\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// rotates car and camera position based on input\\\\\\\\\\\\\\\\\\\\
function render() {


    headControls.update();

    car.rotateY(theta);

    camera.position.x = 0;
    camera.position.y = HEIGHT; //don't change
    camera.position.z = radius;



    vrEffect.render( scene, camera );

}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// creates the car geometry and add it to the car scene\\\\\\\\\\\\\\
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    vrEffect.setSize( window.innerWidth, window.innerHeight );

}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// creates the car geometry and add it to the car scene\\\\\\\\\\\\\\
function createCar(textureCube) {
    var camaroMaterials = {

        body: {

            Orange: new THREE.MeshLambertMaterial( {
                color: 0xff6600,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.3,
                vertexColors: THREE.FaceColors
            } ),

            Blue: new THREE.MeshLambertMaterial( {
                color: 0x226699,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.3,
                vertexColors: THREE.FaceColors
            } ),

            Red: new THREE.MeshLambertMaterial( {
                color: 0x660000,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.5,
                vertexColors: THREE.FaceColors
            } ),

            Black: new THREE.MeshLambertMaterial( {
                color: 0x000000,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.5,
                vertexColors: THREE.FaceColors
            } ),

            White: new THREE.MeshLambertMaterial( {
                color: 0xffffff,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.5,
                vertexColors: THREE.FaceColors
            } ),

            Carmine: new THREE.MeshPhongMaterial( {
                color: 0x770000,
                specular: 0xffaaaa,
                envMap: textureCube,
                combine: THREE.MultiplyOperation,
                vertexColors: THREE.FaceColors
            } ),

            Gold: new THREE.MeshPhongMaterial( {
                color: 0xaa9944,
                specular: 0xbbaa99,
                shininess: 50,
                envMap: textureCube,
                combine: THREE.MultiplyOperation,
                vertexColors: THREE.FaceColors
            } ),

            Bronze: new THREE.MeshPhongMaterial( {
                color: 0x150505,
                specular: 0xee6600,
                shininess: 10,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.5,
                vertexColors: THREE.FaceColors
            } ),

            Chrome: new THREE.MeshPhongMaterial( {
                color: 0xffffff,
                specular:0xffffff,
                envMap: textureCube,
                combine: THREE.MultiplyOperation,
                vertexColors: THREE.FaceColors
            } )

        },

        chrome: new THREE.MeshLambertMaterial( {
            color: 0xffffff,
            envMap: textureCube,
            vertexColors: THREE.FaceColors
        } ),

        darkchrome: new THREE.MeshLambertMaterial( {
            color: 0x444444,
            envMap: textureCube,
            vertexColors: THREE.FaceColors
        } ),

        glass: new THREE.MeshBasicMaterial( {
            color: 0x223344,
            envMap: textureCube,
            opacity: 0.25,
            combine: THREE.MixOperation,
            reflectivity: 0.25,
            transparent: true,
            vertexColors: THREE.FaceColors
        } ),

        tire: new THREE.MeshLambertMaterial( {
            color: 0x050505,
            vertexColors: THREE.FaceColors
        } ),

        interior: new THREE.MeshPhongMaterial( {
            //color: 0x050505,
            //shininess: 20,
            color: 0x000000,
            opacity: 0,
            vertexColors: THREE.FaceColors
        } ),

        black: new THREE.MeshLambertMaterial( {
            color: 0x000000,
            vertexColors: THREE.FaceColors
        } )

    };

    var loader = new THREE.BinaryLoader();
    loader.load( "obj/camaro/CamaroNoUv_bin.js",
        function( geometry ) { createScene( geometry, camaroMaterials ) } );

}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// create texture cube  in this case all black\\\\\\\\\\\\\\\\\\\\\\\
function createTextureCube(  ) {

    var r = "textures/fabian/blackCube/";
    var urls = [ r + "posx.jpg", r + "negx.jpg",
        r + "posy.jpg", r + "negy.jpg",
        r + "posz.jpg", r + "negz.jpg" ];

    textureCube = THREE.ImageUtils.loadTextureCube( urls );



    /////////////////////////////////
    textureCube.format = THREE.RGBFormat;

    var shader = THREE.FresnelShader;
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    uniforms[ "tCube" ].value = textureCube;

    var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms };
    var material = new THREE.ShaderMaterial( parameters );


    scene.matrixAutoUpdate = false;

    // Skybox

    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = textureCube;

    var material = new THREE.ShaderMaterial( {

            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            side: THREE.BackSide

        } ),

        mesh = new THREE.Mesh( new THREE.BoxGeometry( 10000, 10000, 10000 ), material );
    mesh.name="backdrop";
    scene.add( mesh );


    var geometry = new THREE.CylinderGeometry( 1, 25, 1, 12 );
    var material = new THREE.MeshBasicMaterial( {
        color: 0x00FF00,
        opacity: 0.25,
        transparent: true
    } )
    cylinder = new THREE.Mesh( geometry, material );
    cylinder.name = "cursor";
    cylinder.position.z = 750;
    cylinder.rotateX(3.1415/2);


    var geometry1 = new THREE.CylinderGeometry( 4, 5, 1, 4 );
    var material1 = new THREE.MeshBasicMaterial( {
        color: 0xff0000,
        opacity: 0.25,
        transparent: true
    } )
    cylinderSmall = new THREE.Mesh( geometry1, material1 );
    cylinderSmall.name = "cursortip";
    cylinderSmall.position.z = 750;
    cylinderSmall.rotateX(3.1415/2);



    var geometryline = new THREE.Geometry( );
    geometryline.vertices.push(
        new THREE.Vector3( 0,0,0),
        new THREE.Vector3( 0, 0, 1000)
    );

    var materialline = new THREE.LineBasicMaterial({
        color: 0x0000ff,
        linewidth: 10
    });
    line = new THREE.Line( geometryline, materialline );
    line.name = "RaycasterLine";




    //scene.add(line);
    scene.add( cylinder );
    scene.add( cylinderSmall );


    ///////////////////////////////
    return textureCube;
}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Picks up movement of the mouse and changes the position of the cursor
function onDocumentMouseMove(event) {


    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


    raycaster.setFromCamera( mouse, camera );

    var intersections = raycaster.intersectObjects( [scene.getObjectByName("car").getObjectByName("camaro"), scene.getObjectByName("backdrop")] );
    intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

    if (intersection != null) {




        var lambda = (cylinder.position.z- intersection.point.z) / (camera.position.z - intersection.point.z);


        testVar[0][0] = lambda;
        var xPos = intersection.point.x + lambda * ( camera.position.x - intersection.point.x);
        var yPos = intersection.point.y + lambda * ( camera.position.y - intersection.point.y);

        cylinder.position.x = xPos;
        cylinder.position.y = yPos;


        cylinderSmall.position.x = xPos;
        cylinderSmall.position.y = yPos;


        //scene.getObjectByName("RaycasterLine").geometry.vertices[0] = camera.position;
        //scene.getObjectByName("RaycasterLine").geometry.vertices[0].x = camera.position.x;
        //scene.getObjectByName("RaycasterLine").geometry.vertices[0].y = camera.position.y+0.001;
        //scene.getObjectByName("RaycasterLine").geometry.vertices[0].z = camera.position.z;
        //scene.getObjectByName("RaycasterLine").geometry.vertices[1] = intersection.point;
        //scene.getObjectByName("RaycasterLine").geometry.verticesNeedUpdate = true;

    }


}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Picks up down click of the mouse and selects the meshes \\\\\\\\\\

function onDocumentMouseDown( event ) {

    event.preventDefault();

    raycaster.setFromCamera( mouse, camera );

    var intersections = raycaster.intersectObjects( car.children );
    intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

    if (intersection != null) {
        intersPoint = [intersection.point.x, intersection.point.y, intersection.point.z];
        car.children[0].geometry.faces[intersection.faceIndex].color.setHex( 0x0000 );
        selectNeighboringFaces3(
            car.children[0].geometry.faces[intersection.faceIndex].a,
            car.children[0].geometry.faces[intersection.faceIndex].b,
            car.children[0].geometry.faces[intersection.faceIndex].c, 1, intersection.faceIndex)
        //selectedVertices = [];
        //selectNeighboringFaces4(intersection.faceIndex);
        car.children[0].geometry.colorsNeedUpdate = true;

        socket.emit('selection', JSON.stringify(selectedStrings));
    }


}


socket.on('selection', function(sig){
    var selections = JSON.parse(sig);
    for (i = 0 ; i < selections.length; i++ ) {
        car.children[0].geometry.faces[selections[i]].color.setHex( 0x000000);
        car.children[0].geometry.faces[selections[i]].selected = true;
    }
    car.children[0].geometry.colorsNeedUpdate = true;
});

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// 4rd iteration of the mesh selection algorithm
function selectNeighboringFaces4(faceIndex) {
    if (selected == true&&scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0){
        car.children[0].geometry.faces[faceIndex].color.setHex( 0x000000);
        car.children[0].geometry.faces[faceIndex].selected = true;
    } else if (scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0)  {
        car.children[0].geometry.faces[faceIndex].color.setHex( 0xffffff);
        car.children[0].geometry.faces[faceIndex].selected = false;
    }

    for (i = 0; i<3; i++) {
        distanceCheck(faceSorted3[i][faceIndex]);
        if (distanceCheck(faceSorted3[i][faceIndex]) == true) {
            j = 0;
            while (faceSorted2[j][faceSorted3[i][faceIndex]]!= undefined) {
                if (selectedVertices[faceSorted3[i][faceIndex]] == undefined) {
                    selectedVertices[faceSorted3[i][faceIndex]] = true;
                    selectNeighboringFaces4(faceSorted2[j][faceSorted3[i][faceIndex]]);
                }
                j++;
            }
        }
    }



}


function distanceCheck(vertexIndex) {
    x = car.children[0].geometry.vertices[vertexIndex].x * scale;
    y = car.children[0].geometry.vertices[vertexIndex].y * scale;
    z = car.children[0].geometry.vertices[vertexIndex].z * scale;


    if (Math.sqrt((x - intersPoint[0])^2 + (y - intersPoint[1])^2 +(z - intersPoint[2])^2 ) < selectionRadius) {
        return true;
    } else if (1==1) {
        return false;
    }
}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// 3rd iteration of the mesh selection algorithm, works in conjunction
// with the second version
function selectNeighboringFaces3(a,b,c,iteration,faceindex) {
    for (i=0; i<13; i++) {
        if (faceSorted2[i][a] != undefined) {
            if (iteration!=0) {

                selectNeigboringFaces2(
                    car.children[0].geometry.faces[faceSorted2[i][a]].a,
                    car.children[0].geometry.faces[faceSorted2[i][a]].b,
                    car.children[0].geometry.faces[faceSorted2[i][a]].c, iteration-1,faceSorted2[i][a]);
            }

        }

        if (faceSorted2[i][b] != undefined) {
            if (iteration!=0) {

                selectNeigboringFaces2(
                    car.children[0].geometry.faces[faceSorted2[i][b]].a,
                    car.children[0].geometry.faces[faceSorted2[i][b]].b,
                    car.children[0].geometry.faces[faceSorted2[i][b]].c, iteration-1,faceSorted2[i][b]);
            }
        }


        if (faceSorted2[i][c] != undefined) {
            if (iteration!=0) {

                selectNeigboringFaces2(
                    car.children[0].geometry.faces[faceSorted2[i][c]].a,
                    car.children[0].geometry.faces[faceSorted2[i][c]].b,
                    car.children[0].geometry.faces[faceSorted2[i][c]].c, iteration-1,faceSorted2[i][c]);
            }
        }


    }

}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// 2nd iteration of the selection algorithm that works with the 3rd
function selectNeigboringFaces2(a, b, c, iteration, faceIndex) {
    if (selected == true&&scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0){
        if (car.children[0].geometry.faces[faceIndex].color.getHex() != 0) {
            selectedStrings[selectedStrings.length] = faceIndex;
        }
        car.children[0].geometry.faces[faceIndex].color.setHex( 0x000000);
        car.children[0].geometry.faces[faceIndex].selected = true;
    } else if (scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0)  {
        if (car.children[0].geometry.faces[faceIndex].color.getHex() != 0) {
            deselectedStrings[deselectedStrings.length] = faceIndex;
        }
        car.children[0].geometry.faces[faceIndex].color.setHex( 0xffffff);
        car.children[0].geometry.faces[faceIndex].selected = false;
    }
    scene.getObjectByName("camaro").material.materials[6].needsUpdate = true;
    //a
    if (faceSorted[0][a] == faceIndex) {

        if (iteration!=0) {
            selectNeigboringFaces2(
                car.children[0].geometry.faces[faceSorted[1][a]].a,
                car.children[0].geometry.faces[faceSorted[1][a]].b,
                car.children[0].geometry.faces[faceSorted[1][a]].c, iteration-1,faceSorted[1][a])
        }
    } else if (faceSorted[1][a] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                car.children[0].geometry.faces[faceSorted[0][a]].a,
                car.children[0].geometry.faces[faceSorted[0][a]].b,
                car.children[0].geometry.faces[faceSorted[0][a]].c, iteration-1,faceSorted[0][a])
        }

    }

    if (faceSorted[2][b] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                car.children[0].geometry.faces[faceSorted[3][b]].a,
                car.children[0].geometry.faces[faceSorted[3][b]].b,
                car.children[0].geometry.faces[faceSorted[3][b]].c, iteration-1,faceSorted[3][b])
        }
    } else if (faceSorted[3][b] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                car.children[0].geometry.faces[faceSorted[2][b]].a,
                car.children[0].geometry.faces[faceSorted[2][b]].b,
                car.children[0].geometry.faces[faceSorted[2][b]].c, iteration-1,faceSorted[2][b])
        }

    }

    if (faceSorted[4][c] == faceIndex) {

        if (iteration!=0) {
            selectNeigboringFaces2(
                car.children[0].geometry.faces[faceSorted[5][c]].a,
                car.children[0].geometry.faces[faceSorted[5][c]].b,
                car.children[0].geometry.faces[faceSorted[5][c]].c, iteration-1,faceSorted[5][c])
        }
    } else if (faceSorted[5][c] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                car.children[0].geometry.faces[faceSorted[4][c]].a,
                car.children[0].geometry.faces[faceSorted[4][c]].b,
                car.children[0].geometry.faces[faceSorted[4][c]].c, iteration-1,faceSorted[4][c])
        }

    }

}




//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Creates the buttons to differentiate between mouse view/VR modes\\
function createButtons( materials, faceMaterial ) {

    var buttons = document.getElementById( "buttons" );

    for ( var key in materials ) {

        var button = document.createElement( 'button' );
        button.textContent = key;
        button.addEventListener( 'click', function ( event ) {

            faceMaterial.materials[ 0 ] = materials[ this.textContent ];

        }, false );
        //buttons.appendChild( button );

    }

}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// renders the car's mesh \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function createScene( geometry, materials ) {

    visibleGeo = geometry;
    m = new THREE.MeshFaceMaterial();

    m.materials[ 0 ] = materials.body[ "Orange" ]; // car body
    m.materials[ 1 ] = materials.chrome; // wheels chrome
    m.materials[ 2 ] = materials.chrome; // grille chrome
    m.materials[ 3 ] = materials.darkchrome; // door lines
    m.materials[ 4 ] = materials.glass; // windshield
    m.materials[ 5 ] = materials.interior; // interior
    m.materials[ 6 ] = materials.tire; // tire
    m.materials[ 7 ] = materials.black; // tireling
    m.materials[ 8 ] = materials.black; // behind grille

    var mesh = new THREE.Mesh( geometry, m );
    mesh.rotation.y = 1;
    mesh.scale.set( scale,scale,scale );
    mesh.castShadow  = true;

    mesh.position.y = 40;

    mesh.name = "camaro";


    car.add( mesh );

    car.castShadow = true;

    scene.add(car);

    // loops through all of the faces and sorts them so no loops are necessary for mesh selection
    for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
        //faceSorted[0][car.children[0].geometry.faces[j].a]= j;
        //cube.faces[i].a;
        sortFaceInformation(car.children[0].geometry.faces[j].a,car.children[0].geometry.faces[j].b,car.children[0].geometry.faces[j].c,j)
        sortFaceInformation2(car.children[0].geometry.faces[j].a,car.children[0].geometry.faces[j].b,car.children[0].geometry.faces[j].c,j)
        sortFaceInformation3(j);
        car.children[0].geometry.faces[j].color.setHex( 0xffffff );
        car.children[0].geometry.faces[j]["selected"] = false;


        if (scene.getObjectByName("camaro").geometry.faces[j].materialIndex == 0)  {
            totalSelectable ++;
        }

    }


    car.children[0].colorsNeedUpdate = true;

    createButtons( materials.body, m );



    //spinning platform for Car
    var geometry = new THREE.CylinderGeometry( 750, 750, 20, 250 );
    var material = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        specular:0x000000,
        //envMap: textureCube,
        combine: THREE.MultiplyOperation
    } )
    var cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.y = -200;
    car.add( cylinder );

}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Handles corresponding tasks if the corresponding key is pressed \\
function handleKeyDown(event) {
    //You can uncomment the next line to find out each key's code
    //alert(event.keyCode);
    scene.remove(background);
    if (event.keyCode == 37) {
        //Left Arrow Key  turn car cw
        theta = -0.01;
    } else if (event.keyCode == 38) {
        //Up Arrow Key  zoom out
        radius += -10;
    } else if (event.keyCode == 39) {
        //Right Arrow Key  turn car ccw
        theta = 0.01;
    } else if (event.keyCode == 40) {
        //Down Arrow Key  Zoom in
        radius += 10;
    } else if (event.keyCode == 90) {
        //z Key zero Sensor
        headControls.zeroSensor();
    } else if (event.keyCode == 68) {
        //d Key deselection mode on cursor
        selected = false;
    } else if (event.keyCode == 83) {
        //s key selection mode on cursor
        selected = true;
    } else if (event.keyCode == 65) {
        //a key select all
        for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
            car.children[0].geometry.faces[j].color.setHex( 0x000000 );
            car.children[0].geometry.faces[j]["selected"] = true;
        }
        car.children[0].geometry.colorsNeedUpdate = true;
    } else if (event.keyCode == 85) {
        //u key unselect all
        for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
            car.children[0].geometry.faces[j].color.setHex( 0xffffff );
            car.children[0].geometry.faces[j]["selected"] = false;
        }
        car.children[0].geometry.colorsNeedUpdate = true;
    } else if (event.keyCode == 67) {
        //c key counts number of faces selected
        numSelected = 0;
        for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
            if (scene.getObjectByName("camaro").geometry.faces[j].materialIndex == 0) {
                if (car.children[0].geometry.faces[j]["selected"] == true) { numSelected++}
            }
        }
        perSelected = numSelected/totalSelectable;
    }

}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Stops spinning/zooming if the corresponding key is lifted \\\\\\\\
function handleKeyUp(event) {
    //You can uncomment the next line to find out each key's code
    //alert(event.keyCode);

    if (event.keyCode == 37) {
        //Left Arrow Key
        theta = 0;
    } else if (event.keyCode == 38) {
        //Up Arrow Key

    } else if (event.keyCode == 39) {
        //Right Arrow Key
        theta = 0;
    } else if (event.keyCode == 40) {
        //Down Arrow Key

    }


}



//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Add components to the background \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function createBackground() {
    background.position.y = -335;
    var signTexture = THREE.ImageUtils.loadTexture("textures/fabian/arrow_keys.png");
    var signMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff , map: signTexture} );

    signTexture.wrapS = signTexture.wrapT = THREE.RepeatWrapping;
    signTexture.repeat.set( 1,1 );




    signGeometry = new THREE.BoxGeometry( 600, 300, 1 );
    var signMesh = new THREE.Mesh( signGeometry, signMaterial );
    signMesh.position.x = 0;
    signMesh.position.y = 1000;
    signMesh.position.z = 0;


    background.add( signMesh );
}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Add components to the background \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function createLights() {


    var ambient = new THREE.AmbientLight( 0x020202 );
    scene.add( ambient );

    directionalLight1 = new THREE.DirectionalLight( 0x808080 );
    directionalLight1.position.set( -1000, 1000, 1000 ).normalize();

    directionalLight2 = new THREE.DirectionalLight( 0x808080 );
    directionalLight2.position.set( -1000, 1000, -1000 ).normalize();

    directionalLight3 = new THREE.DirectionalLight( 0x808080 );
    directionalLight3.position.set( 1000, 1000, -1000 ).normalize();

    directionalLight4 = new THREE.DirectionalLight( 0x808080 );
    directionalLight4.position.set( 1000, 1000, 1000 ).normalize();

    //i removed this light from the environment
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1000, -1000, 1000 ).normalize();

    //scene.add( light );
    scene.add( directionalLight1 );
    scene.add( directionalLight2 );
    scene.add( directionalLight3 );
    scene.add( directionalLight4 );


}


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

function sortFaceInformation3(faceIndex) {
    faceSorted3[0][faceIndex] = car.children[0].geometry.faces[faceIndex].a;
    faceSorted3[1][faceIndex] = car.children[0].geometry.faces[faceIndex].b;
    faceSorted3[2][faceIndex] = car.children[0].geometry.faces[faceIndex].c;
}

