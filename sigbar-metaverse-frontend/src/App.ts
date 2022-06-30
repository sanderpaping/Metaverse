import './style/style.scss';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
    Color3,
    Color4, DirectionalLight,
    Engine,
    FreeCamera, GlowLayer,
    HemisphericLight,
    ImageProcessingConfiguration,
    Matrix,
    Mesh,
    MeshBuilder, PointLight,
    Quaternion,
    Scene,
    SceneLoader,
    Sound, StandardMaterial,
    Vector3
} from "@babylonjs/core";
import {Player} from "./Player";
import {PlayerInput} from "./PlayerInput";
import {Hud} from "./Hud";
import {Environment} from "./Environment";
import {Socket} from "./Socket";
import {CustomLoadingScreen} from "./CustomLoadingScreen";
import {Multiplayer} from "./Multiplayer";

enum State { START = 0, GAME = 1 }

class App {
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    public assets;
    private _input: PlayerInput;
    private _player: Player;
    private _ui: Hud;
    private _environment;
    public userName: string;

    private _state: number = 0;
    private _gameScene: Scene;

    //post process
    // private _transition: boolean = false;

    constructor() {
        // Create the canvas html element and attach it to the webpage with function
        this._canvas = document.querySelector("canvas#gameCanvas");

        // Initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._engine.loadingScreen = new CustomLoadingScreen();

        // Hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // Main render loop & state machine
        this._main();
    }

    private async _main(): Promise<void>{
        await this._goToStart();

        // Register a render loop to repeatedly render the scene
        this._engine.runRenderLoop(() => {
            switch (this._state){
                case State.START:
                    this._scene.render();
                    break;
                case State.GAME:
                    if (this._ui.quit) {
                        this._goToStart();
                        this._ui.quit = false;
                    }
                    this._scene.render();
                    break;
                default: break;
            }
            this._scene.render();
        });

        // Resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private async _goToStart(): Promise<void> {
        this._engine.displayLoadingUI(); // wait to load screen
        // Setup scene
        // Don't detect anny inputs from this ui while the game is loading
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);

        // Creates and positions a free camera
        let camera = new  FreeCamera("camera1", new Vector3(0,0,0), scene);
        camera.setTarget(Vector3.Zero()); //targets the camera to the scene origin

        let canplay = false;

        // Scene is Finished loading
        await scene.whenReadyAsync();

        // Lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;

        scene.onBeforeRenderObservable.add(() => {
            this._engine.hideLoadingUI();

            // Only once all the game assets have finished loading, go to the game state
            if(finishedLoading && canplay) {
                scene.detachControl();
                canplay = false;
                // this._canvas.blur();
                this._canvas.focus();
                this._goToGame();
            }
        });

        // START LOADING AND SETTING UP THE GAME DURING THIS SCENE
        let finishedLoading = false;
        await this._setUpGame().then(res =>{
            finishedLoading = true;
            this._engine.hideLoadingUI(); // When the scene is ready, hide loading

            let startBg = document.createElement("div");
            startBg.id = "startBg";
            startBg.style.backgroundImage = "url('./sprites/space.gif')";
            document.body.appendChild(startBg);

            let title = document.createElement("h1");
            title.id = "title";
            title.innerHTML = "Metaverse";
            startBg.appendChild(title);

            let menuBg = document.createElement("div");
            menuBg.id = "menuBg";
            startBg.appendChild(menuBg);

            let userNameInput = document.createElement("input");
            userNameInput.id = "username";
            userNameInput.placeholder = "Username"
            userNameInput.minLength = 4;
            menuBg.appendChild(userNameInput);

            let errorInput = document.createElement("p");
            errorInput.id = "err";

            let startButton = document.createElement("button");
            startButton.id = "start";
            startButton.innerHTML = "Start"
            menuBg.appendChild(startButton);
            startButton.addEventListener('click', ()=>{
                if(userNameInput.value.length >= 4){

                    scene.detachControl(); // observables disabled
                    // this._transition = true;
                    this._engine.displayLoadingUI();
                    canplay = true;
                    startBg.style.display = "none";
                    this.userName = userNameInput.value;
                } else {
                    console.log("username to short");
                    errorInput.innerHTML = "Username has to be longer than 3 characters";
                    errorInput.style.display = "block";
                    menuBg.appendChild(errorInput);
                }

            });

            userNameInput.addEventListener("keyup", (event) => {
                if(event.keyCode === 13) {
                    event.preventDefault();
                    document.getElementById("start").click();
                }
            })
        });

    }

    private async _setUpGame(): Promise<void> {
        // Create scene
        let scene = new Scene(this._engine);
        this._gameScene = scene;

        this._environment = new Environment(scene);
        await this._environment.load();
        await  this._loadCharacterAssets(scene);

    }

    private async _loadCharacterAssets(scene): Promise<any> {

        async function loadCharacter() {
            // Collision mesh
            const outer = MeshBuilder.CreateBox("outer", {width: 1, depth: 1, height: 1}, scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;

            // Move origin of box collider to the bottom of the mesh ( to match imported mesh)
            outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));

            // For collisions
            outer.ellipsoid = new Vector3(2, 3, 1);
            outer.ellipsoidOffset = new Vector3(0,1.5,0);

            outer.rotationQuaternion = new Quaternion(0, 1, 0,0); // rotate the player mesh 180 since we want to see the back of the player

            //--IMPORTING MESH--
            return SceneLoader.ImportMeshAsync(null, "./models/", "OrbHovering.glb", scene).then((result) =>{
                //body is our actual player mesh
                const body = result.meshes[0];
                body.parent = outer;
                body.isPickable = false;
                body.getChildMeshes().forEach(m => {
                    m.isPickable = false;
                })

                // Return the mesh and animations
                return {
                    mesh: outer as Mesh,
                    animationGroups: result.animationGroups
                }
            });
        }

        return loadCharacter().then((assets) => {
            this.assets = assets;
        });
    }

    // Game scene
    private async _goToGame(): Promise<void>{
        this._engine.displayLoadingUI(); // wait to load screen
        // Setup scene
        this._scene.detachControl();
        let scene = this._gameScene;

        // GUI
        this._ui = new Hud(scene);

        // // Background music
        // const backgroundMusic = new Sound("name", "./sounds/the-light-of-the-universe.mp3", scene, null, {loop: true, autoplay: true});
        // backgroundMusic.setVolume(0.05);

        scene.detachControl();

        this._input = new PlayerInput(scene, this._ui); //detect keyboard/mobile inputs

        // Primitive character and setting
        await this._initializeGameAsync(scene);

        //--WHEN SCENE FINISHED LOADING--
        await scene.whenReadyAsync();

        scene.getMeshByName("outer").position = new Vector3(0, 0, 0);
        this._player.position = new Vector3(0, 0, 1200);
        // scene.getMeshByName("outer").position = scene.getTransformNodeByName("startPosition").getAbsolutePosition();

        // Lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();
        this._scene.attachControl();
    }

    private async _initializeGameAsync(scene): Promise<void> {
        const light = new HemisphericLight("HemiLight", new Vector3(0,1,0), scene);
        light.intensity = 0.8;

        // Create the player
        this._player = new Player(this.assets, scene, this._input);

        // // Glow
        // const glowLayer = new GlowLayer("glowLayer", scene, {
        //     mainTextureFixedSize: 1024,
        //     blurKernelSize: 64
        // });
        // // glowLayer.intensity = 0.2;
        // glowLayer.intensity = 1;
        // console.log(this._player.mesh);
        // glowLayer.addIncludedOnlyMesh(this._player.mesh)
        // glowLayer.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
        //     if (mesh.name === "sun") {
        //         result.set(1, 1, 1, 1);
        //     } else if (mesh.name === "star1") {
        //         result.set(1, 1, 1, 1);
        //     } else {
        //         result.set(0, 0, 0, 0);
        //     }
        // }

        for (let space of this._environment.spaces) {
                let spaceElement = document.createElement("li");
                spaceElement.value = space.position;
                spaceElement.innerHTML = '<div class="image"></div><span class="name" id="'+space.position+'">'+space.name+'</span>';
                spaceElement.addEventListener('click', ()=>{
                    // alert(`this is the location: ${space.position}`);
                    this._player.flyToCoordinates(space.flyToPosition, space.position);
                    // this._player.flyToSpace(new Vector3(space.position.x, space.position.y + 35, space.position.z));
                });

                let getList = document.querySelector("ul#spaceList");
                getList.appendChild(spaceElement);
            }

        // Set player camera
        const camera = this._player.activatePlayerCamera();

        // New socket-connection for multiplayer
        const socket = new Socket(this.userName, scene, this._player);

        scene.autoClear = false; // Color buffer
        scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
        scene.getAnimationRatio();

        // Game loop
        scene.registerBeforeRender(() => {
            // Attach Skybox to player
            this._environment.skybox.position.copyFrom(camera.position);

            this._canvas.blur();
            this._canvas.focus();
            if (this._ui.transition) {
                this._ui.fadeLevel -= .05;

                //once the fade transition has complete, switch scenes
                if(this._ui.fadeLevel <= 0) {
                    this._ui.quit = true;
                    this._ui.transition = false;
                }
            }
        });
    }
}
new App();