/*!
 * jQuery ClassyLeaves
 * vox.SPACE
 *
 * Written by Marius Stanciu - Sergiu <marius@vox.space>
 * Licensed under the MIT license https://vox.SPACE/LICENSE-MIT
 * Version 1.1.1
 *
 * Modified by Pencil
 * + Random drop intervals
 * + start() and stop() methods (notice that start() should be called manually after creating object)
 * + pause() and resume() methods (calling sequence should be: start()-[pause()-resume()]-stop())
 * + New settings property 'minY'
 * * Changed rotate center from 10%, 110% to 50%, 50%
 * * Scaling in under 1440p screens
 */
var ClassyLeaves = function (settings) {
    this.heightWindow = 0;
    this.widthWindow = 0;
    this.numLeaves = 0;
    this.started = false;
    this.paused = false;

    //I know hardcoded isn't supposed but, forget it.
    var rate = screen.width / 2560;
    var imgSizes = [rate * 75, rate * 100, rate * 125, rate * 150];

    this.__constructor = function (settings) {
        var self = this;
        this.heightWindow = $(window).height();
        this.widthWindow = $(window).width();
        $(window).resize(function () {
            self.heightWindow = $(window).height();
            self.widthWindow = $(window).width();
        });
        this.settings = $.extend({
            leaves: 50,
            minY: -100,
            maxY: 100,
            speed: 3000,
            infinite: true,
            multiplyOnClick: true,
            multiply: 1,
            selfFalls: true,
            folder: 'images/leaves/',
            numImages: 8
        }, settings);
        if (this.started === true) {
            return 0;
        }
        this.settings.minY *= rate;
        this.settings.maxY *= rate;
        var body = $('body');
        body.on('click', '.ClassyLeaf', function () {
            var id = $(this).attr('id');
            self._drop(id, false);
        });
        body.on('click', '.ClassyLeafFalling', function () {
            var id = $(this).attr('id');
            self._touch(id);
        });
        if (this.settings.multiplyOnClick === true) {
            body.on('click', '.ClassyLeafFalling', function () {
                var id = $(this).attr('id');
                self._multiply(id);
            });
        }
        this.randomDrop = function () {
            if (!self.started || self.paused || !self.settings.selfFalls)
                return;
            var leafEls = $('.ClassyLeaf');
            var random = self._random(0, leafEls.length);
            var el = leafEls.eq(random);
            var id = el.attr("id");
            self._drop(id, false);
            if ($('.ClassyLeaf').length !== 0)
                this._randomDropTId = setTimeout(self.randomDrop, self._random(0, self.settings.speed));
        };
        this._spawnTurn = function () {
            if (!self.started || self.paused)
                return;
            self._spawn(self.settings.leaves, true);
            self._spawnTurnTId = setTimeout(self._spawnTurn, self._random(0, self.settings.speed));
        };
    };

    this._spawn = function (num, animate) {
        while (num-- && $('.ClassyLeaf').length < this.settings.leaves)
            this._create(Math.random() < 0.5 ? 'left' : 'right', animate);
    };

    this.setNumber = function (num) {
        if (this.started) {
            var d = num - this.settings.leaves;
            if (d > 0) {
                this._spawn(d, false);
            } else {
                var leafEls;
                for (var i = 0; i > d; i--) {
                    leafEls = $('.ClassyLeaf');
                    leafEls.eq(this._random(0, leafEls.length--)).remove();
                }
            }
        }
        this.settings.leaves = num;
    };

    this.setSpeed = function (val) {
        this.settings.speed = val;
    };

    this.setSelfFalls = function (enabled) {
        var tmp = this.settings.selfFalls;
        this.settings.selfFalls = enabled;
        if (enabled) {
            if (!tmp && this.started)
                this.randomDrop();
        } else if (this._randomDropTId)
            clearTimeout(this._randomDropTId);
    };

    this.start = function () {
        if (!this.started) {
            this.started = true;
            this._spawn(this.settings.leaves, true);
            this._spawnTurn();
            if (this.settings.selfFalls)
                this.randomDrop();
        }
    };

    this.pause = function () {
        if (!this.paused) {
            this.paused = true;
            $('.ClassyLeafFalling').each(function (index, el) {
                $(el).pause();
                $(el).stopRotate();
            });
            clearTimeout(this._spawnTurnTId);
            if (this.settings.selfFalls)
                clearTimeout(this._randomDropTId);
        }
    };

    this.resume = function () {
        if (this.paused) {
            this.paused = false;
            $('.ClassyLeafFalling').each(function (index, el) {
                $(el).resume();
            });
            var t = this._random(0, this.settings.speed);
            this._spawnTurnTId = setTimeout(this._spawnTurn, t);
            if (this.settings.selfFalls)
                this._randomDropTId = setTimeout(this.randomDrop, t);
        }
    };

    this.stop = function () {
        if (this.started) {
            this.started = false;
            clearTimeout(this._spawnTurnTId);
            var self = this;
            $('.ClassyLeaf').each(function (index, el) {
                self._drop($(el).attr('id'), false);
            })
        }
    };

    this._multiply = function (id) {
        var el = $('#' + id);
        var x = el.position().top;
        var y = el.position().left;
        var leaf, num, cls, size;
        for (var i = 0; i <= this.settings.multiply; i++) {
            this.numLeaves += 1;
            num = 1 + Math.floor(Math.random() * this.settings.numImages);
            cls = el.attr('class').replace('ClassyLeafFalling', '');
            $('body').append('<img id="leaf' + this.numLeaves + '" class="ClassyLeaf ' + cls + '" src="' + this.settings.folder + num + '.png" />');
            leaf = $("#leaf" + this.numLeaves);
            size = cls.substring(1);
            leaf.css({
                width: imgSizes[size - 1] + 'px',
                height: imgSizes[size - 1] + 'px',
                'z-index': parseInt(-Math.random() - 0.5),
                top: x + 'px',
                left: y + 'px'
            }).animate({
                opacity: 1
            }, 300);
            this._drop('leaf' + this.numLeaves, true);
            this._touch('leaf' + this.numLeaves);
        }
    };

    this._touch = function (id) {
        var el = $("#" + id);
        var angle = el.getRotateAngle();
        var to = 0;
        if (angle > 0) {
            to = 720;
        } else {
            to = -720;
        }
        el.rotate({
            animateTo: to,
            duration: 20000
        });
    };

    this._drop = function (id, clicked) {
        var el = $('#' + id);
        var angle, to = 0, rnd, rnd1, rnd2, rnd3;
        el.removeClass('ClassyLeaf').addClass('ClassyLeafFalling');
        el.animate({
            top: this.heightWindow //'+=' + this.heightWindow + 150
        }, 5000, function () {
            el.clearQueue().animate({
                opacity: 0
            }, 300, function () {
                el.remove();
            });
        });
        angle = el.getRotateAngle();
        if (angle > 0) {
            to = 60;
        } else {
            to = -60;
        }
        if (clicked === true) {
            rnd = this._random(200, 600);
            if (angle > 0) {
                to = 420 + rnd;
            } else {
                to = -420 - rnd;
            }
            rnd1 = this._random(5, 300);
            rnd2 = this._random(5, 300);
            rnd3 = this._random(10000, 15000);
            el.rotate({
                animateTo: to,
                center: [rnd1 + '%', rnd2 + '%'],
                duration: rnd3
            });
        }
        else {
            el.rotate({
                animateTo: to,
                duration: 5000
            });
        }
    };

    this._create = function (pos, animate) {
        var leaf, angle, x, y, size, num, mid, time;
        this.numLeaves += 1;
        num = 1 + Math.floor(Math.random() * this.settings.numImages);
        size = 1 + Math.floor(Math.random() * 4);
        $('body').append('<img id="leaf' + this.numLeaves + '" class="ClassyLeaf x' + size + '" src="' + this.settings.folder + num + '.png" />');
        leaf = $('#leaf' + this.numLeaves);
        mid = this.widthWindow / 2;
        if (pos === 'right') {
            x = this._random(mid, this.widthWindow);
            angle = this._random(0, 50);
        } else {
            x = this._random(-50, mid);
            angle = this._random(0, -50);
        }
        y = this._random(this.settings.minY, this.settings.maxY);
        leaf.css({
            width: imgSizes[size - 1] + 'px',
            height: imgSizes[size - 1] + 'px',
            'z-index': parseInt(-Math.random() - 0.5),
            left: x + 'px',
            top: y + 'px',
            transform: animate ? '' : 'rotate(' + angle + 'deg)',
            opacity: animate ? 0 : 1
        });
        if (animate) {
            time = this.paused ? 1 : this._random(500, 8000);
            leaf.rotate({
                animateTo: angle,
                duration: time,
                center: ['50%', '50%']
            });
            leaf.animate({
                opacity: 1
            }, this.paused ? 1 : (time - 400));
        }
    };

    this._random = function (start, end) {
        return Math.floor(Math.random() * (end - start + 1) + start);
    };

    return this.__constructor(settings);
};


//this.add = function (leaves) {
//    var angle, leaf, x, y, rnd, mid, pos, size, num;
//    for (var z = 0; z < leaves; z++) {
//        this.numLeaves += 1;
//        num = 1 + Math.floor(Math.random() * this.settings.numImages);
//        size = 1 + Math.floor(Math.random() * 4);
//        $('body').append('<img id="leaf' + this.numLeaves + '" class="ClassyLeaf x' + size + '" src="' + this.settings.folder + num + '.png" />');
//        leaf = $('#leaf' + this.numLeaves);
//        mid = this.widthWindow / 2;
//        pos = this._random(1, 2);
//        if (pos === 2) {
//            x = this._random(mid, this.widthWindow);
//            angle = this._random(0, 50);
//        }
//        else {
//            x = this._random(-50, mid);
//            angle = this._random(0, -50);
//        }
//        rnd = this._random(500, 8000);
//        leaf.rotate({
//            animateTo: angle,
//            duration: rnd,
//            center: ['10%', '110%']
//        });
//        leaf.animate({
//            opacity: 1
//        }, (rnd - 400));
//        y = this._random(this.minY, this.maxY);
//        leaf.css({
//            width: imgSizes[size - 1] + 'px',
//            height: imgSizes[size - 1] + 'px',
//            'z-index': parseInt(-Math.random() - 0.5),
//            left: x + 'px',
//            top: y + 'px'
//        });
//    }
//    return this;
//};