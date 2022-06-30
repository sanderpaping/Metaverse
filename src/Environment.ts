import {
    ActionManager,
    Animation,
    Color3,
    CubeTexture, ExecuteCodeAction, GlowLayer, InterpolateValueAction, Matrix,
    Mesh,
    MeshBuilder,
    PhysicsImpostor, Plane, PointerEventTypes, Quaternion,
    Scene, SceneLoader, SetValueAction,
    StandardMaterial,
    Texture, TransformNode,
    Vector3, VideoTexture
} from "@babylonjs/core";
import "@babylonjs/loaders";
import {Space} from "./Space";
import {Model} from "./Model";


export class Environment {

    private _scene: Scene;
    public skybox: Mesh

    public spaces: any;

    constructor(scene: Scene) {
        this._scene = scene;

    }

    // Load environment
    public async load(): Promise<void> {

        this.skybox = Mesh.CreateBox("skybox", 10000.0, this._scene);
        const skyboxMaterial = new StandardMaterial('skyBox', this._scene);
        skyboxMaterial.backFaceCulling = false
        // skyboxMaterial.reflectionTexture = new CubeTexture('sprites/skybox/skybox',  this._scene)
        skyboxMaterial.reflectionTexture = new CubeTexture('sprites/skybox/space5',  this._scene)
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0)
        skyboxMaterial.specularColor = new Color3(0, 0, 0)
        // skyboxMaterial.disableLighting = true
        this.skybox.material = skyboxMaterial

        // this._scene.fogMode = Scene.FOGMODE_EXP;
        // this._scene.fogDensity = 0.000125;
        // this._scene.fogColor = new Color3(0.9, 0.9, 0.85);

        this._loadModel("Astronaut", new Vector3(0, 0, 0), new Vector3(10,10,10));
        this._loadModel("sun", new Vector3(0, 0, 0), new Vector3(125,125,125));
        this._loadModel("star1", new Vector3(-3000, 500, 0), new Vector3(50,50,50));
        this._loadModel("star1", new Vector3(3000, 500, 0), new Vector3(50,50,50));
        this._loadModel("star1", new Vector3(0, 500, 3000), new Vector3(50,50,50));
        this._loadModel("star1", new Vector3(0, 500, -3000), new Vector3(50,50,50));
        this._loadModel("planet14", new Vector3(2200, 300, -2200), new Vector3(100,100,100));
        const planet17 = this._loadModel("planet18", new Vector3(-2200, 300, 2200), new Vector3(100,100,100));
        const planet18 = this._loadModel("planet18", new Vector3(-2200, 300, 0), new Vector3(100,100,100));
        const sat = this._loadModel("satelite", new Vector3(-1200, 0, 700), new Vector3(10,10,10));
        // this._loadModel("small-planet", new Vector3(-150, 0, 400), new Vector3(10,10,10));
        // const moon = this._loadModel("low-poly-moon", new Vector3(-500, 300, -500), new Vector3(20,20,20));

        this._scene.registerBeforeRender( () => {
            this._scene.getMeshByName("sun").rotation.y += 0.00025;
            this._scene.getMeshByName("sun").rotation.x += 0.00025;
            this._scene.getMeshByName("planet14").rotation.y += 0.0025;
            planet17.mesh.rotation.y += 0.0025;
            planet18.mesh.rotation.y += 0.0025;
        });

        const animSat = new Animation("satAnim", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        const satKeys =[];
        satKeys.push({
            frame: 0,
            value: 0
        });

        satKeys.push({
            frame: 1500,
            value: 2 * Math.PI
        });

        animSat.setKeys(satKeys);
        sat.mesh.animations = [];
        sat.mesh.animations.push(animSat);
        const upAndDownSat = new Animation("satAnim", "rotation.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        const upAndDownSatKeys =[];
        upAndDownSatKeys.push({
            frame: 0,
            value: 0
        });

        upAndDownSatKeys.push({
            frame: 750,
            value: Math.PI /4
        });

        upAndDownSatKeys.push({
            frame: 1500,
            value: 0
        });

        upAndDownSat.setKeys(upAndDownSatKeys);
        // sat.mesh.animations = [];
        sat.mesh.animations.push(upAndDownSat);
        this._scene.beginAnimation(sat.mesh, 0, 1500, true);

        this.loadSpace();
    }

    // Load model
    public _loadModel(modelName: string, position: Vector3, scaling: Vector3): Model {
        return new Model(this._scene,modelName, position, scaling);
    }

    // Load spaces
    private loadSpace()  {
        this.spaces = [
            new Space(this._scene,"Sigbar", new Vector3(-1100,200,700), 180),
            new Space(this._scene,"NHL Stenden", new Vector3(-1300,200,500), 90),
            new Space(this._scene,"Hanze Hogeschool", new Vector3(-1200,200,300), 45),
            new Space(this._scene,"Gemeente Groningen", new Vector3(-1100,200,100), 270),
            new Space(this._scene,"MySpace", new Vector3(1800,500,1100),360),
            new Space(this._scene,"ruimte", new Vector3(2600,500,900),0),
            new Space(this._scene,"space 7", new Vector3(1600,500,700),155),
            new Space(this._scene,"space 8", new Vector3(1800,500,500),160),
            new Space(this._scene,"space 9", new Vector3(2000,500,300),30),
            new Space(this._scene,"space 10", new Vector3(1200,0,-100),45),
            new Space(this._scene,"space 11", new Vector3(1200,0,100),60),
            new Space(this._scene,"space 12", new Vector3(1200,0,300),120),
            new Space(this._scene,"space 13", new Vector3(1200,0,500),0),
            new Space(this._scene,"space 14", new Vector3(-1800,500,-200),45),
            new Space(this._scene,"space 15", new Vector3(-2600,500,0),90),
            new Space(this._scene,"space 16", new Vector3(-1600,500,0),180),
            new Space(this._scene,"space 17", new Vector3(-1800,500,200),270),
            new Space(this._scene,"space 18", new Vector3(-2200,500,0),360),
            new Space(this._scene,"space 19", new Vector3(-1200,0,-100),45),
            new Space(this._scene,"space 20", new Vector3(-700,0,-100),60),
            new Space(this._scene,"space 21", new Vector3(-700,0,-300),120),
            new Space(this._scene,"space 22", new Vector3(-700,0,-500),0),
            new Space(this._scene,"space 23", new Vector3(-700,0,500),0),
            new Space(this._scene,"space 24", new Vector3(-700,0,800),0),
            new Space(this._scene,"space 25", new Vector3(-700,0,1100),0),
        ];
    }
}