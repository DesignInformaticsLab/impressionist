/**
 * Created by Max Yi Ren on 3/14/2015.
 */
// updated from fabian.js


//Global Variables\\
var container, stats;
var camera, scene, raycaster, renderer, clock;
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
var decision;

var totalSelectable = 0;

var selectedStrings = []; //current selected mesh ID
//var deselectedStrings = [];
var allSelectedID = []; //store all selected mesh ID

var selectionRadius = 250;

var intersPoint;

var scale = 100, zheight = 120;

var selectedVertices;

var selectAllDecision;

var PRESSED = false, SELECT = false;

var VRMODE = false; //VR mode



//End Global Variables\\

////////////////////////////INITIALIZING\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//////////////////////////////FUNCTION\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// sets up the environment \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function init() {
    //container = document.createElement( 'div' );
    //document.body.appendChild( container );
    container = $('#model')[0];

    //var info = document.createElement( 'div' );
    //info.style.position = 'absolute';
    //info.style.top = '10px';
    //info.style.width = '100%';
    //info.style.textAlign = 'center';
    //info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - interactive cubes';
    //container.appendChild( info );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );


    scene = new THREE.Scene();
    clock = new THREE.Clock();
    background = new THREE.Scene();
    background.name = "background";
    car = new THREE.Scene();
    car.name = "car";

    if(GAME.App.myRole=='Player'){
        emptycar = new THREE.Scene();
        emptycar.name = "emptycar";
        emptycar.castShadow  = true;
    }
    else{
        car.castShadow  = true;
    }

    //lighting from Car.html

    camera.position.x = -radius;
    camera.position.y = HEIGHT; //don't change
    camera.position.z = 0;


    //var sphere = new THREE.SphereGeometry( 100, 16, 8 );
    //
    //var mesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) );
    //mesh.scale.set( 0.05, 0.05, 0.05 );

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMapEnabled = true;


    //container.appendChild( renderer.domElement );

    createLights();

    // create the object for both host and player, but only show for host
    createCar(createTextureCube(  ));



    //scene.add(background);
    //createBackground()


    testVar = [[],[]];
    faceSorted = [[],[],[],[],[],[]];
    faceSorted2 = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
    faceSorted3 = [[],[],[]];
    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );

    if (VRMODE){
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
    }




    renderer.setClearColor( 0xf0f0f0 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    container.appendChild( renderer.domElement );

    //stats = new Stats();
    //stats.domElement.style.position = 'absolute';
    //stats.domElement.style.top = '0px';
    //container.appendChild( stats.domElement );

    //document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    //document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    //document.addEventListener( 'mouseup', onDocumentMouseUp, false );
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
    //stats.update();

}
///////////////////////////////END MAIN\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// rotates car and camera position based on input\\\\\\\\\\\\\\\\\\\\
//var toggle = 0;
function render() {
    //toggle += clock.getDelta();
    //if(typeof(car)!='undefined'){
    //    car.children[0].geometry.colorsNeedUpdate = true;
    //}



    //var timer = -0.0002 * Date.now();

    //if (PRESSED == true && toggle > 0.1) {
    //    toggle = 0;
    //    select();
    //}

    if(GAME.App.myRole == 'Host'){
        if(typeof(car)!='undefined'){
            car.rotateY(theta);
        }
    }
    else{
        if(typeof(emptycar)!='undefined'){
            emptycar.rotateY(theta);
        }
    }


    camera.position.x = 0;
    camera.position.y = HEIGHT; //don't change
    camera.position.z = radius;

    if (VRMODE){
        headControls.update();
        vrEffect.render( scene, camera );
    }
    else{
        renderer.render( scene, camera);
        if(typeof(car.children[0])!='undefined'){
            car.children[0].geometry.colorsNeedUpdate = true;
        }
    }

}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// creates the car geometry and add it to the car scene\\\\\\\\\\\\\\
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    if (VRMODE){
        vrEffect.setSize( window.innerWidth, window.innerHeight );
    }
    else{
        renderer.setSize( window.innerWidth, window.innerHeight );
    }


}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// creates the car geometry and add it to the car scene\\\\\\\\\\\\\\
function createCar(textureCube) {
    material_lib = {
        body: {
            Red: new THREE.MeshLambertMaterial( {
                color: 0x660000,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.05,
                vertexColors: THREE.FaceColors
            } ),

            Black: new THREE.MeshLambertMaterial( {
                color: 0x888888,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.5,
                vertexColors: THREE.FaceColors
            } ),

            White: new THREE.MeshLambertMaterial( {
                color: 0xffffff,
                envMap: textureCube,
                combine: THREE.MixOperation,
                reflectivity: 0.05,
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
        function( geometry ) { createScene( geometry, material_lib ) } );

}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// create texture cube  in this case all black\\\\\\\\\\\\\\\\\\\\\\\
function createTextureCube(  ) {

    var r = "textures/bridge/";
    var urls = [ r + "posx.jpg", r + "negx.jpg",
        r + "posy.jpg", r + "negy.jpg",
        r + "posz.jpg", r + "negz.jpg" ];

    textureCube = THREE.ImageUtils.loadTextureCube( urls );
    textureCube.format = THREE.RGBFormat;
    textureCube.mapping = THREE.CubeReflectionMapping;

    //var shader = THREE.FresnelShader;
    //var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    //
    //uniforms[ "tCube" ].value = textureCube;
    //
    //var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms };
    //var material = new THREE.ShaderMaterial( parameters );


    //scene.matrixAutoUpdate = false;

    //// Skybox
    //
    //var shader = THREE.ShaderLib[ "cube" ];
    //shader.uniforms[ "tCube" ].value = textureCube;
    //
    //var material = new THREE.ShaderMaterial( {
    //
    //        fragmentShader: shader.fragmentShader,
    //        vertexShader: shader.vertexShader,
    //        uniforms: shader.uniforms,
    //        side: THREE.BackSide
    //
    //    } ),
    //
    //    mesh = new THREE.Mesh( new THREE.BoxGeometry( 10000, 10000, 10000 ), material );
    //mesh.name="backdrop";
    //scene.add( mesh );


    //var geometry = new THREE.CylinderGeometry( 1, 25, 1, 12 );
    //var material = new THREE.MeshBasicMaterial( {
    //    color: 0x00FF00,
    //    opacity: 0.25,
    //    transparent: true
    //} )
    //cylinder = new THREE.Mesh( geometry, material );
    //cylinder.name = "cursor";
    //cylinder.position.z = 750;
    //cylinder.rotateX(3.1415/2);
    //
    //
    //var geometry1 = new THREE.CylinderGeometry( 4, 5, 1, 4 );
    //var material1 = new THREE.MeshBasicMaterial( {
    //    color: 0xff0000,
    //    opacity: 0.25,
    //    transparent: true
    //} )
    //cylinderSmall = new THREE.Mesh( geometry1, material1 );
    //cylinderSmall.name = "cursortip";
    //cylinderSmall.position.z = 750;
    //cylinderSmall.rotateX(3.1415/2);
    //
    //scene.add( cylinder );
    //scene.add( cylinderSmall );

    ///////////////////////////////
    return textureCube;
}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Picks up movement of the mouse and changes the position of the cursor
//function onDocumentMouseMove(event) {
//
$('#game').mousemove(function(event){

    event.preventDefault();
    //cylinder.position.x =  mouse.x;
    //cylinder.position.y = mouse.y;
    //
    //cylinderSmall.position.x = mouse.x;
    //cylinderSmall.position.y = mouse.y;
    //
    //raycaster.setFromCamera( mouse, camera );
    //var intersections=[];
    //
    //try {
    //    intersections = raycaster.intersectObjects( [scene.getObjectByName("camaro"), scene.getObjectByName("backdrop")] );
    //} catch (e) {
    //    intersections[0] = null ;
    //}
    //
    //intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    //
    //if (intersection != null) {
    //    var lambda = (cylinder.position.z- intersection.point.z) / (camera.position.z - intersection.point.z);
    //
    //
    //    testVar[0][0] = lambda;
    //    var xPos = intersection.point.x + lambda * ( camera.position.x - intersection.point.x);
    //    var yPos = intersection.point.y + lambda * ( camera.position.y - intersection.point.y);
    //}

    var tempx = mouse.x;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (PRESSED == true){
        if (SELECT == true) {
            select();
        }
        else {
            theta = (mouse.x - tempx)*0.5;
        }
    }

    //}
});

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Picks up down click of the mouse and selects the meshes \\\\\\\\\\
//function onDocumentMouseDown( event ) {
$('#game').mousedown(function(event){
    event.preventDefault();
    if (!isJqmGhostClick(event)) {
        PRESSED = true;
        if (PRESSED == true && SELECT == true) {
            select();
        }
    }
});

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Picks up down click of the mouse and selects the meshes \\\\\\\\\\
//function onDocumentMouseUp( event ) {
$('#game').mouseup(function(event) {
    event.preventDefault();
    //if (!isJqmGhostClick(event)) {
    PRESSED = false;
    theta = 0;
    //}
});

function select() {
    raycaster.setFromCamera( mouse, camera );

    var intersections=[];

    try {
        //intersections = raycaster.intersectObjects( [scene.getObjectByName("camaro"), scene.getObjectByName("backdrop")] );
        intersections = raycaster.intersectObjects( [scene.getObjectByName("camaro")] );

    } catch (e) {
        intersections[0] = null ;
    }

    var intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

    if (intersection != null) {
        if(allSelectedID.indexOf(intersection.faceIndex)==-1){//if not selected
            intersPoint = [intersection.point.x, intersection.point.y, intersection.point.z];
            //car.children[0].geometry.faces[intersection.faceIndex].color.setHex( 0x000000 );
            //allSelectedID.push(intersection.faceIndex);
            selectNeighboringFaces3(
                car.children[0].geometry.faces[intersection.faceIndex].a,
                car.children[0].geometry.faces[intersection.faceIndex].b,
                car.children[0].geometry.faces[intersection.faceIndex].c, 1, intersection.faceIndex);
            //selectedVertices = [];
            //selectNeighboringFaces4(intersection.faceIndex);
            //car.children[0].geometry.colorsNeedUpdate = true;

            selectedStrings = diff(selectedStrings, allSelectedID); // only emit new selection
            allSelectedID = allSelectedID.concat(selectedStrings).filter( onlyUnique ); // update all selection
            //if (selected == true) {
            //    selectedStrings[selectedStrings.length] = 1;


            GAME.IO.socket.emit('selection', JSON.stringify(selectedStrings));
            selectedStrings = [];
            //} else if (selected == false) {
            //    deselectedStrings[deselectedStrings.length] = 0;
            //    GAME.IO.socket.emit('selection', JSON.stringify(deselectedStrings));
            //}
        }
    }

}
function onDocumentMouseDownDelete( event ) {
    //event.preventDefault();
    //
    //raycaster.setFromCamera( mouse, camera );
    //
    //var intersections = raycaster.intersectObjects( car.children );
    //intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
    //selectedStrings = [];
    //deselectedStrings = [];
    //if (intersection != null && GAME.App.myRole == 'Host') {
    //    intersPoint = [intersection.point.x, intersection.point.y, intersection.point.z];
    //    car.children[0].geometry.faces[intersection.faceIndex].color.setHex( 0x0000 );
    //    selectNeighboringFaces3(
    //        car.children[0].geometry.faces[intersection.faceIndex].a,
    //        car.children[0].geometry.faces[intersection.faceIndex].b,
    //        car.children[0].geometry.faces[intersection.faceIndex].c, 1, intersection.faceIndex)
    //    //selectedVertices = [];
    //    //selectNeighboringFaces4(intersection.faceIndex);
    //    car.children[0].geometry.colorsNeedUpdate = true;
    //    if (selected == true) {
    //        selectedStrings[selectedStrings.length] = 1;
    //        GAME.IO.socket.emit('selection', JSON.stringify(selectedStrings));
    //    } else if (selected == false) {
    //        deselectedStrings[deselectedStrings.length] = 0;
    //        GAME.IO.socket.emit('selection', JSON.stringify(deselectedStrings));
    //    }
    //
    //}
}

GAME.IO.socket.on('selection', function(sig){
    var selections = JSON.parse(sig);
    if(GAME.App.myRole=='Player') {
        createMesh(selections);
    }
    else if(GAME.App.myRole=='Host'){
        $.each(selections, function(index, s){
            car.children[0].geometry.faces[s].color.setHex( 0x000000);
        });
        car.children[0].geometry.colorsNeedUpdate = true;
    }
});

function createMesh(selection){
    //var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide} );

    $.each(selection, function(i,s){
        if(allSelectedID.indexOf(s)==-1){
            allSelectedID.push(s);

            var geom = new THREE.Geometry();

            var f = car.children[0].geometry.faces[s];
            var v1 = car.children[0].geometry.vertices[f.a];
            var v2 = car.children[0].geometry.vertices[f.b];
            var v3 = car.children[0].geometry.vertices[f.c];

            geom.vertices.push(v1, v2, v3);
            var nf = new THREE.Face3( 0, 1, 2 );
            nf.vertexNormals = f.vertexNormals;
            nf.normal = f.normal;
            geom.faces.push(nf);

            var mesh= new THREE.Mesh( geom, material_lib.body[ "White" ]);
            mesh.rotation.y = 1;
            mesh.scale.set( scale,scale,scale );
            mesh.castShadow  = true;

            mesh.position.y = zheight;
            emptycar.add(mesh);
        }
        else{

        }
    });
}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// 4rd iteration of the mesh selection algorithm
function selectNeighboringFaces4(faceIndex) {
    //if (selected == true&&scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0){
    //    car.children[0].geometry.faces[faceIndex].color.setHex( 0x000000);
    //    car.children[0].geometry.faces[faceIndex].selected = true;
    //} else if (scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0)  {
    //    car.children[0].geometry.faces[faceIndex].color.setHex( 0xffffff);
    //    car.children[0].geometry.faces[faceIndex].selected = false;
    //}
    //
    //for (i = 0; i<3; i++) {
    //    distanceCheck(faceSorted3[i][faceIndex]);
    //    if (distanceCheck(faceSorted3[i][faceIndex]) == true) {
    //        j = 0;
    //        while (faceSorted2[j][faceSorted3[i][faceIndex]]!= undefined) {
    //            if (selectedVertices[faceSorted3[i][faceIndex]] == undefined) {
    //                selectedVertices[faceSorted3[i][faceIndex]] = true;
    //                selectNeighboringFaces4(faceSorted2[j][faceSorted3[i][faceIndex]]);
    //            }
    //            j++;
    //        }
    //    }
    //}
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
function selectNeighboringFaces3(a,b,c,iteration,faceindex, callback) {
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
    if (selected == true &&
        scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0 &&
        allSelectedID.indexOf(faceIndex)==-1 ){
        if (car.children[0].geometry.faces[faceIndex].selected == false) {
            selectedStrings[selectedStrings.length] = faceIndex;
        }
        //car.children[0].geometry.faces[faceIndex].color.setHex( 0x000000);
        car.children[0].geometry.faces[faceIndex].selected = true;
        //car.children[0].geometry.colorsNeedUpdate = true;
        //} else if (scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0)  {
        //    if (car.children[0].geometry.faces[faceIndex].selected == true) {
        //        deselectedStrings[deselectedStrings.length] = faceIndex;
        //    }
        //    car.children[0].geometry.faces[faceIndex].color.setHex( 0xffffff);
        //    car.children[0].geometry.faces[faceIndex].selected = false;
    }
    //scene.getObjectByName("camaro").material.materials[6].needsUpdate = true;

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

    m.materials[ 0 ] = materials.body[ "White" ]; // car body
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

    mesh.position.y = zheight;

    mesh.name = "camaro";


    car.add( mesh );
    car.children[0].geometry.colorsNeedUpdate = true;

    // loops through all of the faces and sorts them so no loops are necessary for mesh selection
    for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
        //faceSorted[0][car.children[0].geometry.faces[j].a]= j;
        //cube.faces[i].a;
        sortFaceInformation(car.children[0].geometry.faces[j].a,car.children[0].geometry.faces[j].b,car.children[0].geometry.faces[j].c,j)
        sortFaceInformation2(car.children[0].geometry.faces[j].a,car.children[0].geometry.faces[j].b,car.children[0].geometry.faces[j].c,j)
        sortFaceInformation3(j);

        //if(GAME.App.myRole=='Host'){
        car.children[0].geometry.faces[j].color.setHex( 0xffffff );
        //}
        //else{
        //    car.children[0].geometry.faces[j].color.setHex( 0x000000 );
        //}

        car.children[0].geometry.faces[j]["selected"] = false;


        //if (scene.getObjectByName("camaro").geometry.faces[j].materialIndex == 0)  {
        //    totalSelectable ++;
        //}

    }

    // if player, hide the geometry
    if(GAME.App.myRole == 'Host'){
        scene.add(car);
        car.castShadow = true;
        car.children[0].colorsNeedUpdate = true;
    }
    else{
        scene.add(emptycar);
    }

    createButtons( materials.body, m );
    ////spinning platform for Car
    //var geometry = new THREE.CylinderGeometry( 750, 750, 20, 250 );
    //var material = new THREE.MeshPhongMaterial( {
    //    color: 0xffffff,
    //    specular:0x000000,
    //    //envMap: textureCube,
    //    combine: THREE.MultiplyOperation
    //} )
    //var cylinder = new THREE.Mesh( geometry, material );
    //cylinder.position.y = -200;
    //car.add( cylinder );

}

function colorFaces() {
    var r, g, b;
    var col;
    for (var i = 0; i < scene.children[3].children[0].geometry.faces.length; i++) {
        col = getRGB(Math.max(
            scene.children[3].children[0].geometry.vertices[faceSorted3[0][i]].y,
            scene.children[3].children[0].geometry.vertices[faceSorted3[1][i]].y,
            scene.children[3].children[0].geometry.vertices[faceSorted3[2][i]].y));
        scene.children[3].children[0].geometry.faces[i].color.r = col[0]/255;
        scene.children[3].children[0].geometry.faces[i].color.g = col[1]/255;
        scene.children[3].children[0].geometry.faces[i].color.b = col[2]/255;
    }

}

function getRGB(val) {
    var min = -2;
    var max = 3;

    if (val>max) {
        val = max;
    } else if (val < min) {
        val = min;
    }

    var half = (max + min)/2 ;
    var col = [0,0,0];

    if (val < half) {
        col[0] = 0;
        col[1]= 255/(half - min) * (val - min);
        col[2] =  255 - 255/(half - min)  * (val - min);
    } else if (half < val) {
        col[0] = 255/(max - half) * (val - half);
        col[1] = 255 + -255/(max - half)  * (val - half);
        col[2] = 0;
    }


    return (col);
}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Handles corresponding tasks if the corresponding key is pressed \\
function handleKeyDown(event) {
    if (event.keyCode == 83){
        SELECT = true;
        $('#select').addClass('active');
    } else if ( event.keyCode == 90) {
        colorFaces();
    }

    //You can uncomment the next line to find out each key's code
    //alert(event.keyCode);
    //scene.remove(background);
    //if (event.keyCode == 37) {
    //    //Left Arrow Key  turn car cw
    //    theta = -0.01;
    //} else if (event.keyCode == 38) {
    //    //Up Arrow Key  zoom out
    //    radius += -10;
    //} else if (event.keyCode == 39) {
    //    //Right Arrow Key  turn car ccw
    //    theta = 0.01;
    //} else if (event.keyCode == 40) {
    //    //Down Arrow Key  Zoom in
    //    radius += 10;
    //} else if (event.keyCode == 90) {
    //    //z Key zero Sensor
    //    if (VRMODE){
    //        headControls.zeroSensor();
    //    }
    //
    //} else if (event.keyCode == 68) {
    //    //d Key deselection mode on cursor
    //    //selected = false;
    //} else if (event.keyCode == 83) {
    //    //s key selection mode on cursor
    //    selected = true;
    //} else if (event.keyCode == 65) {
    //    //a key select all
    //    selectAll(true);
    //    var s = true;
    //    socket2.emit('all', JSON.stringify(s));
    //} else if (event.keyCode == 85) {
    //    //u key unselect all
    //    selectAll(false);
    //    var s = false;
    //    socket2.emit('all', JSON.stringify(s));
    //} else if (event.keyCode == 67) {
    //    //c key counts number of faces selected
    //    numSelected = 0;
    //    for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
    //        if (scene.getObjectByName("camaro").geometry.faces[j].materialIndex == 0) {
    //            if (car.children[0].geometry.faces[j]["selected"] == true) { numSelected++}
    //        }
    //    }
    //    perSelected = numSelected/totalSelectable;
    //}

}


function selectAll(s) {
    //if (s == true) {
    //    for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
    //        car.children[0].geometry.faces[j].color.setHex( 0x000000 );
    //        car.children[0].geometry.faces[j]["selected"] = true;
    //    }
    //} else {
    //    for (var j = 0; j < car.children[0].geometry.faces.length; j++) {
    //        car.children[0].geometry.faces[j].color.setHex( 0xffffff );
    //        car.children[0].geometry.faces[j]["selected"] = false;
    //    }
    //}
    //
    //car.children[0].geometry.colorsNeedUpdate = true;
}


//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Stops spinning/zooming if the corresponding key is lifted \\\\\\\\
function handleKeyUp(event) {
    //You can uncomment the next line to find out each key's code
    //alert(event.keyCode);

    //if (event.keyCode == 37) {
    //    //Left Arrow Key
    //    theta = 0;
    //} else if (event.keyCode == 38) {
    //    //Up Arrow Key
    //
    //} else if (event.keyCode == 39) {
    //    //Right Arrow Key
    //    theta = 0;
    //} else if (event.keyCode == 40) {
    //    //Down Arrow Key
    //
    //}
    if (event.keyCode == 83){
        SELECT = false;
        $('#select').removeClass('active');
    }
}



//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Add components to the background \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function createBackground() {
    //background.position.y = -335;
    //var signTexture = THREE.ImageUtils.loadTexture("textures/fabian/arrow_keys.png");
    //var signMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff , map: signTexture} );
    //
    //signTexture.wrapS = signTexture.wrapT = THREE.RepeatWrapping;
    //signTexture.repeat.set( 1,1 );
    //
    //
    //
    //
    //signGeometry = new THREE.BoxGeometry( 600, 300, 1 );
    //var signMesh = new THREE.Mesh( signGeometry, signMaterial );
    //signMesh.position.x = 0;
    //signMesh.position.y = 1000;
    //signMesh.position.z = 0;
    //
    //
    //background.add( signMesh );
}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Add components to the background \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function createLights() {


    var ambient = new THREE.AmbientLight( 0x020202 );
    scene.add( ambient );

    directionalLight1 = new THREE.DirectionalLight( 0xaaaaaa );
    directionalLight1.position.set( camera.position.z + 50, camera.position.y, -camera.position.x );//.normalize();

    directionalLight2 = new THREE.DirectionalLight( 0xffffff );
    directionalLight2.position.set( 1000, 500,-1000 );//.normalize();
    //directionalLight2.setScale(1000);

    // directionalLight3 = new THREE.DirectionalLight( 0x808080 );
    //directionalLight3.position.set( 1000, 1000, -1000 ).normalize();

    // directionalLight4 = new THREE.DirectionalLight( 0x808080 );
    //directionalLight4.position.set( 1000, 1000, 1000 ).normalize();

    //i removed this light from the environment
    //var light = new THREE.DirectionalLight( 0xffffff, 1 );
    //light.position.set( 1000, -1000, 1000 ).normalize();

    //scene.add( light );
    scene.add( directionalLight1 );
    scene.add( directionalLight2 );
    //scene.add( directionalLight3 );
    //scene.add( directionalLight4 );


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

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function diff(a, b) {
    return a.filter(function(i) {return b.indexOf(i) < 0;});
};

//Object.observe(car.children[0].geometry.faces, function (changes){
//    console.log("Changes:");
//    console.log(changes);
//    debugger;
//})



var lastTapTime;
function isJqmGhostClick(event) {
    var currTapTime = new Date().getTime();
    if(lastTapTime == null || currTapTime > (lastTapTime + 300)) {
        lastTapTime = currTapTime;
        return false;
    }
    else {
        return true;
    }
}