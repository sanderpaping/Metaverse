import {
    ActionManager, Animation,
    Color3,
    ExecuteCodeAction, HighlightLayer, InterpolateValueAction,
    Mesh,
    MeshBuilder, PointerEventTypes, Scene,
    SetValueAction,
    StandardMaterial, Texture, TransformNode,
    Vector3, VideoTexture
} from "@babylonjs/core";
import * as GUI from 'babylonjs-gui';
import {Image} from "@babylonjs/gui";
import {Model} from "./Model";


export class Space {

    private _scene : Scene;
    public name : string;
    public position: Vector3;
    public flyToPosition: Vector3;

    constructor(scene:Scene, name: string, position: Vector3, rotation: number) {
        this._scene = scene;
        this.name = name;
        this.position = position;

        this._createSpace(name, position, rotation);

    }

    private async _createSpace(name: string, vector: Vector3, rotation: number) {

        const space = new TransformNode("space");
        space.name = name;

        // Create pivot point fo spaces to rotate around
        const pivot = new TransformNode("pivot");
        pivot.parent = space;
        space.setPivotPoint(vector);
        space.rotation.y = rotation;

        // Position where players end up after flying to a space
        const flyPosition = MeshBuilder.CreateSphere(`flypoint ${name}`, {diameter: 5, segments: 32}, this._scene);
        flyPosition.isVisible = false;
        flyPosition.position = new Vector3(vector.x + 80, vector.y + 40, vector.z)
        flyPosition.parent = space;

        this.flyToPosition = flyPosition.getAbsolutePosition();

        // Create platform mesh
        const platform = Mesh.CreateCylinder("platform",4, 100,75, 0,0, this._scene);
        platform.position = vector;
        const platMat = new StandardMaterial("", this._scene);
        platMat.diffuseColor = new Color3(0.25, 0.28,0.30);
        platMat.emissiveColor = new Color3(0.25, 0.28,0.30);
        platform.material = platMat;
        // platform.scaling = new Vector3(2,.025,2);

        // Satellite model
        const sat = new Model(this._scene,"satelite", new Vector3(vector.x,vector.y - 30, vector.z), new Vector3(5,5,5));

        // Satellite animation
        const animSat = new Animation("satAnimRotate", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
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
        const upAndDownSat = new Animation("satAnimRotateX", "rotation.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        const upAndDownSatKeys =[];
        upAndDownSatKeys.push({
            frame: 0,
            value: 0
        });

        upAndDownSatKeys.push({
            frame: 750,
            value: Math.PI /8
        });

        upAndDownSatKeys.push({
            frame: 1500,
            value: 0
        });

        upAndDownSat.setKeys(upAndDownSatKeys);

        sat.mesh.animations.push(upAndDownSat);

        // const verticalSat = new Animation("satAnimVertical", "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
        // const verticalSatKeys =[];
        // verticalSatKeys.push({
        //     frame: 0,
        //     value: sat.mesh.position
        // });
        //
        // verticalSatKeys.push({
        //     frame: 750,
        //     value: new Vector3(sat.mesh.position.x,sat.mesh.position.y + 100, sat.mesh.position.z)
        // });
        //
        // verticalSatKeys.push({
        //     frame: 1500,
        //     value: sat.mesh.position
        // });
        //
        // verticalSat.setKeys(verticalSatKeys);
        // // sat.mesh.animations = [];
        // sat.mesh.animations.push(verticalSat);
        this._scene.beginAnimation(sat.mesh, 0, 1500, true);

        this._scene.registerBeforeRender( () => {
            // platform.mesh.rotation.y += 0.00025;
        });

        // // Pillar
        // const pillar = Mesh.CreateCylinder("pillar", 35, 2, 8,0,0, this._scene)
        // pillar.position.y = vector.y + 17.5;
        // pillar.position.z = vector.z;
        // pillar.position.x = vector.x;
        // const redMat = new StandardMaterial("ground", this._scene);
        // redMat.diffuseColor = Color3.Red();
        // redMat.specularColor = new Color3(0.4, 0.4, 0.4);
        // pillar.material = redMat;
        //
        // pillar.actionManager = new ActionManager(this._scene);
        // pillar.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger,  () => {
        //     this._openDashboard();
        // }));
        //
        // // Sign
        // const sign = MeshBuilder.CreateSphere("sign", {diameterY: 15, diameterX: 5, diameterZ:15}, this._scene);
        // sign.position.y = 20;
        // sign.outlineColor = new Color3(1,0.8,2);
        // const signMat = new StandardMaterial("signMat", this._scene);
        // signMat.diffuseColor = Color3.Red();
        // signMat.specularColor = new Color3(0.4, 0.4, 0.4);
        // sign.material = signMat;
        // sign.rotation.x = Math.PI;
        // sign.actionManager = new ActionManager(this._scene);
        //
        // // Sign animation
        // const animSign = new Animation("animationSign", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        // const signKeys = [];
        //
        // signKeys.push({
        //     frame: 0,
        //     value: 0
        // })
        //
        // signKeys.push({
        //     frame: 30,
        //     value: Math.PI
        // })
        //
        // animSign.setKeys(signKeys);
        // sign.animations = [];
        // sign.animations.push(animSign);
        //
        // this._scene.beginAnimation(sign, 0, 30, true);

        // Name of the space
        const plane = Mesh.CreatePlane("plane",20, this._scene);
        plane.parent = platform;
        plane.position.y = 50;
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;

        const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        const button1 = GUI.Button.CreateSimpleButton("but1", `${space.name}`);
        button1.width = 1;
        button1.height = 0.4;
        button1.color = "#fed443";
        button1.fontSize = 200;
        button1.thickness = 0;
        // button1.background = "green";
        button1.onPointerUpObservable.add(() => {
            alert("you did it!");
        });
        advancedTexture.addControl(button1);

        const hl = new HighlightLayer("hl1", this._scene);

        // hover over screens
        const screenOverOut =  (mesh1) => {
            // mesh1.actionManager.registerAction(new SetValueAction(ActionManager.OnPointerOutTrigger, mesh1.material, "diffuseColor", ''));
            // mesh1.actionManager.registerAction(new SetValueAction(ActionManager.OnPointerOverTrigger, mesh1.material, "diffuseColor", Color3.White()));
            // mesh1.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOutTrigger, mesh1, "scaling", new Vector3(1, 1, 1), 150));
            // mesh1.actionManager.registerAction(new InterpolateValueAction(ActionManager.OnPointerOverTrigger, mesh1, "scaling", new Vector3(1.05, 1.05, 1.05), 150));

            mesh1.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () =>{
                hl.addMesh(mesh1, Color3.Yellow());
            }));

            mesh1.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () =>{
                hl.removeMesh(mesh1);
            }));

        }

        for(let index = 1; index < 4; index++) {
            const planeOpts = {
                        height: 23,
                        width: 37,
                        sideOrientation: Mesh.DOUBLESIDE
                    };
            const screen = MeshBuilder.CreatePlane(`screen ${index}`, planeOpts, this._scene);
            screen.position.y = vector.y + 25;

            const screenMat = new StandardMaterial("screenMat", this._scene);
            // screenMat.diffuseColor = new Color3(0.4, 0.4, 0.4);
            // screenMat.specularColor = new Color3(0.4, 0.4, 0.4);
            screenMat.specularColor = new Color3(0, 0, 0);
            screenMat.emissiveColor = new Color3(1,1,1);
            screen.material = screenMat;
            screen.actionManager = new ActionManager(this._scene);

            if(index == 1){
                screenMat.diffuseTexture = new Texture("sprites/space.gif", this._scene);

                screen.position.z = vector.z - 35;
                screen.rotation.y = Math.PI / 4;
                screen.position.x = vector.x - 35;
                screen.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
                    this._openDashboard();
                }));
            } else if(index == 2){
                screenMat.diffuseTexture = new Texture("sprites/start2.jpg", this._scene);

                screen.position.z = vector.z;
                screen.rotation.y = Math.PI / 2;
                screen.position.x = vector.x - 50;
                screen.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
                    this._openDashboard();
                }));
            }else if(index == 3){
                screenMat.diffuseTexture = new Texture("sprites/sigbar.jpg", this._scene);

                screen.position.z = vector.z + 35;
                screen.rotation.y = - Math.PI / 4;
                screen.position.x = vector.x - 35;
                screen.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, () => {
                    this._openDashboard();
                }));
            }
            screenOverOut(screen);

            screen.parent = space;
            screen.addLODLevel(2000,null);
        }
        // pillar.addLODLevel(2000,null);
        // sign.addLODLevel(2000,null);
        platform.addLODLevel(2000, null);
        plane.addLODLevel(2000,null);

        //parent the meshes
        // sign.parent = pillar;
        // pillar.parent = space;
        platform.parent = space;
        sat.mesh.parent = space;
    }

    private _openDashboard(): void {
        document.getElementById("video").classList.add("space");

        if(typeof(document.querySelectorAll("div.remoteVideo")) != 'undefined' && document.querySelectorAll("div.remoteVideo") != null){
            let remoteVideos = document.querySelectorAll("div.remoteVideo");

            remoteVideos.forEach((i:HTMLDivElement) => {
                i.style.display = "block";
            });
        }

        let spacesMenu: HTMLDivElement = document.querySelector("div.spacesMenu");
        spacesMenu.style.display = "none";

        let peoplesMenu: HTMLDivElement = document.querySelector("div.peopleMenu");
        peoplesMenu.style.display = "none";

        let spaceDashboardMenu: HTMLDivElement = document.querySelector("div.dashBoard");
        spaceDashboardMenu.style.display = "block";
        let spaceNameTitle: HTMLDivElement = document.querySelector("div.spaceTitle");
        spaceNameTitle.innerHTML = this.name;
    }
}