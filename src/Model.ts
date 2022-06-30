import {Mesh, MeshBuilder, Scene, SceneLoader, Vector3} from "@babylonjs/core";


export class Model{

    private _scene: Scene;
    private modelName: string;
    private position: Vector3;
    private scaling: Vector3;
    public mesh: Mesh;

    constructor(scene: Scene, modelName: string, position: Vector3, scaling: Vector3) {
    this._scene = scene;
    this.modelName = modelName;
    this.position = position;
    this.scaling = scaling;
    this._load()
    }

    // Load model
    public async _load(): Promise<void> {

        //collision mesh
        this.mesh = MeshBuilder.CreateBox(`${this.modelName}`, {}, this._scene);
        this.mesh.isVisible = false;
        this.mesh.isPickable = false;
        this.mesh.checkCollisions = true;

        // // move origin of box collider to the bottom of the mesh ( to match imported mesh)
        // mesh.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));

        // // for collisions
        // mesh.ellipsoid = new Vector3(2, 3, 1);
        // mesh.ellipsoidOffset = new Vector3(0,1.5,0);

        // mesh.rotationQuaternion = new Quaternion(0, 1, 0,0); // rotate the player mesh 180 since we want to see the back of the satelite

        SceneLoader.ImportMeshAsync("", "./models/", `${this.modelName}.glb`, this._scene).then((result) => {
            //body is our actual player mesh
            const body = result.meshes[0];
            body.parent = this.mesh;
            body.isPickable = false;
            body.scaling = this.scaling;
            // body.scaling = new Vector3(10,10,10);
            body.getChildMeshes().forEach(m => {
                m.isPickable = false;
            });
            //return the mesh and animations
            this.mesh.position = this.position;
            return {
                mesh: this.mesh as Mesh,
                animationGroups: result.animationGroups
            }
        });
    }

}
