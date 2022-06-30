/* global Avatar */
/* global Input */
/* global Player */


import {Multiplayer} from "./Multiplayer";
import {Scene} from "@babylonjs/core";
import {Player} from "./Player";
import {MediaStream} from "./MediaStream";

export class Socket {

    public static ws: WebSocket;
    private host: string = "ws://localhost:3000";
    private _scene: Scene;
    private _username: string;
    private _player: Player;
    private mediaStream: MediaStream;
    public static multiplayerId;
    public static player

    constructor(username: string, scene: Scene, player: Player) {
        this._username = username;
        this._scene = scene;
        this._player = player;
        Socket.player = this._player;

        this.init();
        this.mediaStream = new MediaStream(scene);
    }

    public init(): void{
        Socket.ws = new WebSocket(this.host)

        Socket.ws.onopen = () => {
            console.log("Connected");

            //Authenticate with server by sending username
            Socket.ws.send(`{"command":"username","data":"${this._username}"}`);

        }

        Socket.ws.onmessage = (msg) => {
            const json = JSON.parse(msg.data);
            switch(json.command) {
                case "auth":
                    // Authenticate users
                    if (json.data === "true") {
                        console.log("Authenticated by server");
                        this._player.send();
                    }
                    break;
                case "id":
                    // Get id from websocket
                    Socket.multiplayerId = json.data;
                    break;
                case "playerGone":
                    // Delete player
                    Multiplayer.remove(json.data);
                    break;
                case "playerMoved":
                    // Update when other players move
                    Multiplayer.move(json.data , this._scene);
                    break;
            }
        };
        Socket.ws.onclose = () => {
            alert("Connection closed");
        };
        Socket.ws.onerror = (e) => {
            alert("Error")
            console.log("Error", e);
        };

    }
}