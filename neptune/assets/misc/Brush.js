var Brush;
var BrushTip;
var Tips = {};
(function () {
    "use strict";

    function checkObject(obj) {
        return typeof obj != "object" ? {} : obj;
    }

    function checkNumber(number, defaultValue) {
        return typeof number != "number" ? defaultValue : number;
    }

    Brush = function (options) {
        options = checkObject(options);
        this.path = options.path || null;
        this.ctx = options.ctx || null;
        this.spacing = checkNumber(options.spacing, 0);
        this.tip = options.tip || new Tips.Rough1();

        if (this.path != null)
            this.pathLength = this.path.getTotalLength();
    }

    Brush.prototype = {
        path: null,
        pathLength: 0,
        v: 0,
        lastV: 0,
        ctx: null,
        spacing: 0,
        tip: null,
        getPos: function (v) {
            v = this._cleanV(v);

            return this.path.getPointAtLength(
                v * this.pathLength
            );
        },
        draw: function () {
            var v = this._getV();

            this._render(v);

            this.lastV = v;
        },
        drawFromLast: function () {
            var v = this._getV();

            var lastV = this.lastV;
            var spacing = this.spacing;

            if (spacing > 0) {
                var dist = Math.abs(v - lastV);
                var step = this._lenToV(spacing);
                var steps = Math.ceil(dist / step);
                step = dist / steps;

                var curV = lastV;
                var timeout = 1000;
                while (timeout > 0 && ((v > lastV && curV <= v) || (v < lastV && curV >= v))) {
                    timeout--;
                    this._render(curV, {
                        rotation: 0,
                        pressure: Math.sqrt(1 - (Math.abs(v - 0.5) * 2))
                    });
                    curV += step;
                }
            }

            this.lastV = v;
        },
        _vToLen: function (v) {
            return v * this.pathLength;
        },
        _lenToV: function (len) {
            return len / this.pathLength;
        },
        _getV: function () {
            return this._cleanV(this.v);
        },
        _cleanV: function (v) {
            v = checkNumber(v, this.v);
            if (v > 1) v = 1;
            if (v < 0) v = 0;
            return v;
        },
        _render: function (v, options) {
            v = this._cleanV(v);

            options = checkObject(options);

            var rotation = checkNumber(options.rotation, 0);
            var pressure = checkNumber(options.pressure, 1);

            var ctx = this.ctx;
            var pos = this.getPos(v);

            ctx.save();

            ctx.translate(pos.x, pos.y);

            this.tip.draw(ctx, {
                pressure: pressure
            });

            ctx.restore();

        }
    }

    BrushTip = function (options) {
        options = checkObject(options);
        this.size = checkNumber(options.size, 1);
    };
    BrushTip.prototype = {
        size: 1,
        _currentCtx: null,
        _currentOptions: {},
        draw: function (ctx, options) {
            options = checkObject(options);
            this._currentCtx = ctx;
            this._render(options);
        },
        _render: function (options) {

        },
        _drawCircle: function (r, x, y, polar) {
            x = checkNumber(x, 0);
            y = checkNumber(y, 0);
            if (polar) {
                var a = x;
                var d = y;
                x = Math.cos(a) * d;
                y = Math.sin(a) * d;
            }
            var ctx = this._currentCtx;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath()
        }
    }

    Tips.Round = function (options) {
        BrushTip.call(this, options);
    }
    Tips.Round.prototype = Object.create(BrushTip.prototype);
    Tips.Round.prototype.constructor = Tips.Round;
    Tips.Round.prototype._render = function (options) {
        BrushTip.prototype._render.call(this, options);
        var pressure = checkNumber(options.pressure, 1);
        var ctx = this._currentCtx;

        ctx.scale(1, 0.4);
        this._drawCircle(6 * this.size);
    }


    // Rough brush
    Tips.Rough1 = function (options) {
        BrushTip.call(this, options);

        var maxDist = 8;
        this._points = new Array();
        for (var i = 0; i < 15; i++) {
            var d = Math.pow(Math.random(), 2);
            var a = Math.random() * Math.PI * 2;
            var r = 0.1 + (Math.pow(1 - d, 2) * 4);
            d *= maxDist;
            this._points.push({
                d: d,
                a: a,
                r: r
            });
        }
        console.log(this);
    }
    Tips.Rough1.prototype = Object.create(BrushTip.prototype);
    Tips.Rough1.prototype.constructor = Tips.Rough1;
    Tips.Rough1.prototype._points = null;
    Tips.Rough1.prototype._render = function (options) {
        BrushTip.prototype._render.call(this, options);

        var pressure = checkNumber(options.pressure, 1);
        var size = this.size;
        var ctx = this._currentCtx;

        ctx.fillStyle = "rgba(0,0,0,0.8)";

        var that = this;
        this._points.forEach(function (point, i) {
            that._drawCircle(
                point.r * pressure,
                point.a,
                point.d,
                true
            );
        })
    }
}());

document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var cvs = document.querySelector("canvas");
    var ctx = cvs.getContext("2d"),
        svg = document.querySelector("svg"),
        paths = svg.querySelectorAll("path"),

        roughBrushes = [],
        ovalBrushes = [];

    for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var roughBrush = new Brush({
            path: path,
            ctx: ctx,
            spacing: 1
        });

        roughBrushes.push(roughBrush);


        var ovalBrush = new Brush({
            path: path,
            ctx: ctx,
            spacing: 2,
            tip: new Tips.Round()
        });

        ovalBrushes.push(ovalBrush);
    }

    function animateBrush(brush, i) {
        var updateBrush = function () {
            brush.drawFromLast();
        }
        TweenMax.to(brush, 1, {
            v: 1,
            delay: 0.03 * i,
            ease: Quint.easeOut,
            onUpdate: updateBrush,
            onComplete: updateBrush
        })
    }

    function clear() {
        var resetBrush = function (brush) {
            TweenMax.killTweensOf(brush);
            brush.v = 0;
            brush.draw();
        }
        roughBrushes.forEach(resetBrush);
        ovalBrushes.forEach(resetBrush);
        ctx.clearRect(0, 0, cvs.width, cvs.height);
    }

    function animateRough() {
        clear();
        roughBrushes.forEach(animateBrush);
    }

    function animateOval() {
        clear();
        ovalBrushes.forEach(animateBrush);
    }

    animateRough();

    cvs.onclick = animateRough;
}, false);