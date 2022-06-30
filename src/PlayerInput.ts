import {ActionManager, ExecuteCodeAction, KeyboardEventTypes, Scene} from "@babylonjs/core";
import {Hud} from "./Hud";


export class PlayerInput {

    public inputMap: KeyboardEventTypes;
    private readonly _scene: Scene;
    private _ui: Hud;

    public up: number = 0;
    public down: number = 0;
    public look: number = 0;
    public left: number = 0;
    public right: number = 0;
    public forward: number = 0;
    public back: number = 0;
    public run: number = 0;
    public fly: number = 0;

    constructor(scene:Scene , ui:Hud) {
        this._scene = scene;
        this._ui = ui;

        this._scene.actionManager = new ActionManager(this._scene);

        this.inputMap = {};
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) =>{
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        this._scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        // this._scene.onKeyboardObservable.add((kbInfo) => {
        //     switch (kbInfo.type) {
        //         case KeyboardEventTypes.KEYDOWN:
        //             console.log("KEY DOWN: ", kbInfo.event.key);
        //             break;
        //         case KeyboardEventTypes.KEYUP:
        //             console.log("KEY UP: ", kbInfo.event.code);
        //             break;
        //     }
        // });

        this._scene.onBeforeRenderObservable.add(() =>{
            this._updateFromKeyboard();
            this._updateFromMouse();
            this._getInputUi();
        })
    }
    private _updateFromKeyboard(): void {
        //forward and backwards
        if (this.inputMap["w"] && !this._ui.gamePaused) {
            this.forward = 1
            this.back = 0;
        } else if (this.inputMap["s"] && !this._ui.gamePaused) {
            this.back = 1;
            this.forward = 0;
        } else {
            this.forward = 0;
            this.back = 0;
        }
        // left and right
        if (this.inputMap["a"] && !this._ui.gamePaused) {
            this.left = 1;
            this.right = 0;
        } else if (this.inputMap["d"] && !this._ui.gamePaused) {
            this.right = 1;
            this.left = 0;
        }
        else {
            this.left = 0;
            this.right = 0;
        }

        //up
        if (this.inputMap["e"] && !this._ui.gamePaused) {
            this.up = 1;
        } else{
            this.up = 0;
        }
        if (this.inputMap["Shift"] && !this._ui.gamePaused) {
            this.run = 1;
        }
        else {
            this.run = 0;
        }

        //down
        if (this.inputMap["q"] && !this._ui.gamePaused) {
            this.down = 1;
        } else {
            this.down = 0;
        }

        //free look
        if (this.inputMap[" "] && !this._ui.gamePaused) {
            this.look = 1;
        } else {
            this.look = 0;
        }

        const canvasEngine = this._scene.getEngine();

        if(this.forward || this.back || this.left || this.right || this.look || this.up || this.down){
            canvasEngine.enterPointerlock();
        } else {
            canvasEngine.exitPointerlock();
        }
    }

    private _updateFromMouse(): void {
        this._scene.onPointerMove = function (evt) {

        };
        if(!this._ui.gamePaused){
            this._scene.onPointerDown = function (evt) {
                // if (evt.button === 0) this._engine.exitPointerlock();
                // if(evt.button === 2) this._engine.exitPointerlock();
            };
        }
    }


    private _getInputUi(): void {
        // this._ui.flyToSpaceBtn.onPointerDownObservable.add(() => {
        //
        // });
        // this._ui.profileBtn.onPointerDownObservable.add(() => {
        //     this.fly = 1;
        // })
        // this._ui.profileBtn.onPointerUpObservable.add(() => {
        //     this.fly = 0;
        // });
    }
}