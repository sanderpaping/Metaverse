import {io} from "socket.io-client";
import {Color3, Mesh, MeshBuilder, Scene, Sound, StandardMaterial, Vector3, VideoTexture} from "@babylonjs/core";
import {Multiplayer} from "./Multiplayer";
import {Socket} from "./Socket";
import * as stream from "stream";

export class MediaStream {

    private _scene: Scene;

    public localVideo: HTMLVideoElement;
    public socketId: string;
    public localStream;
    public connections = [];
    public socket;

    private peerConnectionConfig = {
        'iceServers': [
            {'urls': 'stun:stun.services.mozilla.com'},
            {'urls': 'stun:stun.l.google.com:19302'},
        ]
    };

    constructor(scene: Scene) {
        this._scene = scene;
        this.init();
    }

    public init(): void {

        let getUserMediaSuccess = (stream) => {
            this.localStream = stream;
            this.localVideo.srcObject = stream;
        }

        // Webcam position in space menu
        let position = 0;

        let gotRemoteStream = (event, id, multiplayerId) => {

            // Create video element in the do to attach to mesh
            let video: HTMLVideoElement = document.createElement('video'), div = document.createElement('div')
            div.className = `remoteVideo position-${position}`;
            video.id = id;
            div.style.display = "none";
            position++;

            video.setAttribute('data-socket', id);
            video.srcObject = event.stream;
            video.autoplay = true;
            video.muted = true;
            // video.playsinline = true;

            div.appendChild(video);
            document.querySelector('#hud').appendChild(div);

            // Create cam on plane
            const planeOpts = {
                height: 5.4762,
                width: 7.3967,
                sideOrientation: Mesh.DOUBLESIDE
            };

            // Build plane for webcam
            const cam = MeshBuilder.CreatePlane("camPlane", planeOpts, this._scene);

            // Attach webcam from user to the right mesh
            let camParent = Multiplayer.all.find(o => o.id === multiplayerId);
            cam.parent = camParent.mesh;
            cam.position.y = 8;
            cam.billboardMode = Mesh.BILLBOARDMODE_ALL;

            // Set webcam to a material to display on the plane
            const camMat = new StandardMaterial("camMaterial", this._scene);
            camMat.diffuseTexture = new VideoTexture("camTexture", video, this._scene);
            camMat.specularColor = new Color3(0, 0, 0);
            camMat.roughness = 1;
            camMat.emissiveColor = Color3.White();
            cam.material = camMat;

            // Create sound from microphone
            let micSound = new Sound("mic-sound", event.stream, this._scene,  () => {

            }, { loop: true, autoplay: true, spatialSound: true});

            // Sound will now follow the mesh position
            micSound.attachToMesh(camParent.mesh);

        }

        let gotMessageFromServer = (fromId, message) => {
            // Parse the incoming signal
            const signal = JSON.parse(message)

            // Make sure it's not coming from yourself
            if (fromId != this.socketId) {
                if (signal.sdp) {
                    this.connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                        if (signal.sdp.type == 'offer') {
                            this.connections[fromId].createAnswer().then((description) => {
                                this.connections[fromId].setLocalDescription(description).then(() => {
                                    this.socket.emit('signal', fromId, JSON.stringify({'sdp': this.connections[fromId].localDescription}));
                                }).catch(e => console.log(e));
                            }).catch(e => console.log(e));
                        }
                    }).catch(e => console.log(e));
                }

                if (signal.ice) {
                    this.connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
                }
            }
        }

        // Toggle mute microphone
        const muteButton = document.querySelector("#muteButton");
        muteButton.addEventListener("click", () => {
            const enabled = this.localStream.getAudioTracks()[0].enabled;
            if (enabled) {
                this.localStream.getAudioTracks()[0].enabled = false;
                muteButton.innerHTML = `<i class="fas fa-microphone-slash"></i>`;
            } else {
                this.localStream.getAudioTracks()[0].enabled = true;
                muteButton.innerHTML = `<i class="fas fa-microphone"></i>`;
            }
        });

        // Toggle view of video stream current player
        const stopVideo = document.querySelector("#stopVideo");
        stopVideo.addEventListener("click", () => {
            const enabled = this.localStream.getVideoTracks()[0].enabled;
            if (enabled) {
                this.localStream.getVideoTracks()[0].enabled = false;
                stopVideo.innerHTML = `<i class="fas fa-video-slash"></i>`;
            } else {
                this.localStream.getVideoTracks()[0].enabled = true;
                stopVideo.innerHTML = `<i class="fas fa-video"></i>`;
            }
        });

        this.localVideo = document.querySelector('video#localVideo');
        this.localVideo.muted = true;

        const constraints = {
            video: true,
            audio: true,
        };

        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(constraints)
                .then(getUserMediaSuccess)
                .then(() => {

                    this.socket = io("http://localhost:8443", {
                        withCredentials: true
                    });
                    this.socket.on('signal', gotMessageFromServer);

                    this.socket.on('connect', () => {
                        console.log("user media connected");

                        this.socketId = this.socket.id;

                        this.socket.on('user-left', (id) => {
                            let video = document.querySelector('[data-socket="' + id + '"]');
                            let parentDiv = video.parentElement;
                            video.parentElement.parentElement.removeChild(parentDiv);
                        });

                        // Send multiplayer id to socket.io server
                        this.socket.emit('multiplayerId', Socket.multiplayerId);

                        this.socket.on('user-joined', (id, count, clients, clientsMultiplayer) => {
                            // console.log("a user has joined with id: ", id);
                            // console.log("clients: ", clients);
                            // console.log("count: ", count);
                            // console.log("MultiplayerId: ", clientsMultiplayer);
                            clientsMultiplayer.forEach((socketListId) => {
                                if (!this.connections[socketListId[0]]) {
                                    this.connections[socketListId[0]] = new RTCPeerConnection(this.peerConnectionConfig);
                                    // Wait for other users ice candidate
                                    this.connections[socketListId[0]].onicecandidate = (event) => {
                                        if (event.candidate != null) {
                                            console.log('SENDING ICE');
                                            this.socket.emit('signal', socketListId[0], JSON.stringify({'ice': event.candidate}));
                                        }
                                    }

                                    // Wait for video stream from other users
                                    this.connections[socketListId[0]].onaddstream = (event) => {
                                        gotRemoteStream(event, socketListId[0], socketListId[1]);
                                    }

                                    // Add the local video stream
                                    this.connections[socketListId[0]].addStream(this.localStream);
                                }
                            });
                            // Create an offer to connect with local description
                            if (count >= 2) {
                                this.connections[id].createOffer().then((description) => {
                                    this.connections[id].setLocalDescription(description).then(() => {
                                        // console.log(connections);
                                        this.socket.emit('signal', id, JSON.stringify({'sdp': this.connections[id].localDescription}));
                                    }).catch(e => console.log(e));
                                });
                            }
                        });
                    })
                });
        } else {
            alert('Your browser does not support getUserMedia API');
        }
    }
}
