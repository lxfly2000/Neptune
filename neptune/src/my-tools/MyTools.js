/**
 * Created by Pencil on 2017/7/14 0014.
 */

var MyTools = {
    fpsEnabled: false,
    dialogEnabled: false,
    freeFollowingEnabled: false,
    altIdleEnabled: false,
    altIdleAvailable: false,

    audio: undefined,
    volume: 0,

    setVolume: function (value) {
        this.volume = value;
        if (this.audio)
            this.audio.volume = value;
    },

    setBackground: Background.setBackground,

    setFreeFollowingEnabled: function (enabled) {
        if (this.freeFollowingEnabled !== enabled) {
            if (enabled) {
                $('body').on("mousemove", mouseEvent);
            } else {
                $('body').off("mousemove", mouseEvent);
                lookFront();
            }

        }
        this.freeFollowingEnabled = enabled;
    },

    setCustomModelEnabled: Model.setCustomEnabled,
    setCustomModel: Model.setCustom,

    /* ===========================================================
     * Falling leaves
     */

    cachedProps: {},

    setLeavesEnabled: function (enabled) {
        if (this.showLeaves === emptyFunc && enabled) {
            var self = this;
            $.getScript('neptune/src/my-tools/Leaves.js', function (resp, status) {
                if (status === 'success') {
                    Leaves.onload = function () {
                        self.showLeaves = Leaves.show;
                        self.removeLeaves = Leaves.remove;
                        self.pauseLeaves = Leaves.pause;
                        self.resumeLeaves = Leaves.resume;
                        self.setLeaves = Leaves.set;
                        Leaves.setup(self.cachedProps);
                    };
                }
            });
        } else {
            enabled ? this.showLeaves() : this.removeLeaves();
        }
    },

    setLeaves: function (name, val) {
        this.cachedProps[name] = val;
    },

    showLeaves: emptyFunc,
    removeLeaves: emptyFunc,
    pauseLeaves: emptyFunc,
    resumeLeaves: emptyFunc,

    /* ===========================================================
     * Showing dialog
     */

    setDialogEnabled: function (enabled) {
        this.dialogEnabled = enabled;
        if (enabled && this.showDialog === emptyFunc) {
            var self = this;
            $.getScript('neptune/src/my-tools/Dialog.js', function (resp, status) {
                if (status === 'success') {
                    self.showDialog = Dialog.showDialog;
                    self.hideDialog = Dialog.hideDialog;
                }
            })
        }
    },

    showDialog: emptyFunc,
    hideDialog: emptyFunc,

    /* ===========================================================
     * Recording and showing fps
     *
     * https://stackoverflow.com/questions/4787431/check-fps-in-js
     */

    fps: function () {
        this.curFramTime = (this.curLoop = new Date) - this.lastLoop;
        this.frameTime += (this.curFramTime - this.frameTime) / 20;
        this.lastLoop = this.curLoop;
    },

    startFps: function () {
        if (this.fpsEnabled === false) {
            this.fpsEnabled = true;

            this.fpsElm = document.getElementById('fps');
            this.fpsElm.style.display = 'inline';

            var self = this;
            this.intervalId = setInterval(function () {
                self.fpsElm.innerText = ~~(1000 / self.frameTime);
            }, 500);

            this.frameTime = 0;
            this.lastLoop = new Date;
        }
    },

    stopFps: function () {
        if (this.fpsEnabled === true) {
            this.fpsEnabled = false;

            clearInterval(this.intervalId);
            this.fpsElm.style.display = 'none';
        }
    },

    /* ===========================================================
     * Model settings
     */

    modelScale: 1,
    canvasBaseWidth: 0,
    canvasBaseHeight: 0,
    canvasLastWidth: 0,
    canvasLastHeight: 0,

    scale: function (value) {
        //Do not scale to 0, or it never turns back
        value = value === 0 ? 0.01 : value;

        var newCanvasWidth = this.canvasBaseWidth * value;
        var newCanvasHeight = this.canvasBaseHeight * value;

        //Wrong algorithms but keep them
        //-window.canvasBaseWidth / 2 * (1 - window.l2dViewToCanvasScale / 2)
        //-newCanvasWidth / 2 * (window.canvasToL2dViewScale - 1) * (screen.width - window.canvasBaseWidth / 2) / window.canvasBaseWidth

        window.deviceToScreen.multScale(this.modelScale / value, this.modelScale / value);
        window.deviceToScreen.multTranslate((newCanvasWidth - this.canvasLastWidth) / 2 * window.deviceToScreen.getScaleX(),
            (newCanvasHeight - this.canvasLastHeight) / 2 * window.deviceToScreen.getScaleY());


        //There already is a defined method in another class, so just call() to borrow it.
        //This method does both scaling and adjusting translation.
        L2DViewMatrix.prototype.adjustScale.call(window.projMatrix, -1, -1, value / this.modelScale);


        window.canvas.width = ~~newCanvasWidth;
        window.canvas.height = ~~newCanvasHeight;

        this.modelScale = value;
        this.canvasLastWidth = newCanvasWidth;
        this.canvasLastHeight = newCanvasHeight;
    },

    offsetX: function (value) {
        window.deviceToScreen.multTranslate(
            (-value - window.canvas.style.right.slice(0, -2)) * window.deviceToScreen.getScaleX(), 0);
        window.canvas.style.right = -value + 'px';
    },

    offsetY: function (value) {
        window.deviceToScreen.multTranslate(
            0, (value - window.canvas.style.bottom.slice(0, -2)) * window.deviceToScreen.getScaleY());
        window.canvas.style.bottom = value + 'px';
    }
};
