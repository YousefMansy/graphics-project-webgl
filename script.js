/**
 * Created by Yousef on 12/13/2017.
 */

console.log("");

var canvas = $("#canvas-3d");
var renderer = null;
var camera = null;
var scene = null;
var controls = null;
var water = null;
var raycaster = null;
var clickable = [];



var WINDOW = {
    ms_Width: 0,
    ms_Height: 0,
    ms_Callbacks: {
        70: "WINDOW.toggleFullScreen()"		// Toggle fullscreen
    },

    initialize: function initialize() {
        this.updateSize();

        // Create callbacks from keyboard
        $(document).keydown(function (inEvent) {
            WINDOW.callAction(inEvent.keyCode);
        });
        $(window).resize(function (inEvent) {
            WINDOW.updateSize();
            WINDOW.resizeCallback(WINDOW.ms_Width, WINDOW.ms_Height);
        });
    },
    updateSize: function updateSize() {
        this.ms_Width = $(window).width();
        this.ms_Height = $(window).height() - 4;
    },
    callAction: function callAction(inId) {
        if (inId in this.ms_Callbacks) {
            eval(this.ms_Callbacks[inId]);
            return false;
        }
    },
    toggleFullScreen: function toggleFullScreen() {
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            if (document.documentElement.requestFullscreen)
                document.documentElement.requestFullscreen();
            else if (document.documentElement.mozRequestFullScreen)
                document.documentElement.mozRequestFullScreen();
            else if (document.documentElement.webkitRequestFullscreen)
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        else {
            if (document.cancelFullScreen)
                document.cancelFullScreen();
            else if (document.mozCancelFullScreen)
                document.mozCancelFullScreen();
            else if (document.webkitCancelFullScreen)
                document.webkitCancelFullScreen();
        }
    },
    resizeCallback: function resizeCallback(inWidth, inHeight) {
    }
};

function initialize(canvas, parameters) {

    canvas = $('#' + canvas);
    // Initialize Renderer, Camera, Projector and Scene
    renderer = new THREE.WebGLRenderer();

    canvas.html(renderer.domElement);
    scene = new THREE.Scene();
    // scene.add(new THREE.Fog(0xf5f5f5, 3,1000));
    camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 20, 3000000);

    camera.position.set(0, 20, -1000);

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    raycaster = new THREE.Raycaster();
    // Initialize Orbit control
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.userPan = false;
    controls.userPanSpeed = 0.0;

    controls.maxDistance = 5000.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    // Add light
    var directionalLight = new THREE.DirectionalLight(0xffff55, 1.5);


    directionalLight.position.set(-600, 300, 600);

    // scene.add(obj);
    scene.add(directionalLight);

    // Load textures
    var waterNormals = new THREE.ImageUtils.loadTexture('img/waternormals.jpg');

    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    // Create the water effect
    water = new THREE.Water(renderer, camera, scene, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: waterNormals,
        alpha: 1.0,
        alpha: 1.0,
        sunDirection: directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 50.0
    });

    var aMeshMirror = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(parameters.width * 500, parameters.height * 500, 10, 10),
        water.material
    );
    aMeshMirror.add(water);

    aMeshMirror.rotation.x = -Math.PI * 0.5;

    scene.add(aMeshMirror);

    loadSkyBox();

    loadBalloon();
    loadIsland();

}

function mainLoop() {
    requestAnimationFrame(mainLoop);
    update();
}

function onDocumentMouseDown(event) {
    event.preventDefault();
}

function loadIsland() {

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( 'obj/mill/' );
    mtlLoader.load( 'low-poly-mill.mtl', function( materials ) {

        materials.preload();
        materials;

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( 'obj/mill/' );
        objLoader.load( 'object.obj', function ( object ) {

            object.position.y = -50;
            object.scale.set(3,3,3);
            object.roughness = 5;
            scene.add( object );
        });

    });

}

function loadBalloon() {

    console.log("loading");
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( 'obj/balloon/' );
    mtlLoader.load( 'air_balloon.mtl', function( materials ) {

        materials.preload();

        materials;
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( 'obj/balloon/' );
        objLoader.load( 'air_balloon.obj', function ( object ) {

            object.position.y = 1000;
            object.position.x = 900;
            object.scale.set(3,3,3);
            scene.add( object );
            requestAnimationFrame(moveBalloon.bind(moveBalloon,object));


        });

    });

}

function loadChimp() {

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( 'obj/chimp/' );
    mtlLoader.load( 'chimp.mtl', function( materials ) {

        materials.preload();
        materials;

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials( materials );
        objLoader.setPath( 'obj/chimp/' );
        objLoader.load( 'chimp.obj', function ( object ) {

            object.position.y = 21;
            object.position.x = -100;
            object.position.z = -30 ;
            object.rotation.y = -30 ;
            object.scale.set(10,10,10);
            scene.add( object );
            requestAnimationFrame(moveChimp.bind(moveChimp,object));


        });

    });

}

function loadDeer(x) {

    var objLoader = new THREE.OBJLoader();
    objLoader.setPath( 'obj/deer/' );
        objLoader.load( 'deer.obj', function ( object ) {

            object.position.y = 10;
            object.position.x = -100 - x;
            object.position.z = -20 - x;
            object.scale.set(0.02,0.02,0.02);
            scene.add( object );
            requestAnimationFrame(moveDeer.bind(moveDeer,object));


        });

}

function moveBalloon(object){
    if(object.position.y <= 10){
// scene.remove(object);
// scene.remove(object);
        loadChimp();
        loadDeer(0);
        scene.remove(moveBalloon);
    }
    else{
        object.position.x -= 4;
        object.position.y -= 4;
        requestAnimationFrame(moveBalloon.bind(moveBalloon,object));
    }
}

function moveDeer(object){
    if(object.position.x >= 10){
        scene.remove(moveDeer);
    }
    else{
        object.position.x += 0.3;
        // object.position.y -= 3;
        requestAnimationFrame(moveDeer.bind(moveDeer,object));
    }
}

function moveChimp(object){
    if(object.position.x >= 10){
        scene.remove(moveChimp);
    }
    else{
        object.position.x += 0.08;
        // object.position.y -= 3;
        requestAnimationFrame(moveChimp.bind(moveChimp,object));
    }
}

function loadSkyBox() {
    var aCubeMap = THREE.ImageUtils.loadTextureCube([
        'img/px.jpg',
        'img/nx.jpg',
        'img/py.jpg',
        'img/ny.jpg',
        'img/pz.jpg',
        'img/nz.jpg'
    ]);

    aCubeMap.format = THREE.RGBFormat;
    var aShader = THREE.ShaderLib['cube'];

    aShader.uniforms['tCube'].value = aCubeMap;

    var aSkyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: aShader.fragmentShader,
        vertexShader: aShader.vertexShader,
        uniforms: aShader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    var aSkybox = new THREE.Mesh(
        new THREE.BoxGeometry(1000000, 1000000, 1000000),
        aSkyBoxMaterial
    );
    scene.add(aSkybox);
}

function display() {
    water.render();
    renderer.render(scene, camera);
}

function update() {
    water.material.uniforms.time.value += 1.0 / 60.0;
    controls.update();
    display();
}

function resize(inWidth, inHeight) {
    camera.aspect = inWidth / inHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(inWidth, inHeight);
    canvas.html(renderer.domElement);
    display();
}

$(function () {
    WINDOW.initialize();

    document.addEventListener('click', onDocumentMouseDown, false);

    var parameters = {
        width: 2000,
        height: 2000,
        widthSegments: 250,
        heightSegments: 250,
        depth: 1500,
        param: 4,
        filterparam: 1
    };

    initialize('canvas-3d', parameters);

    WINDOW.resizeCallback = function (inWidth, inHeight) {
        resize(inWidth, inHeight);
    };
    resize(WINDOW.ms_Width, WINDOW.ms_Height);

    mainLoop();
});


