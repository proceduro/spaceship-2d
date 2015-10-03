"use strict";

var fs = require("fs");
let ship2d = require("../../spaceship2d");

let displayResolution = 512;

let shipCount = 9;

window.onload = function(){

    window.onerror = function(e) {
        toastr.error(e);
        return false;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Controls ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////
    let ControlsMenu = function() {
        this.startOver = function() {
            for (var i = 0; i < shipCount; i++) {
                ships[i] = ship2d.generateShip();
            }
            render();
        }
        this.baseColor = 0.1;
        this.colorVariation = 0.1;
        this.shapeMutation = 0.25;
        this.resetMutation = function() {
            this.baseColor = 0.1;
            this.colorVariation = 0.1;
            this.shapeMutation = 0.25;
        };
        this.help = function() {
            showHelp();
        }
    };

    var menu = new ControlsMenu();
    var gui = new dat.GUI({
        autoPlace: false,
        width: 308
    });
    gui.add(menu, 'startOver').name("Start Over");
    gui.add(menu, 'resetMutation').name("Reset Mutation Rates");
    gui.add(menu, 'baseColor', 0, 1).name("Base Color Mutation").listen();
    gui.add(menu, 'colorVariation', 0, 1).name("Detail Color Mutation").listen();
    gui.add(menu, 'shapeMutation', 0, 1).name("Shape Mutation").listen();
    gui.add(menu, 'help').name("Help");
    document.getElementById("controls-container").appendChild(gui.domElement);

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Rendering ///////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////
    let spriteContainer = document.getElementById("sprite-container");

    let canvases = [];
    let saveIcons = [];
    for (let i = 0; i < shipCount; i++) {
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = 768;
        canvas.style.width = canvas.style.height = "256px";
        canvas.style.paddingRight = "32px";
        spriteContainer.appendChild(canvas);
        canvas.id = i;
        canvas.onclick = function() {
            let id = parseInt(canvas.id);
            for (let j = 0; j < shipCount; j++) {
                if (j == id) {
                    continue;
                }
                ships[j] = ship2d.mutateShip(ships[id], menu.baseColor, menu.colorVariation, menu.shapeMutation);
            }
            render();
        };
        canvases.push(canvas);
        let img = document.createElement("img");
        img.number = i;
        saveIcons.push(img);
        img.src = "static/img/save-icon.png";
        img.style.position = "relative";
        img.style.left = "-32px";
        img.style.marginRight = "-32px";
        img.style.top = "-32px";
        img.style.marginBottom = "-32px";
        spriteContainer.appendChild(img);
        $(img).fadeOut(0);
        img.onclick = function() {
            let diag = vex.open({
                content: fs.readFileSync(__dirname + "/save-dialog.html", "utf8")
            });
            let id = parseInt(img.number);
            function _render() {
                console.log("render");
                let ship = ships[id];
                saveRenderer.render(ship);
                let container = document.getElementById("save-dialog-render-container");
                container.innerHTML = "";
                saveRenderer.colorSprite.className = "save-dialog-sprite";
                saveRenderer.normalSprite.className = "save-dialog-sprite";
                saveRenderer.depthSprite.className = "save-dialog-sprite";
                saveRenderer.positionSprite.className = "save-dialog-sprite";
                container.appendChild(saveRenderer.colorSprite);
                container.appendChild(saveRenderer.normalSprite);
                container.appendChild(saveRenderer.depthSprite);
                container.appendChild(saveRenderer.positionSprite);
            }
            _render();
            document.getElementById("save-dialog-resolution").onchange = function() {
                saveRenderer = new ship2d.Renderer({
                    resolution: parseInt(this.value)
                });
                _render();
            }
        }
        $(canvas).hover(function() {
            $(img).fadeIn(0);
        }, function() {
            $(img).fadeOut(0);
        });
        $(img).hover(function() {
            $(img).fadeIn(0);
        }, function() {
            $(img).fadeOut(0);
        });
    }

    let ships = [];
    for (let i = 0; i < shipCount; i++) {
        ships.push(ship2d.generateShip());
    }

    let displayRenderer = new ship2d.Renderer({
        resolution: displayResolution
    });

    let saveRenderer = new ship2d.Renderer({
        resolution: menu.resolution
    });

    render();

    function render() {
        for (let i = 0; i < shipCount; i++) {
            let ship = ships[i];
            let canvas = canvases[i];
            displayRenderer.render(ship);
            canvas.width = canvas.height = displayResolution;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(displayRenderer.colorSprite, 0, 0);
        }
    }

    function showHelp() {
        let diag = vex.open({
            content: fs.readFileSync(__dirname + "/help-dialog.html", "utf8")
        });
    }



};
