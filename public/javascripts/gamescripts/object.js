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

var object;

var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster, intersects;

// camera vars
var HEIGHT =300;
var radius = 1500;
var theta = 0;
var beta = 0;
var testVar;

//environment
var directionalLight1, directionalLight2, directionalLight3, directionalLight4, pointLight;
var signGeometry;

var cylinder, cylinderSmall, line;



var selected = true;
var numSelected;
var perSelected;
var decision;

var totalSelectable = 0;

var selectedStrings = []; //current selected mesh ID
//var deselectedStrings = [];
var allSelectedID = []; //store all selected mesh ID
var allSelectedIDMaster = [];

var selectionRadius = 250;

var intersPoint;

var selectedVertices;

var selectAllDecision;

var PRESSED = false, SELECT = false;

var VRMODE = false; //VR mode

var progressbar_size = $('#select').css('opacity')/1;
//var progressbar_size = progressbar_size_string.substr(0, progressbar_size_string.length-2)/1;

//End Global Variables\\

////////////////////////////INITIALIZING\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//////////////////////////////FUNCTION\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// sets up the environment \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function init() {
    container = $('#model')[0];
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );

    scene = new THREE.Scene();
    clock = new THREE.Clock();
    background = new THREE.Scene();
    background.name = "background";

    object = new THREE.SceneLoad;
    object.name = GAME.App.correct_answer[0]; // use the first answer as the object name

    if(GAME.App.myRole=='Player'){
        emptyobject = new THREE.Scene();
        emptyobject.name = "emptyobject";
        emptyobject.castShadow  = true;
    }
    else{
        object.castShadow  = true;
    }


    if(GAME.App.myRole == 'Host'){
        scene.add(object);
        object.castShadow = true;
    }
    else{
        scene.add(emptyobject);
    }

    //scene.add(object);

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
    //createCar(createTextureCube(  ));



    //scene.add(background);
    //createBackground()


    testVar = [[],[]];

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

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
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

    // *** should move camera, not the object ***
    if(GAME.App.myRole == 'Host'){
        if(typeof(object)!='undefined'){

            object.rotation.set( Math.max(-Math.PI/6,Math.min(object.rotation.x - beta, Math.PI/6)),
                object.rotation.y + theta, 0, 'XYZ' );
        }
    }
    else{
        if(typeof(emptyobject)!='undefined'){
            emptyobject.rotation.set( Math.max(-Math.PI/6,Math.min(emptyobject.rotation.x - beta, Math.PI/6)),
                emptyobject.rotation.y + theta, 0, 'XYZ' );
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
        if(typeof(object.getObjectByName("selectable"))!='undefined'){
            object.getObjectByName("selectable").geometry.colorsNeedUpdate = true;
        }
    }

    // countdown when object is shown
    $('#timebar').css('opacity',1-(Date.now()-GAME.App.currentTime)/GAME.App.totalTime/60000);
    if (1-(Date.now()-GAME.App.currentTime)/GAME.App.totalTime/60000<=0){
        GAME.IO.gameOver();
    }
}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// creates the object and add it to the scene\\\\\\\\\\\\\\
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

/*
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

*/

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
function onDocumentMouseMove(event) {
//
//$('#model').mousemove(function(event){

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
    var tempy = mouse.y;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    if (PRESSED == true){
        if (SELECT == true) {
            select();
        }
        else {
            theta = (mouse.x - tempx)*4.0;
            beta = (mouse.y-tempy)*2.0;
        }
    }

    }
//});

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Picks up down click of the mouse and selects the meshes \\\\\\\\\\
function onDocumentMouseDown( event ) {
//$('#model').mousedown(function(event){
    event.preventDefault();
    if (!isJqmGhostClick(event)) {
        PRESSED = true;
        if (PRESSED == true && SELECT == true) {
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
            select();

        }
    }
}
//});

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// Picks up down click of the mouse and selects the meshes \\\\\\\\\\
function onDocumentMouseUp( event ) {
//$('#model').mouseup(function(event) {
    event.preventDefault();
    //if (!isJqmGhostClick(event)) {
    PRESSED = false;
    theta = 0;
    beta = 0;
}
//});

function select() {
    if (GAME.App.selection_capacity>0){ // if still can select
        raycaster.setFromCamera( mouse, camera );
        selectedStrings = [];
        var intersections=[];

        try {
            intersections = raycaster.intersectObjects( scene.children[0].children);
            console.log(intersections[0].object.name);

        } catch (e) {
            intersections[0] = null ;
        }


        var intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

        if (intersection != null) {
            if(object.getObjectByName(intersection.object.name).allSelectedID.indexOf(intersection.faceIndex)==-1){//if not selected
                intersPoint = [intersection.point.x, intersection.point.y, intersection.point.z];
                selectNeighboringFaces3(
                    scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].a,
                    scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].b,
                    scene.children[0].getObjectByName(intersection.object.name).geometry.faces[intersection.faceIndex].c, 1, intersection.faceIndex,intersection.object.name);
                //selectedVertices = [];
                //selectNeighboringFaces4(intersection.faceIndex);
                //car.getObjectByName("selectable").geometry.colorsNeedUpdate = true;
                console.log(intersection.object.name);

                selectedStrings = diff(selectedStrings, object.getObjectByName(intersection.object.name).allSelectedID); // only emit new selection

                object.getObjectByName(intersection.object.name).allSelectedID = object.getObjectByName(intersection.object.name).allSelectedID.concat(selectedStrings).filter( onlyUnique ); // update all selection
                var uniqueValues = selectedStrings.filter(onlyUnique);

                //selectedStrings= uniqueValues;
                //if (selected == true) {
                //    selectedStrings[selectedStrings.length] = 1;

                // update selection capacity
                var index = -1;
                for (var i = 0 ; i< scene.children[0].children.length; i++) {
                    if (object.children[i].name == intersection.object.name) {
                        index = i;
                        break;
                    }

                    for (var j = 0; j < uniqueValues.length; j++)
                        uniqueValues[j] = uniqueValues[j] + object.FaceArray[i];

                }
                console.log('unique values:');
                console.log(uniqueValues);

                allSelectedIDMaster.push(uniqueValues);



                selectedStrings.unshift(index);
                GAME.App.selection_capacity = GAME.App.selection_capacity - selectedStrings.length + 1;
                $('#bar').css('opacity', GAME.App.selection_capacity/1000*progressbar_size);
                GAME.IO.socket.emit('selection',JSON.stringify(selectedStrings));
                //    GAME.IO.socket.emit('selection', JSON.stringify(deselectedStrings));
                //}
            }
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
    //    car.getObjectByName("selectable").geometry.faces[intersection.faceIndex].color.setHex( 0x0000 );
    //    selectNeighboringFaces3(
    //        car.getObjectByName("selectable").geometry.faces[intersection.faceIndex].a,
    //        car.getObjectByName("selectable").geometry.faces[intersection.faceIndex].b,
    //        car.getObjectByName("selectable").geometry.faces[intersection.faceIndex].c, 1, intersection.faceIndex)
    //    //selectedVertices = [];
    //    //selectNeighboringFaces4(intersection.faceIndex);
    //    car.getObjectByName("selectable").geometry.colorsNeedUpdate = true;
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
    console.log('obj ln 602');
    console.log(selections);
    var childnumber = selections.shift();
    if(GAME.App.myRole=='Player') {
        // create meshes on fly
        createMesh(selections, childnumber);

        // update selection capacity
        GAME.App.selection_capacity = GAME.App.selection_capacity - selections.length;
        $('#bar').css('opacity', GAME.App.selection_capacity/1000*progressbar_size);
        $('#bar').css('background-color', '#333333');
        //setInterval(function () {
        //    $('#bar').css('background-color', '#f5f5ff');
        //},1000);
    }
    else if(GAME.App.myRole=='Host'){
        for (var i = 0; i< selections.length; i++)
            object.children[childnumber].geometry.faces[selections[i]].color = 0x111111;


        /*$.each(selections, function(s){
            //car.getObjectByName("selectable").geometry.faces[s].color.setHex( 0x000000);
            object.children[childnumber].geometry.faces[s].color.r = 0.0;
            object.children[childnumber].geometry.faces[s].color.g = 0.6;
            object.children[childnumber].geometry.faces[s].color.b = 0.6;

        });*/
        scene.children[0].children[childnumber].geometry.colorsNeedUpdate = true;
    }
});

function createMesh(selection, childnumber ){
    //var material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide} );

    $.each(selection, function(i,s){
        if(allSelectedID.indexOf(s)==-1){
            allSelectedID.push(s);

            var geom = new THREE.Geometry();

            var f =  object.children[childnumber].geometry.faces[s];
            var v1 = object.children[childnumber].geometry.vertices[f.a];
            var v2 = object.children[childnumber].geometry.vertices[f.b];
            var v3 = object.children[childnumber].geometry.vertices[f.c];

            geom.vertices.push(v1, v2, v3);
            var nf = new THREE.Face3( 0, 1, 2 );
            nf.vertexNormals = f.vertexNormals;
            nf.normal = f.normal;
            geom.faces.push(nf);

            var mesh= new THREE.Mesh( geom, object.children[childnumber].material);
            mesh.rotation.y = 1;
            mesh.scale.set( scale,scale,scale );
            mesh.castShadow  = true;

            mesh.position.y = zheight;
            emptyobject.add(mesh);
        }
        else{

        }
    });
}



//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// 3rd iteration of the mesh selection algorithm, works in conjunction
// with the second version
function selectNeighboringFaces3(a,b,c,iteration,faceindex, name) {
    for (i=0; i<13; i++) {
        if (object.getObjectByName(name).sorted[1][i][a] != undefined) {
            if (iteration!=0) {

                selectNeigboringFaces2(
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][a]].a,
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][a]].b,
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][a]].c,
                    iteration-1,object.getObjectByName(name).sorted[1][i][a], name);
            }

        }

        if (object.getObjectByName(name).sorted[1][i][b] != undefined) {
            if (iteration!=0) {

                selectNeigboringFaces2(
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][b]].a,
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][b]].b,
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][b]].c,
                    iteration-1,object.getObjectByName(name).sorted[1][i][b], name);
            }
        }


        if (object.getObjectByName(name).sorted[1][i][c] != undefined) {
            if (iteration!=0) {

                selectNeigboringFaces2(
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][c]].a,
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][c]].b,
                    object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[1][i][c]].c,
                    iteration-1,object.getObjectByName(name).sorted[1][i][c], name);
            }
        }
    }
}

//////////////////////////////function\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// 2nd iteration of the selection algorithm that works with the 3rd
function selectNeigboringFaces2(a, b, c, iteration, faceIndex, name) {
    if (selected == true &&
        allSelectedID.indexOf(faceIndex)==-1 ){
        //if (car.getObjectByName("selectable").geometry.faces[faceIndex].selected == false) {
            selectedStrings[selectedStrings.length] = faceIndex;
        //}
        //car.getObjectByName("selectable").geometry.faces[faceIndex].color.setHex( 0x000000);
        //car.getObjectByName("selectable").geometry.faces[faceIndex].selected = true;
        //car.getObjectByName("selectable").geometry.colorsNeedUpdate = true;
        //} else if (scene.getObjectByName("camaro").geometry.faces[faceIndex].materialIndex == 0)  {
        //    if (car.getObjectByName("selectable").geometry.faces[faceIndex].selected == true) {
        //        deselectedStrings[deselectedStrings.length] = faceIndex;
        //    }
        //    car.getObjectByName("selectable").geometry.faces[faceIndex].color.setHex( 0xffffff);
        //    car.getObjectByName("selectable").geometry.faces[faceIndex].selected = false;
    }
    //scene.getObjectByName("camaro").material.materials[6].needsUpdate = true;

    if (object.getObjectByName(name).sorted[0][0][a] == faceIndex) {

        if (iteration!=0) {
            selectNeigboringFaces2(
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][1][a]].a,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][1][a]].b,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][1][a]].c, iteration-1,object.getObjectByName(name).sorted[0][1][a])
        }
    } else if (object.getObjectByName(name).sorted[0][1][a] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].a,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].b,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][0][a]].c, iteration-1,object.getObjectByName(name).sorted[0][0][a])
        }

    }

    if (object.getObjectByName(name).sorted[0][2][b] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][3][b]].a,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][3][b]].b,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][3][b]].c, iteration-1,object.getObjectByName(name).sorted[0][3][b])
        }
    } else if (object.getObjectByName(name).sorted[0][3][b] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][2][b]].a,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][2][b]].b,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][2][b]].c, iteration-1,object.getObjectByName(name).sorted[0][2][b])
        }

    }

    if (object.getObjectByName(name).sorted[0][4][c] == faceIndex) {

        if (iteration!=0) {
            selectNeigboringFaces2(
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][5][c]].a,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][5][c]].b,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][5][c]].c, iteration-1,object.getObjectByName(name).sorted[0][5][c])
        }
    } else if (object.getObjectByName(name).sorted[0][5][c] == faceIndex) {
        if (iteration!=0) {
            selectNeigboringFaces2(
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][4][c]].a,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][4][c]].b,
                object.getObjectByName(name).geometry.faces[object.getObjectByName(name).sorted[0][4][c]].c, iteration-1,object.getObjectByName(name).sorted[0][4][c])
        }

    }

}


/*

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
    car.getObjectByName("selectable").geometry.colorsNeedUpdate = true;

    // loops through all of the faces and sorts them so no loops are necessary for mesh selection
    for (var j = 0; j < car.getObjectByName("selectable").geometry.faces.length; j++) {
        //faceSorted[0][car.getObjectByName("selectable").geometry.faces[j].a]= j;
        //cube.faces[i].a;
        sortFaceInformation(car.getObjectByName("selectable").geometry.faces[j].a,car.getObjectByName("selectable").geometry.faces[j].b,car.getObjectByName("selectable").geometry.faces[j].c,j)
        sortFaceInformation2(car.getObjectByName("selectable").geometry.faces[j].a,car.getObjectByName("selectable").geometry.faces[j].b,car.getObjectByName("selectable").geometry.faces[j].c,j)
        sortFaceInformation3(j);

        //if(GAME.App.myRole=='Host'){
        car.getObjectByName("selectable").geometry.faces[j].color.setHex( 0xffffff );
        //}
        //else{
        //    car.getObjectByName("selectable").geometry.faces[j].color.setHex( 0x000000 );
        //}

        car.getObjectByName("selectable").geometry.faces[j]["selected"] = false;


        //if (scene.getObjectByName("camaro").geometry.faces[j].materialIndex == 0)  {
        //    totalSelectable ++;
        //}

    }

    // if player, hide the geometry
    if(GAME.App.myRole == 'Host'){
        scene.add(car);
        car.castShadow = true;
        car.getObjectByName("selectable").colorsNeedUpdate = true;
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

}*/

function colorFaces() {
    var r, g, b;
    var col;
    $.each(object.getObjectByName("selectable").geometry.faces, function(i,f){
        //col = getRGB(Math.max(
        //    scene.children[3].children[0].geometry.vertices[car.getObjectByName("selectable").sorted[2][0][i]].y,
        //    scene.children[3].children[0].geometry.vertices[car.getObjectByName("selectable").sorted[2][1][i]].y,
        //    scene.children[3].children[0].geometry.vertices[car.getObjectByName("selectable").sorted[2][2][i]].y));

        object.getObjectByName("selectable").geometry.faces[i].color.r = col[0]/255;
        object.getObjectByName("selectable").geometry.faces[i].color.g = col[1]/255;
        object.getObjectByName("selectable").geometry.faces[i].color.b = col[2]/255;
    });
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
    if (event.keyCode == 83 && GAME.App.myRole =='Host'){ //s: selection
        SELECT = true;
        $('#bar').addClass('active');
    } else if ( event.keyCode == 90 && GAME.App.myRole =='Host') { //z: show heatmap
        var weight = new Array(object.getObjectByName('selectable').geometry.faces.length);
        var mesh_id_array, weight_array;
        $.post('/read_selection',{'obj_id':object.name},function(response){
                $.each(response, function(i,r){
                    mesh_id_array = r.mesh_id;
                    weight_array = r.weight;
                    $.each(mesh_id_array, function(j,mesh_id){
                        if(!weight[mesh_id]){
                            weight[mesh_id] = weight_array[j];
                        }
                        else{
                            weight[mesh_id] += weight_array[j];
                        }
                    })
                });
                var max_weight = Math.max.apply(Math,weight_array)
                $.each(weight, function(i,w){
                    if(w){
                        object.getObjectByName("selectable").geometry.faces[i].color.r = Math.max(w/max_weight,0.7);
                        object.getObjectByName("selectable").geometry.faces[i].color.g = Math.max(w/max_weight/5,0.2);
                        object.getObjectByName("selectable").geometry.faces[i].color.b = Math.max(w/max_weight/5,0.2);
                    }
                    else{
                        object.getObjectByName("selectable").geometry.faces[i].color.r = 0.2;
                        object.getObjectByName("selectable").geometry.faces[i].color.g = 0.2;
                        object.getObjectByName("selectable").geometry.faces[i].color.b = 0.2;
                    }
                });
            }
        );
    } else if (event.keyCode == 85 && GAME.App.myRole =='Host'){ //u: upload selection
        var weight = [];
        $.each(allSelectedID, function(i,d){
            weight.push(1-weight.length/allSelectedID.length);
        })
        $.post('/store_selection',{
                'obj_id': object.name,
                'mesh_id': JSON.stringify(allSelectedID),
                'weight': JSON.stringify(weight)}
        );
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
    //    for (var j = 0; j < car.getObjectByName("selectable").geometry.faces.length; j++) {
    //        if (scene.getObjectByName("camaro").geometry.faces[j].materialIndex == 0) {
    //            if (car.getObjectByName("selectable").geometry.faces[j]["selected"] == true) { numSelected++}
    //        }
    //    }
    //    perSelected = numSelected/totalSelectable;
    //}

}


function selectAll(s) {
    //if (s == true) {
    //    for (var j = 0; j < car.getObjectByName("selectable").geometry.faces.length; j++) {
    //        car.getObjectByName("selectable").geometry.faces[j].color.setHex( 0x000000 );
    //        car.getObjectByName("selectable").geometry.faces[j]["selected"] = true;
    //    }
    //} else {
    //    for (var j = 0; j < car.getObjectByName("selectable").geometry.faces.length; j++) {
    //        car.getObjectByName("selectable").geometry.faces[j].color.setHex( 0xffffff );
    //        car.getObjectByName("selectable").geometry.faces[j]["selected"] = false;
    //    }
    //}
    //
    //car.getObjectByName("selectable").geometry.colorsNeedUpdate = true;
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
    if (event.keyCode == 83 && GAME.App.myRole =='Host' ){
        SELECT = false;
        $('#bar').removeClass('active');
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

    directionalLight1 = new THREE.DirectionalLight( 0xffffff );
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




function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function diff(a, b) {
    return a.filter(function(i) {return b.indexOf(i) < 0;});
};

//Object.observe(car.getObjectByName("selectable").geometry.faces, function (changes){
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