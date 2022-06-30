import {ILoadingScreen} from "@babylonjs/core";

export class CustomLoadingScreen implements  ILoadingScreen {

    loadingUIBackgroundColor: string;
    loadingUIText: string;
    private _loadingDiv: HTMLElement;

    constructor() {

    }

    displayLoadingUI(): void{
        if (document.getElementById("customLoadingScreenDiv")) {
            // Do not add a loading screen if there is already one
            document.getElementById("customLoadingScreenDiv").style.display = "initial";
            return;
        }
        this._loadingDiv = document.createElement("div");
        this._loadingDiv.id = "customLoadingScreenDiv";
        // this._loadingDiv.innerHTML = "<img src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Loadingsome.gif/600px-Loadingsome.gif' />";
        this._loadingDiv.innerHTML = '<div class="loader">\n' +
            '  <div class="duo duo1">\n' +
            '    <div class="dot dot-a"></div>\n' +
            '    <div class="dot dot-b"></div>\n' +
            '  </div>\n' +
            '  <div class="duo duo2">\n' +
            '    <div class="dot dot-a"></div>\n' +
            '    <div class="dot dot-b"></div>\n' +
            '  </div>\n' +
            '</div>\n' +
            '<img id="loadingLogo" src="/sprites/sigbar-logo.svg" />';
        document.body.appendChild(this._loadingDiv);
    }

    hideLoadingUI(): void {
        document.getElementById("customLoadingScreenDiv").style.display = "none";
    }
}