import {
    Scene,
    Vector3,
    Ray,
    TransformNode,
    Mesh,
    Color3,
    Color4,
    UniversalCamera,
    Quaternion,
    AnimationGroup,
    ExecuteCodeAction,
    ActionManager,
    ParticleSystem,
    Texture,
    SphereParticleEmitter,
    Sound,
    Observable,
    ShadowGenerator,
    ArcRotateCamera,
    Scalar,
    Matrix,
    Animation,
    FollowCamera,
    TrailMesh,
    StandardMaterial,
    MeshBuilder,
    DynamicTexture,
    ArcFollowCamera
} from "@babylonjs/core";
import { PlayerInput } from "./PlayerInput";
import {Room} from "colyseus.js";
import {Socket} from "./Socket";

export class Player extends TransformNode {
    public camera: ArcRotateCamera;
    public scene: Scene;
    private _input: PlayerInput;

    //animations
    private _run: AnimationGroup;
    private _idle: AnimationGroup;
    private _jump: AnimationGroup;
    private _land: AnimationGroup;
    private _dash: AnimationGroup;

    // animation trackers
    private _currentAnim: AnimationGroup = null;
    private _prevAnim: AnimationGroup;
    private _isFalling: boolean = false;
    private _jumped: boolean = false;

    private _dashPressed: boolean;

    //observables
    public onRun = new Observable();

    //Player
    public mesh: Mesh; //outer collisionbox of player

    //gravity, ground detection, jumping
    private _gravity: Vector3 = new Vector3();
    private _playerspeed: number = 0.75;
    public absoluteRotation = 0;

    constructor(assets, scene: Scene, input?: PlayerInput) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        const trail = new TrailMesh("trail", this.mesh, this._scene, 0.2,40, true);

        var sourceMat = new StandardMaterial('sourceMat', this._scene);
        sourceMat.emissiveColor = sourceMat.diffuseColor = Color3.Yellow();
        sourceMat.specularColor = Color3.Black();
        trail.material = sourceMat;

        this._idle = assets.animationGroups[1];
        this._jump = assets.animationGroups[2];
        this._land = assets.animationGroups[3];
        this._run = assets.animationGroups[4];
        this._dash = assets.animationGroups[0];
        //--COLLISIONS--
        this.mesh.actionManager = new ActionManager(this.scene);

        this._input = input; //inputs we will get from PlayerInput.ts
    }

    // Send user position to server
    public send(): void {
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z;
        const rot = this.absoluteRotation;
        const JSON = `{"command":"transform","data":{"x":${x},"y":${y},"z":${z},"rotation":${rot}}}`;
        // console.log(JSON);
        Socket.ws.send(JSON);
    }

    // Move user by keyboard inputs
    private _updateFromControls(): void {

        const cameraForwardRayPosition = this.camera.getForwardRay().direction
        const cameraForwardRayPositionWithoutY = new Vector3(cameraForwardRayPosition.x, 0, cameraForwardRayPosition.z)
        // var cameraForwardRayPositionWithoutY = new Vector3(cameraForwardRayPosition.x, cameraForwardRayPosition.y, cameraForwardRayPosition.z)

        // this.camera.setTarget(new Vector3(this.mesh.position.x, this.mesh.position.y + 7, this.mesh.position.z));

        if (this._input.run) {
            this._playerspeed = 2.45;
        }else{
            this._playerspeed = 0.45;
        }
        if (this._input.left) {
            this.lookAt(this.position.add(cameraForwardRayPositionWithoutY), 0, 0, 0)
            this.locallyTranslate(new Vector3(-this._playerspeed, 0, 0))
            this.camera.lockedTarget = new Vector3(this.position.x, this.position.y + 7, this.position.z);
            this.send();
        }
        if (this._input.right) {
            this.lookAt(this.position.add(cameraForwardRayPositionWithoutY), 0, 0, 0)
            this.locallyTranslate(new Vector3(this._playerspeed, 0, 0))
            this.camera.lockedTarget = new Vector3(this.position.x, this.position.y + 7, this.position.z);
            this.send();
        }
        if (this._input.forward) {
            this.lookAt(this.position.add(cameraForwardRayPositionWithoutY), 0, 0, 0)
            this.position = this.position.add(new Vector3(cameraForwardRayPosition.x * this._playerspeed, cameraForwardRayPosition.y * this._playerspeed, cameraForwardRayPosition.z * this._playerspeed))
            this.camera.lockedTarget = new Vector3(this.position.x, this.position.y + 7, this.position.z);
            this.send();
        }
        if (this._input.back) {
            this.lookAt(this.position.add(cameraForwardRayPositionWithoutY), 0, 0, 0)
            this.position = this.position.add(new Vector3(-cameraForwardRayPosition.x * this._playerspeed, -cameraForwardRayPosition.y * this._playerspeed, -cameraForwardRayPosition.z * this._playerspeed))
            this.camera.lockedTarget = new Vector3(this.position.x, this.position.y + 7, this.position.z);
            this.send();
        }

        if (this._input.up) {
            this.locallyTranslate(new Vector3(0,this._playerspeed, 0))
            this.camera.lockedTarget = new Vector3(this.position.x, this.position.y + 7, this.position.z);
            this.send();
        }
        if (this._input.down) {
            this.locallyTranslate(new Vector3(0, -this._playerspeed, 0))
            this.camera.lockedTarget = new Vector3(this.position.x, this.position.y + 7, this.position.z);
            this.send();
        }
    }

    // Get the user position
    public getPlayerPosition(): Vector3{
        return this.position;
    }

    // Set up user camera
    private _setupPlayerCamera(): ArcRotateCamera {
        this.camera = new ArcRotateCamera("cam", 0,0,20, new Vector3(this.position.x + 20, this.position.y + 7, this.position.z), this.scene);

        this.camera.attachControl();
        this.camera.checkCollisions = true
        this.camera.lowerRadiusLimit = 20
        this.camera.upperRadiusLimit = 20

        this.camera.keysLeft = []
        this.camera.keysRight = []
        this.camera.keysUp = []
        this.camera.keysDown = []

        this.scene.activeCamera = this.camera;

        return this.camera;
    }

    // Update camera while user is moving
    private _updateCamera(): void {
        this.camera.setTarget(new Vector3(this.position.x, this.position.y + 7, this.position.z));
    }

    // Activate user camera
    public activatePlayerCamera(): ArcRotateCamera{
        this.scene.registerBeforeRender(() => {
            this._beforeRenderUpdate();
            this._updateCamera();
        })
        return this.camera;
    }

    // Update user movement
    private _beforeRenderUpdate(): void {
        this._updateFromControls();
    }

    // Fly to location
    public async flyToCoordinates(vector: Vector3, lookPosition: Vector3): Promise<void> {

        const camera2 = new ArcRotateCamera("cam2", 0,0, 20, this.mesh.position, this.scene);
        // camera2.position = this.camera.globalPosition;
        camera2.parent = this.mesh;
        camera2.position = new Vector3(this.mesh.position.x, this.mesh.position.y,this.mesh.position.z + 20);
        camera2.lockedTarget = new Vector3(this.mesh.position.x, this.mesh.position.y + 7, this.mesh.position.z)
        this.scene.activeCamera = camera2;

        // Turn mesh in direction of target
        this.lookAt(vector);

        // // Rotate camera to target
        // const rotateCamera = new Animation("rotateCamera", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        // const rotateKeys = [];
        //
        // rotateKeys.push({
        //     frame:0,
        //     value: camera2.position,
        // })
        //
        // rotateKeys.push({
        //     frame: 30,
        //     // value: vector
        //     value: new Vector3(this.mesh.position.x, this.mesh.position.y + 7,this.mesh.position.z + 20)
        // })
        //
        // rotateCamera.setKeys(rotateKeys);
        // camera2.animations = [];
        // camera2.animations.push(rotateCamera);
        //
        // // Begin Animation
        // let rotateAnimation = this.scene.beginAnimation(camera2, 0, 30, false);
        // await rotateAnimation.waitAsync();

        // Fly to coordinate animation
        const animPlayer = new Animation("flyAnimation", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const flyKeys = [];

        flyKeys.push({
            frame: 0,
            value: this.getPlayerPosition()
        });

        flyKeys.push({
            frame: 45,
            value: vector
        });

        animPlayer.setKeys(flyKeys);

        this.animations = [];
        this.animations.push(animPlayer);

        // Begin animation
        let animation = this.scene.beginAnimation(this, 0, 45, false);

        this._scene.registerBeforeRender( () => {
            this.camera.lockedTarget = new Vector3(this.position.x, this.position.y + 7, this.position.z);
            this.send();
        });

        await animation.waitAsync();
        camera2.position = new Vector3(this.mesh.position.x, this.mesh.position.y - 2,this.mesh.position.z + 20);

        this.lookAt(lookPosition);

        // const rotateCamera2 = new Animation("rotateCamera", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        // const rotateKeys2 = [];
        //
        // rotateKeys2.push({
        //     frame:0,
        //     value: camera2.position,
        // })
        //
        // rotateKeys2.push({
        //     frame: 15,
        //     value: new Vector3(this.mesh.position.x, this.mesh.position.y + 10,this.mesh.position.z + 20)
        //     // value: lookPosition
        // })
        //
        // rotateCamera2.setKeys(rotateKeys2);
        //
        // camera2.animations = [];
        // camera2.animations.push(rotateCamera2);
        //
        // let rotateAnimation2 = this.scene.beginAnimation(camera2, 0, 30, false);

        // await rotateAnimation2.waitAsync();

        this.camera.rotationQuaternion = camera2.absoluteRotation;
        this.camera.position = camera2.globalPosition;
        this.scene.activeCamera = this.camera;

    }
}