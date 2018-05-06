/**
 * Created by Pencil on 2017/7/24 0024.
 */

var Model = {};

(function () {
    var customEnabled = undefined;
    var customModelPath;

    Model.setCustomEnabled = function (enabled) {
        var tmp = customEnabled;
        customEnabled = enabled;
        MyTools.altIdleAvailable = !enabled;

        if (enabled !== tmp)
            Model.loadModel();
    };

    Model.setCustom = function (path) {
        customModelPath = path;
        if (customEnabled)
            Model.loadModel();
    };

    Model.loadModel = function () {
        if (Model.gl) {
            if (customEnabled)
                customModelPath && window.live2DMgr.loadModel(Model.gl, customModelPath);
            else
                window.live2DMgr.loadModel(Model.gl, LAppDefine.MODEL_NEPTUNE_NORMAL);
        }
    };
})();