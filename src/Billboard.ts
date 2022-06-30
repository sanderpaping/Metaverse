import {Mesh, MeshBuilder, Scene, Vector3} from "@babylonjs/core";
import {TextBlock} from "@babylonjs/gui";

export class Billboard {

    private _scene: Scene;
    public playerMesh: Mesh;
    public username: string;
    public mesh: Mesh;
    private text;
    public height = 15;
    public width = 50;

    constructor(playerMesh, username, scene) {
        this._scene = scene;
        this.playerMesh = playerMesh;
        this.username = username;
        this.create();
    }

    create() {
        this.mesh = MeshBuilder.CreatePlane("billboard", {width: this.width, height: this.height}, this._scene);
        this.mesh.position = Vector3.Zero();
        this.mesh.position.y = 3;
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.mesh, 1024, 256);
        // advancedTexture.name = "AvatarBillboard";
        var containerUI = new BABYLON.GUI.Rectangle("container");
        containerUI.thickness = 0;
        containerUI.height = 0.4;
        containerUI.width = 1;
        advancedTexture.addControl(containerUI);
        this.text = new BABYLON.GUI.TextBlock();
        // this.text.fontFamily = "Arial";
        this.text.fontWeight = "thin";
        this.text.color = "white";
        this.text.outlineColor = "black";
        this.text.outlineWidth = 1;
        this.text.fontSize = 16;
        containerUI.addControl(this.text);
        this.text.text = this.username;
        this.mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
        this.mesh.parent = this.playerMesh;
    }
}

