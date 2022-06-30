import {
    Color3,
    Mesh,
    MeshBuilder,
    Quaternion,
    Scene,
    SceneLoader,
    StandardMaterial,
    TrailMesh,
    Vector3
} from "@babylonjs/core";
import {Billboard} from "./Billboard";
import {Socket} from "./Socket";

export class Multiplayer {

    private _scene: Scene;
    public id: string;
    public name: string;
    public static all = [];
    public  mesh: Mesh;
    public static username: string;
    public static material;
    private billboard: Billboard;

    constructor(id: string, username: string, scene: Scene) {
        this._scene = scene
        this.id = id;
        this.name = username;
        this.initMesh();

        this.billboard = new Billboard(this.mesh, username, scene);
        Multiplayer.all.push(this);

            // Create player name in peopleList(HUD)
            let playerElement = document.createElement("li");
            playerElement.innerHTML = '<div class="image"></div><span class="name" id="'+this.id+'">'+this.name+'</span>';
            playerElement.addEventListener('click', () => {
                Socket.player.flyToCoordinates(new Vector3(this.mesh.position.x + 10,this.mesh.position.y,this.mesh.position.z), this.mesh.position);
            });

            let getList = document.querySelector("ul#peopleList");
            getList.appendChild(playerElement);
    }

    public initMesh(): void {
        // Create mesh
        this.mesh = MeshBuilder.CreateBox(`player ${this.id}`, {width: 2, depth: 1, height: 3}, this._scene);
        this.mesh.position = Vector3.Zero();
        this.mesh.position.x = 1200;
        this.mesh.position.y = 600;
        this.mesh.position.z = 1200;
        this.mesh.isVisible = false;
        this.mesh.isPickable = false;
        this.mesh.checkCollisions = true;
        this.mesh.material = Multiplayer.material;
        this.mesh.addLODLevel(1000, null);

        const trail = new TrailMesh("trail", this.mesh, this._scene, 0.2,40, true);
        var sourceMat = new StandardMaterial('sourceMat', this._scene);
        sourceMat.emissiveColor = sourceMat.diffuseColor = Color3.Yellow();
        sourceMat.specularColor = Color3.Black();
        trail.material = sourceMat;

        // Load model for multiplayer
        SceneLoader.ImportMeshAsync(null, "./models/", "OrbHovering.glb", this._scene).then((result) => {
            const body = result.meshes[0];
            body.parent = this.mesh;
            body.isPickable = false;
            body.getChildMeshes().forEach(m => {
                m.isPickable = false;
            })
            return {
                mesh: this.mesh as Mesh,
                animationGroups: result.animationGroups
            }
        });
    }

    // Destroy player meshes
    destroy(): void {
        this.billboard.mesh.dispose();
        this.mesh.dispose();
    }

    // Find existing player or create if not exists
    public static find(playerID, username, scene): Multiplayer {
        // Check if player is in our list
        for (var objPlayer of Multiplayer.all) {
            if (objPlayer.id === playerID) {
                // Found player, so lets return it
                return(objPlayer);
            }
        }
        // Player doesn't exist, so lets create a new one
        return(new Multiplayer(playerID, username, scene));
    }

    // Find player and move them
    static move(data, scene): void {
        var playerID = parseInt(data.id);
        var objPlayer = Multiplayer.find(playerID, data.username, scene);
        objPlayer.transform(data.x, data.y, data.z, data.rotation);
    }

    // Remove player from world
    static remove(playerID): void {
        for (var objPlayer of Multiplayer.all) {
            if (objPlayer.id === playerID) {
                let getplayer = document.getElementById(objPlayer.id);
                getplayer.parentElement.remove();
                objPlayer.destroy();
                break;
            }
        }

        // Remove me from list of all players
        Multiplayer.all = Multiplayer.all.filter((obj) => {
            return obj.id !== playerID;
        });
    }

    // Change position and rotation
    transform(x, y, z, rotation): void {
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        this.mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, -rotation, 0);
    }
}
