/**
 * Created by Pencil on 2017/7/19 0019.
 */

var Dialog = {};

(function () {
    var dialogs = [];

    ajax('neptune/assets/live2d/neptune/dialogue.txt', false, function (text) {
        var lines = text.split('\n');
        var line, index, id;
        for (var i = lines.length - 1; i >= 0; i--) {
            line = lines[i];
            index = line.indexOf(' ');
            //Range the id as 0-999
            if (index > 0 && index < 4 && !isNaN(id = +line.substring(0, index)))
                dialogs[id] = line.substring(index + 1);
        }
    });

    Dialog.showDialog = function (id) {
        if (dialogs[id] !== undefined) {
            var dialog = $('#dialog');
            dialog.css('display', 'inline');
            dialog.text(dialogs[id]);
            dialog.css('left', (screen.width - dialog.width()) / 2 + 'px');
            dialog.clearQueue().animate({opacity: 0.8}, 300);
        }
    };

    Dialog.hideDialog = function () {
        $('#dialog').clearQueue().animate({
            opacity: 0
        }, 300, function () {
            $(this).css('display', 'none');
        });
    };

})();