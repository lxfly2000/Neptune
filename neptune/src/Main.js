var thisRef = this;


window.onerror = function (msg, url, line, col, error) {
    var errmsg = "file:" + url + "<br>line:" + line + " " + msg;
    l2dError(errmsg);
};

function start() {
    this.platform = window.navigator.platform.toLowerCase();

    this.live2DMgr = new LAppLive2DManager();

    this.isDrawStart = false;

    this.gl = null;
    this.canvas = null;

    this.dragMgr = null;
    /*new L2DTargetPoint();*/
    this.viewMatrix = null;
    /*new L2DViewMatrix();*/
    this.projMatrix = null;
    /*new L2DMatrix44()*/
    this.deviceToScreen = null;
    /*new L2DMatrix44();*/

    this.drag = false;
    this.oldLen = 0;

    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.isModelShown = false;


    initL2dCanvas("gl-canvas");
    initListener();
    init();

    setTimeout(function () {
        // Just for viewing via browser
        if (!window.wallpaperPropertyListener.called) {
            MyTools.setCustomModelEnabled(false);
            MyTools.scale(1);
        }
    }, 500);
}


function initL2dCanvas(canvasId) {
    this.canvas = document.getElementById(canvasId);
}

function initListener() {
    $('body').on('mousedown mouseup mouseout', mouseEvent);

    //Click event can be caught in another way
//    this.eventTarget.addEventListener("click", mouseEvent, false);

    //These events is useless, see comments in mouseEvent()
//     eventTarget.addEventListener("mousewheel", mouseEvent, false);
//     eventTarget.addEventListener("contextmenu", mouseEvent, false);

    //These are events in mobile browsers, also useless for WE
//     eventTarget.addEventListener("touchstart", touchEvent, false);
//     eventTarget.addEventListener("touchend", touchEvent, false);
//     eventTarget.addEventListener("touchmove", touchEvent, false);

    //Currently no model changing
//    btnChangeModel = document.getElementById("btnChange");
//    btnChangeModel.addEventListener("click", function (e) {
//        changeModel();
//    });
}

function init() {
    //For scaling and translating not only models(like SDK did) but also canvas, I added some variants for use.
    //But the algorithm and relations between them are so f**king complex that confuse me so much.
    //I don't even know some of them work for why.

    var taskBarHeight = screen.height - screen.availHeight;
    document.getElementById("myconsole").style.bottom = taskBarHeight + 'px';

    //A temporary way to fix problems with 21:9 resolutions.
    var ultraWide = screen.width / screen.height > 2;

    //Why 0.618??? ----------------------> IT'S GOD'S CHOICE
    var l2dViewToCanvasScale = 0.618;

    MyTools.canvasLastHeight = MyTools.canvasBaseHeight = ultraWide ? screen.height * 1.5 : screen.height;
    MyTools.canvasLastWidth = MyTools.canvasBaseWidth = l2dViewToCanvasScale * screen.width;
    var ratio = MyTools.canvasBaseHeight / MyTools.canvasBaseWidth;

    //Set canvas' size as screen's to trick the 'drawing' system (or anything)
    //-for setting the max drawing size as screen's.
    //Otherwise some of the model may be clipped after scaling.
    this.canvas.width = screen.width;
    this.canvas.height = screen.height;

    this.dragMgr = new L2DTargetPoint();

    var left = LAppDefine.VIEW_LOGICAL_LEFT;
    var right = LAppDefine.VIEW_LOGICAL_RIGHT;
    var bottom = -ratio;
    var top = ratio;

    this.viewMatrix = new L2DViewMatrix();
    this.viewMatrix.setScreenRect(left, right, bottom, top);
    this.viewMatrix.setMaxScreenRect(
        LAppDefine.VIEW_LOGICAL_MAX_LEFT,
        LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
        LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
        LAppDefine.VIEW_LOGICAL_MAX_TOP);

    this.viewMatrix.setMaxScale(/*LAppDefine.VIEW_MAX_SCALE*/2);
    this.viewMatrix.setMinScale(/*LAppDefine.VIEW_MIN_SCALE*/0.01);

    this.projMatrix = new L2DMatrix44();

    //Why 0.8??? IT'S... you know.
    var offsetY = ultraWide ? 0.8 * l2dViewToCanvasScale : 0;
    this.projMatrix.translate(-l2dViewToCanvasScale * l2dViewToCanvasScale, offsetY);
    this.projMatrix.scale(l2dViewToCanvasScale, l2dViewToCanvasScale * (this.canvas.width / this.canvas.height));

    var horPixelsToLogical = right * 2 / (screen.width - MyTools.canvasBaseWidth / 2);
    var verPixelsToLogical = bottom * 2 / MyTools.canvasBaseHeight;

    this.deviceToScreen = new L2DMatrix44();
    this.deviceToScreen.translate(-(screen.width - MyTools.canvasBaseWidth / 2), -(screen.height - MyTools.canvasBaseHeight / 2));
    this.deviceToScreen.multScale(horPixelsToLogical, verPixelsToLogical);

    this.gl = getWebGLContext();
    if (!this.gl) {
        l2dError("Failed to create WebGL context.");
        return;
    }

    Live2D.setGL(this.gl);
    Model.gl = this.gl;

    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    //changeModel();

    startDraw();
}


function startDraw() {
    if (!this.isDrawStart) {
        this.isDrawStart = true;

        var requestAnimationFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;

        (function tick() {
            draw();

            if (MyTools.fpsEnabled)
                MyTools.fps();

            requestAnimationFrame(tick, this.canvas);
        })();
    }
}


function draw() {
    // l2dLog("--> draw()");

    MatrixStack.reset();
    MatrixStack.loadIdentity();

    this.dragMgr.update();
    this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());


    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    MatrixStack.multMatrix(projMatrix.getArray());
    MatrixStack.multMatrix(viewMatrix.getArray());
    MatrixStack.push();

    for (var i = 0; i < this.live2DMgr.numModels(); i++) {
        var model = this.live2DMgr.getModel(i);

        if (model === undefined) return;

        if (model.initialized && !model.updating) {
            model.update();
            model.draw(this.gl);

            if (!this.isModelShown && i === this.live2DMgr.numModels() - 1) {
                this.isModelShown = !this.isModelShown;
                var btnChange = document.getElementById("btnChange");
                btnChange.textContent = "Change Model";
                btnChange.removeAttribute("disabled");
                btnChange.setAttribute("class", "active");
            }
        }
    }

    MatrixStack.pop();
}


function changeModel() {
    var btnChange = document.getElementById("btnChange");
    btnChange.setAttribute("disabled", "disabled");
    btnChange.setAttribute("class", "inactive");
    btnChange.textContent = "Now Loading...";
    this.isModelShown = false;

    this.live2DMgr.reloadFlg = true;
    this.live2DMgr.count++;

    this.live2DMgr.changeModel(this.gl);
}

//Old name: modelTurnHead(event) {
function modelAction(event, tap) {
//    var rect = event.target.getBoundingClientRect();

//    var sx = transformScreenX(event.clientX - rect.left);
//    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX /*- rect.left*/);
    var vy = transformViewY(event.clientY /*- rect.top*/);

    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("action device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");

    if (tap) {
        thisRef.live2DMgr.tapEvent(vx, vy);
    } else {
//        thisRef.lastMouseX = sx;
//        thisRef.lastMouseY = sy;

        thisRef.dragMgr.setPoint(vx, vy);
    }
}


function followPointer(event) {
//    var rect = event.target.getBoundingClientRect();

//    var sx = transformScreenX(event.clientX - rect.left);
//    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX /*- rect.left*/);
    var vy = transformViewY(event.clientY /*- rect.top*/);

    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog("onMouseMove device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");

//    thisRef.lastMouseX = sx;
//    thisRef.lastMouseY = sy;

    thisRef.dragMgr.setPoint(vx, vy);
}


function lookFront() {
    thisRef.dragMgr.setPoint(0, 0);
}

var mouseDown = false;

function mouseEvent(e) {
    e.preventDefault();

    //These events are never triggered in WE

//    if (e.type == "mousewheel") {
//        l2dLog(e.clientX + ' ' + thisRef.canvas.clientWidth);
//        if (e.clientX < 0 || thisRef.canvas.clientWidth < e.clientX ||
//            e.clientY < 0 || thisRef.canvas.clientHeight < e.clientY) {
//            return;
//        }
//
//        if (e.wheelDelta > 0) modelScaling(1.1);
//        else modelScaling(0.9);
//    }
//
//    if (e.type == "contextmenu") {
//        l2dLog(e.type);
//        changeModel();
//    }

    switch (e.type) {
        case 'mousedown':
            //This can be omitted because WE will only pass the left-click event (tested)
            //if ("button" in e && e.button !== 0) return;

            modelAction(e, false);

            mouseDown = true;
            thisRef.drag = false;

            if (!MyTools.freeFollowingEnabled)
                $('body').on("mousemove", mouseEvent);
            break;

        case 'mousemove':
            thisRef.drag = true;
            followPointer(e);
            break;

        //This is triggered when user's cursor moves to another visible element or leaves the current monitor
        case 'mouseout':
            //If caused by moving to another element, ignore it.
            if (e.clientX >= 0)
                break;
            else if (MyTools.freeFollowingEnabled)
                lookFront();

        case 'mouseup':
            //if ("button" in e && e.button != 0) return;

            //WE will somehow pass the 'mouseup' event even when the focus is not on wallpaper but on other window.
            //May be a glitch?
            //Anyway just added var mouseDown to filter it.
            if (mouseDown) {
                mouseDown = false;

                if (!MyTools.freeFollowingEnabled) {
                    $('body').off("mousemove", mouseEvent);
                    lookFront();
                }

                if (!thisRef.drag) {
                    modelAction(e, true);

                    if (MyTools.freeFollowingEnabled)
                        lookFront();
                }
            }
            break;
    }
}


function transformViewX(deviceX) {
    var screenX = this.deviceToScreen.transformX(deviceX);
//    l2dLog(deviceX + ' -> ' + screenX + '+' + -viewMatrix.getArray()[12] + '*' + viewMatrix.getScaleX() + ' -> ' + viewMatrix.invertTransformX(screenX));
    return viewX = viewMatrix.invertTransformX(screenX);
}


function transformViewY(deviceY) {
    var screenY = this.deviceToScreen.transformY(deviceY);
    return viewMatrix.invertTransformY(screenY);
}


function getWebGLContext() {
    var NAMES = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];

    for (var i = 0; i < NAMES.length; i++) {
        try {
            var ctx = this.canvas.getContext(NAMES[i], {premultipliedAlpha: true});
            if (ctx) return ctx;
        }
        catch (e) {
        }
    }
    return null;
}


function l2dLog(msg) {
    if (!LAppDefine.DEBUG_LOG) return;

    var myconsole = document.getElementById("myconsole");
    myconsole.innerHTML = /*myconsole.innerHTML + "<br>" +*/ msg;

    console.log(msg);
}


function l2dError(msg) {
    if (!LAppDefine.DEBUG_LOG) return;

    l2dLog("<span style='color:red'>" + msg + "</span>");

    console.error(msg);
}


//Implemented by myself
//function modelScaling(scale) {
//    var isMaxScale = thisRef.viewMatrix.isMaxScale();
//    var isMinScale = thisRef.viewMatrix.isMinScale();
//
//    thisRef.viewMatrix.adjustScale(0, 0, scale);
//
//
//    if (!isMaxScale) {
//        if (thisRef.viewMatrix.isMaxScale()) {
//            thisRef.live2DMgr.maxScaleEvent();
//        }
//    }
//
//    if (!isMinScale) {
//        if (thisRef.viewMatrix.isMinScale()) {
//            thisRef.live2DMgr.minScaleEvent();
//        }
//    }
//}


//No touch events in WE
//function touchEvent(e) {
//    e.preventDefault();
//
//    var touch = e.touches[0];
//
//    if (e.type == "touchstart") {
//        if (e.touches.length == 1) modelTurnHead(touch);
//        // onClick(touch);
//
//    } else if (e.type == "touchmove") {
//        followPointer(touch);
//
//        if (e.touches.length == 2) {
//            var touch1 = e.touches[0];
//            var touch2 = e.touches[1];
//
//            var len = Math.pow(touch1.pageX - touch2.pageX, 2) + Math.pow(touch1.pageY - touch2.pageY, 2);
//            if (thisRef.oldLen - len < 0) modelScaling(1.025);
//            else modelScaling(0.975);
//
//            thisRef.oldLen = len;
//        }
//
//    } else if (e.type == "touchend") {
//        lookFront();
//    }
//}


//Not used
//function transformScreenX(deviceX) {
//    return this.deviceToScreen.transformX(deviceX);
//}
//
//function transformScreenY(deviceY) {
//    return this.deviceToScreen.transformY(deviceY);
//}