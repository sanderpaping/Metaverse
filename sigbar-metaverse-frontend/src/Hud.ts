import {AdvancedDynamicTexture} from "@babylonjs/gui";
import {Effect, PostProcess, Scene} from "@babylonjs/core";

export class Hud {

    private _scene: Scene;

    //UI elements
    public fadeLevel: number;
    private _spaceMenu: HTMLDivElement;
    private _peopleMenu: HTMLDivElement;
    private _video: HTMLDivElement;
    private _pauseMenu: HTMLDivElement;
    private _profileMenu: HTMLDivElement;
    private _infoMenu: HTMLDivElement;
    private _spaceDashboardMenu: HTMLDivElement;
    private _canvas: HTMLCanvasElement;

    //Pause toggle
    public gamePaused: boolean;

    public quit: boolean;
    public transition: boolean = false;

    constructor(scene: Scene) {

        this._scene = scene;

        this._spaceMenu = document.querySelector("div.spacesMenu");
        this._peopleMenu = document.querySelector("div.peopleMenu");
        this._video = document.querySelector("div#video");
        this._canvas = document.querySelector("canvas#gameCanvas");

        let hud1: HTMLDivElement = document.querySelector("div#hud");
        hud1.style.display = "block";
        document.getElementById("video").style.display = "block";

        let spacesTitle = document.querySelector("h3#spaceTitle");
        let peopleTitle = document.querySelector("h3#peopleTitle");
        spacesTitle.innerHTML = "Spaces";
        peopleTitle.innerHTML = "People";

        let logo = document.createElement("img");
        logo.id = "logo";
        logo.src = "/sprites/sigbar-logo.svg";
        hud1.appendChild(logo);

        let homeActive = true;

        // Homebutton for showing the world
        let homeBtn = document.querySelector("div#homeBtn");
        homeBtn.addEventListener("click", () => {
            this.gamePaused = false;
            if (!homeActive){
                profileBtn.classList.remove("active");
                homeBtn.classList.add("active")
                profileActive = false;
                homeActive = true;
            }
            this._pauseMenu.style.display = "none";
            this._infoMenu.style.display = "none";
            this._profileMenu.style.display = "none";
            this._spaceDashboardMenu.style.display = "none";
            this._spaceMenu.style.display = "block";
            this._peopleMenu.style.display = "block";
            this._video.style.display = "block";
            document.getElementById("video").classList.remove("space");

            if(typeof(document.querySelectorAll("div.remoteVideo")) != 'undefined' && document.querySelectorAll("div.remoteVideo") != null){
                let remoteVideos = document.querySelectorAll("div.remoteVideo");

                remoteVideos.forEach((i:HTMLDivElement) => {
                    i.style.display = "none";
                });
            }

            this._canvas.focus();

        })

        let profileActive = false;

        // ProfileButton to show profileMenu
        let profileBtn: HTMLButtonElement = document.querySelector("div#profileBtn");
        profileBtn.addEventListener("click", () => {

            if (!profileActive){
                profileBtn.classList.add("active");
                homeBtn.classList.remove("active")
                profileActive = true;
                homeActive = false;
            }

            this._profileMenu.style.display = "block";
            this._infoMenu.style.display = "none";
            this._pauseMenu.style.display = "none";
            this._spaceDashboardMenu.style.display = "none";
            this._spaceMenu.style.display = "none";
            this._peopleMenu.style.display = "none";
            this._video.style.display = "none";
            document.getElementById("video").classList.remove("space");

            if(typeof(document.querySelectorAll("div.remoteVideo")) != 'undefined' && document.querySelectorAll("div.remoteVideo") != null){
                let remoteVideos = document.querySelectorAll("div.remoteVideo");

                remoteVideos.forEach((i:HTMLDivElement) => {
                    i.style.display = "none";
                });
            }

            this.gamePaused = true;
        });

        // LocationButton to show current location
        let locationBtn: HTMLButtonElement = document.querySelector("div#locationBtn");
        locationBtn.addEventListener('click', () => {
            // alert("locatie is....");
        });

        // InfoButton for controls
        let infoBtn: HTMLButtonElement = document.querySelector("div#infoBtn");
        infoBtn.addEventListener('click', () => {
            this._infoMenu.style.display = "block";
            this._pauseMenu.style.display = "none";
            this._profileMenu.style.display = "none";
            this._spaceDashboardMenu.style.display = "none";
            document.getElementById("video").classList.remove("space");

            if(typeof(document.querySelectorAll("div.remoteVideo")) != 'undefined' && document.querySelectorAll("div.remoteVideo") != null){
                let remoteVideos = document.querySelectorAll("div.remoteVideo");

                remoteVideos.forEach((i:HTMLDivElement) => {
                    i.style.display = "none";
                });
            }

            this._spaceMenu.style.display = "none";
            this._peopleMenu.style.display = "none";
            this._video.style.display = "none";

            // set game to pause
            this.gamePaused = true;
        });

        // SettingsButton for changing settings
        let settingsBtn: HTMLButtonElement = document.querySelector("div#settingsBtn");
        settingsBtn.addEventListener('click', () => {
            this._pauseMenu.style.display = "block";
            this._infoMenu.style.display = "none";
            this._profileMenu.style.display = "none";
            this._spaceDashboardMenu.style.display = "none";
            document.getElementById("video").classList.remove("space");

            if(typeof(document.querySelectorAll("div.remoteVideo")) != 'undefined' && document.querySelectorAll("div.remoteVideo") != null){
                let remoteVideos = document.querySelectorAll("div.remoteVideo");

                remoteVideos.forEach((i:HTMLDivElement) => {
                    i.style.display = "none";
                });
            }

            this._spaceMenu.style.display = "none";
            this._peopleMenu.style.display = "none";
            this._video.style.display = "none";
            homeActive = false
            homeBtn.classList.remove("active")

            // Set game to pause
            this.gamePaused = true;
        });

        // Fullscreen toggle
        let isFullScreen = false
        let fullscreenBtn: HTMLButtonElement = document.querySelector("div#fullscreenBtn");
        fullscreenBtn.addEventListener('click', () => {

                if (!isFullScreen) {
                    document.body.requestFullscreen();
                    fullscreenBtn.innerHTML = `<i class="fas fa-compress"></i>`;
                    isFullScreen = true;
                }
                else {
                    document.exitFullscreen();
                    fullscreenBtn.innerHTML = `<i class="fa-solid fa-expand"></i>`;
                    isFullScreen = false;
                }
            });

        this._createPauseMenu();
        this._createProfileMenu();
        this._createInfoMenu();
        this._createLocationAlert();
        this._spaceDashboard();
    }

    private _createPauseMenu(): void {
        this.gamePaused = false;

        this._pauseMenu = document.createElement("div");
        this._pauseMenu.className = "pauseMenu";
        document.querySelector('#hud').appendChild(this._pauseMenu);

        const topBar = document.createElement("div");
        topBar.className = "topBar";
        this._pauseMenu.appendChild(topBar);

        const title = document.createElement("div");
        title.className = "title";
        title.innerHTML = "Pause menu";
        topBar.appendChild(title);

        const exitCross = document.createElement("div");
        exitCross.className = "exitCross";
        exitCross.innerHTML = '<i class="fas fa-x"></i>';
        exitCross.addEventListener('click', () => {
            this._spaceMenu.style.display = "block";
            this._peopleMenu.style.display = "block";
            this._video.style.display = "block";
            this._pauseMenu.style.display = "none";

            //homebutton active maken
            // Game unpaused
            this.gamePaused = false;
            this._canvas.focus();
        });
        topBar.appendChild(exitCross);

        const leftPanelTop = document.createElement("div");
        leftPanelTop.className = "leftPanelTop";
        this._pauseMenu.appendChild(leftPanelTop);

        const leftTopPanelTitle = document.createElement("div");
        leftTopPanelTitle.id = "leftTopTitle";
        leftTopPanelTitle.innerHTML = "Audio";
        leftPanelTop.appendChild(leftTopPanelTitle);

        const audioInputSelect = document.createElement("select");
        audioInputSelect.id = "audioSource";
        leftPanelTop.appendChild(audioInputSelect);

        const leftPanelBottom = document.createElement("div");
        leftPanelBottom.className = "leftPanelBottom";
        this._pauseMenu.appendChild(leftPanelBottom);

        const leftBottomPanelTitle = document.createElement("div");
        leftBottomPanelTitle.id = "leftBottomTitle";
        leftBottomPanelTitle.innerHTML = "Video";
        leftPanelBottom.appendChild(leftBottomPanelTitle);

        const videoInputSelect = document.createElement("select");
        videoInputSelect.id = "videoSource";
        leftPanelBottom.appendChild(videoInputSelect);

        const rightPanel = document.createElement("div");
        rightPanel.className = "rightPanel";
        this._pauseMenu.appendChild(rightPanel);

        const rightPanelTitle = document.createElement("div");
        rightPanelTitle.id = "rightTitle";
        rightPanelTitle.innerHTML = "Graphics";
        rightPanel.appendChild(rightPanelTitle);
    }

    private _createProfileMenu(): void {
        this.gamePaused = false;

        this._profileMenu = document.createElement("div");
        this._profileMenu.className = "profileMenu";
        document.querySelector('#hud').appendChild(this._profileMenu);

        const topBar = document.createElement("div");
        topBar.className = "topBar";
        this._profileMenu.appendChild(topBar);

        const title = document.createElement("div");
        title.className = "title";
        title.innerHTML = "Profile menu";
        topBar.appendChild(title);

        const exitCross = document.createElement("div");
        exitCross.className = "exitCross";
        exitCross.innerHTML = '<i class="fas fa-x"></i>';
        exitCross.addEventListener('click', () => {
            this._spaceMenu.style.display = "block";
            this._peopleMenu.style.display = "block";
            this._video.style.display = "block";
            this._profileMenu.style.display = "none";

            // Game unpaused
            this.gamePaused = false;
            this._canvas.focus();
        });
        topBar.appendChild(exitCross);

        const leftPanel = document.createElement("div");
        leftPanel.className = "leftPanel";
        this._profileMenu.appendChild(leftPanel);

        const leftPanelTitle = document.createElement("div");
        leftPanelTitle.id = "leftTitle";
        leftPanelTitle.innerHTML = "Profile";
        leftPanel.appendChild(leftPanelTitle);

        const rightPanel = document.createElement("div");
        rightPanel.className = "rightPanel";
        this._profileMenu.appendChild(rightPanel);

        const rightPanelTitle = document.createElement("div");
        rightPanelTitle.id = "rightTitle";
        rightPanelTitle.innerHTML = "Logout";
        rightPanel.appendChild(rightPanelTitle);

        // Set up transition effect
        Effect.RegisterShader("fade",
            "precision highp float;" +
            "varying vec2 vUV;" +
            "uniform sampler2D textureSampler; " +
            "uniform float fadeLevel; " +
            "void main(void){" +
            "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
            "baseColor.a = 1.0;" +
            "gl_FragColor = baseColor;" +
            "}");
        this.fadeLevel = 1.0;

        const quitBtn1 = document.createElement("button");
        quitBtn1.id = "quitBtn";
        quitBtn1.className = "button";
        quitBtn1.innerHTML = "QUIT";
        rightPanel.appendChild(quitBtn1);
        quitBtn1.addEventListener('click', () => {
            this._profileMenu.style.display = "none";
            const postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._scene.getCameraByName("cam"));
            postProcess.onApply = (effect) => {
                effect.setFloat("fadeLevel", this.fadeLevel);
                location.reload();
            };
            this.transition = true;
        });

    }

    private _createInfoMenu(): void {
        this.gamePaused = false;

        this._infoMenu = document.createElement("div");
        this._infoMenu.className = "infoMenu";
        document.querySelector('#hud').appendChild(this._infoMenu);

        const topBar = document.createElement("div");
        topBar.className = "topBar";
        this._infoMenu.appendChild(topBar);

        const title = document.createElement("div");
        title.className = "title";
        title.innerHTML = "Controls";
        topBar.appendChild(title);

        const exitCross = document.createElement("div");
        exitCross.className = "exitCross";
        exitCross.innerHTML = '<i class="fas fa-x"></i>';
        exitCross.addEventListener('click', () => {
            this._spaceMenu.style.display = "block";
            this._peopleMenu.style.display = "block";
            this._video.style.display = "block";
            this._infoMenu.style.display = "none";

            // Game unpaused
            this.gamePaused = false;
            this._canvas.focus();
        });
        topBar.appendChild(exitCross);

        const leftPanel = document.createElement("div");
        leftPanel.className = "leftPanel";
        this._infoMenu.appendChild(leftPanel);

        const leftPanelTitle = document.createElement("div");
        leftPanelTitle.id = "leftTitle";
        leftPanelTitle.innerHTML = "Controls";
        leftPanel.appendChild(leftPanelTitle);

        const infoUpAndDown = document.createElement("div");
        infoUpAndDown.className = "upAndDown";
        infoUpAndDown.innerHTML = "E and Q can be used to move the character up and down.";
        leftPanel.appendChild(infoUpAndDown);

        const infoMovement = document.createElement("div");
        infoMovement.className = "movement";
        infoMovement.innerHTML = "The W S A D key can be used to move the character.";
        leftPanel.appendChild(infoMovement);

        const infoSpace = document.createElement("div");
        infoSpace.className = "infoSpace";
        infoSpace.innerHTML = "Use Space to look around. ";
        leftPanel.appendChild(infoSpace);

        const infoShift = document.createElement("div");
        infoShift.className = "infoShift";
        infoShift.innerHTML = "Shift can be used in combination with the movement keys to move faster.";
        leftPanel.appendChild(infoShift);

        const key = (input) => {
            const key = document.createElement("div");
            key.className = "key";
            key.classList.add(input);
            const inner = document.createElement("div");
            inner.className = "inner";
            inner.innerHTML = input.toUpperCase();
            key.appendChild(inner);
            leftPanel.appendChild(key);
        }

        key("Q");
        key("E");
        key("W");
        key("S");
        key("A");
        key("D");
        key("space");
        key("shift");

        const rightPanel = document.createElement("div");
        rightPanel.className = "rightPanel";
        this._infoMenu.appendChild(rightPanel);

        const rightPanelTitle = document.createElement("div");
        rightPanelTitle.id = "rightTitle";
        rightPanelTitle.innerHTML = "Info";
        rightPanel.appendChild(rightPanelTitle);

        const info = document.createElement("div");
        info.className = "info";
        info.innerHTML = " Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. " +
            "Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. " +
            "Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. " +
            "Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. " +
            "Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. " +
            "Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. " +
            "Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. ";
        rightPanel.appendChild(info);

    }

    private _createLocationAlert(): void {

    }

    private _spaceDashboard(): void {
        this.gamePaused = false;

        this._spaceDashboardMenu = document.createElement("div");
        this._spaceDashboardMenu.className = "dashBoard";
        document.querySelector('#hud').appendChild(this._spaceDashboardMenu);

        const iconMenu = document.createElement("div");
        iconMenu.className = "iconMenu";
        this._spaceDashboardMenu.appendChild(iconMenu);

        const tab = (name, iconFA, position, active, layout) => {
            const icon = document.createElement("div");
            icon.className = "menuIcon";
            if(active){
                icon.classList.add("active");
            }
            icon.innerHTML = iconFA;
            icon.classList.add(position);
            iconMenu.appendChild(icon);

            const tab = document.createElement("div");
            tab.className = "tab";
            this._spaceDashboardMenu.appendChild(tab);

            icon.addEventListener('click', () => {
                let allIcons = document.querySelectorAll("div.menuIcon");

                allIcons.forEach(i => {
                    i.classList.remove("active");
                });
                icon.classList.add("active");


                let tabcontent = document.querySelectorAll("div.tab");
                tabcontent.forEach(i => {
                    i.classList.remove("active");
                });
                tab.classList.add("active");

            });

            switch (layout){
                case 1:

                    const panel = document.createElement("div");
                    panel.className = "panel";
                    tab.appendChild(panel);

                    const panelTitle = document.createElement("div");
                    panelTitle.id = "panelTitle";
                    panelTitle.innerHTML = "Scherm delen";
                    panel.appendChild(panelTitle);

                    const stackPanel = document.createElement("div");
                    stackPanel.id = "stackPanel";
                    panel.appendChild(stackPanel);

                    const shareButton = document.createElement("button");
                    shareButton.className = "button";
                    shareButton.innerHTML = "scherm delen";
                    stackPanel.appendChild(shareButton);

                    if(active){
                        tab.classList.add("active");
                    }
                    break;
                case 2:

                    const leftPanel = document.createElement("div");
                    leftPanel.className = "leftPanel";
                    tab.appendChild(leftPanel);

                    const leftPanelTitle = document.createElement("div");
                    leftPanelTitle.id = "leftTitle";
                    leftPanelTitle.innerHTML = "Screen 1";
                    leftPanel.appendChild(leftPanelTitle);

                    const rightPanel = document.createElement("div");
                    rightPanel.className = "rightPanel";
                    tab.appendChild(rightPanel);

                    const rightPanelTitle = document.createElement("div");
                    rightPanelTitle.id = "rightTitle";
                    rightPanelTitle.innerHTML = "Screen 3";
                    rightPanel.appendChild(rightPanelTitle);

                    if(active){
                        tab.classList.add("active");
                    }

                    break;
                case 3:

                    const leftPanelThree = document.createElement("div");
                    leftPanelThree.className = "leftPanelThree";
                    tab.appendChild(leftPanelThree);

                    const leftPanelTitleThree = document.createElement("div");
                    leftPanelTitleThree.id = "leftTitleThree";
                    leftPanelTitleThree.innerHTML = "Screen 1";
                    leftPanelThree.appendChild(leftPanelTitleThree);

                    const textLeft = document.createElement("div");
                    textLeft.className = "infoLeftPanel";
                    textLeft.innerHTML = " Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. " +
                        "Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. " +
                        "Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. " +
                        "Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. ";
                    leftPanelThree.appendChild(textLeft);

                    const leftPanelimage = document.createElement("img");
                    leftPanelimage.className = "leftPanelImage";
                    leftPanelimage.src = "/sprites/sigbar.jpg";
                    leftPanelThree.appendChild(leftPanelimage);

                    const middlePanel = document.createElement("div");
                    middlePanel.className = "middlePanel";
                    tab.appendChild(middlePanel);

                    // const middlePanelTitle = document.createElement("div");
                    // middlePanelTitle.id = "middleTitle";
                    // middlePanelTitle.innerHTML = "Screen 2";
                    // middlePanel.appendChild(middlePanelTitle);

                    const image = document.createElement("img");
                    image.className = "image";
                    image.src = "/sprites/sigbar.jpg";
                    middlePanel.appendChild(image);

                    const image2 = document.createElement("img");
                    image2.className = "image2";
                    image2.src = "/sprites/start2.jpg";
                    middlePanel.appendChild(image2);

                    const rightPanelThree = document.createElement("div");
                    rightPanelThree.className = "rightPanelThree";
                    tab.appendChild(rightPanelThree);

                    const rightPanelTitleThree = document.createElement("div");
                    rightPanelTitleThree.id = "rightTitleThree";
                    rightPanelTitleThree.innerHTML = "Screen 3";
                    rightPanelThree.appendChild(rightPanelTitleThree);

                    const info = document.createElement("div");
                    info.className = "infoRightPanel";
                    info.innerHTML = " Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. " +
                        "Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. " +
                        "Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. " +
                        "Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. " +
                        "Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. " +
                        "Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. " +
                        "Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. ";
                    rightPanelThree.appendChild(info);

                    if(active){
                        tab.classList.add("active");
                    }
                    break;
                default: break;
            }
        }

        tab("dashboardMenu", "<i class=\"fas fa-table-columns\"></i>", "first", true, 3);
        tab("screenSharing", "<i class=\"fas fa-display\"></i>", "second", false, 1);
        tab("address", "<i class=\"fas fa-address-book\"></i>", "third", false, 2);
        // tab("play", "<i class=\"fas fa-play\"></i>", "fourth", false, 1);



        const topBar = document.createElement("div");
        topBar.className = "topBar";
        this._spaceDashboardMenu.appendChild(topBar);

        const title = document.createElement("div");
        title.className = "spaceTitle";
        title.innerHTML = "Controls";
        topBar.appendChild(title);

        const exitCross = document.createElement("div");
        exitCross.className = "exitCross";
        exitCross.innerHTML = '<i class="fas fa-x"></i>';
        exitCross.addEventListener('click', () => {
            this._spaceMenu.style.display = "block";
            this._peopleMenu.style.display = "block";
            this._video.style.display = "block";
            this._spaceDashboardMenu.style.display = "none";
            document.getElementById("video").classList.remove("space");

            if(typeof(document.querySelectorAll("div.remoteVideo")) != 'undefined' && document.querySelectorAll("div.remoteVideo") != null){
                let remoteVideos = document.querySelectorAll("div.remoteVideo");

                remoteVideos.forEach((i:HTMLDivElement) => {
                    i.style.display = "none";
                });
            }

            // Game unpause
            this.gamePaused = false;
            this._canvas.focus();
        });
        topBar.appendChild(exitCross);

        // Horizontal line above local video
        const hr = document.createElement("hr");
        hr.id = "hr";
        this._spaceDashboardMenu.appendChild(hr);

    }
}