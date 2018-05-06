/**
 * Created by Pencil on 2017/7/14 0014.
 */

var Leaves = {};

(function () {
    $.getScripts(['neptune/src/libs/jquery.rotate.js',
            'neptune/src/libs/jquery.pause.min.js',
            'neptune/src/libs/jquery.classyleaves.js'],
        function (resp, status) {
            if (status === 'success') {
                $('head').append('<link rel="stylesheet" type="text/css" href="neptune/src/css/jquery.classyleaves.min.css">');
                //http://www.tuicool.com/articles/QNJBVj3
                //This plugin is so damn good

                var tree = new ClassyLeaves({
                    folder: 'neptune/assets/image/leaves/',
                    leaves: 30,
                    minY: -80,
                    maxY: -10,
                    infinite: true,
                    speed: 2000
                });

                Leaves.show = function () {
                    tree.start();
                };

                Leaves.remove = function () {
                    tree.stop();
                };

                Leaves.pause = function () {
                    tree.pause();
                };

                Leaves.resume = function () {
                    tree.resume();
                };

                Leaves.setup = function (props) {
                    for (var name in props)
                        Leaves.set(name, props[name]);
                    tree.start();
                };

                Leaves.set = function (name, val) {
                    switch (name) {
                        case 'num':
                            tree.setNumber(val);
                            break;
                        case 'self_falls':
                            tree.setSelfFalls(val);
                            break;
                        case 'speed':
                            tree.setSpeed(val);
                            break;
                    }
                };

                if (Leaves.onload)
                    Leaves.onload();
            }
        });
})();