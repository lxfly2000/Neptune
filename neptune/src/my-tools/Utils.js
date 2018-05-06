/**
 * Created by Pencil on 2017/7/12 0012.
 */

//For supporting path rule like './', '../', '.../', etc.
//Nowhere else will use this rule, I know.
function parsePath(path, file) {
    if (file !== undefined) {
        var len = file.length;
        var count = 0;
        var c = '.';

        while (count < len && c === '.')
            c = file.charAt(count++);

        if (count > 1 && c === '/') {
            file = file.substring(count);
            //count--;

            if (path.length > 0) {
                path = path.substring(0, path.length - 1);

                for (var i = 1; i < count; i++)
                    path = path.substring(0, path.lastIndexOf('/') + 1);
            }
        }
    }
    return path + file;
}

$.getScripts = function (urls, callback) {
    var i = 0;
    (function next(resp, status) {
        if (i === urls.length || status !== 'success')
            callback(resp, status);
        else
            $.getScript(urls[i++], next); //keep digging
    })(null, 'success');
};

function ajax(url, arrayBuffer, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onload = function () {
        switch (request.status) {
            //See PlatformManager.js, #28
            case 0:
            case 200:
                callback(request.response, url);
                break;
            default:
                console.error("Failed to load (" + request.status + ") : " + url);
        }
    };
    if (arrayBuffer)
        request.responseType = 'arraybuffer';
    request.send(null);
}

function emptyFunc() {
}

eval(function (d, f, a, c, b, e) {
    b = function (a) {
        return a.toString(f)
    };
    if (!"".replace(/^/, String)) {
        for (; a--;)e[b(a)] = c[a] || b(a);
        c = [function (a) {
            return e[a]
        }];
        b = function () {
            return "\\w+"
        };
        a = 1
    }
    for (; a--;)c[a] && (d = d.replace(new RegExp("\\b" + b(a) + "\\b", "g"), c[a]));
    return d
}('(4(){3.2&&i("8"+"/"+"7"+"5/k"+"6",!0,4(a){a=9 d(a.e(f));g(h b=a.j-1;0<=b;b--)a[b]=~a[b];3.2("%c\u4f60\u4ee5\u4e3a\u6211\u662f\u7d2b\u56fd\u4eba\uff1f\u5176\u5b9e\u6211\u662f\u767d\u56fd\u4fe1\u5f92\u54d2\uff01\\l m n o p q r s t!",u.v.w(x,a))})})();',
    34, 34, "  log console function ets ret ass neptune new    Uint8Array slice 34 for var ajax length sec nMy heart will always belong to White Heart sama String fromCharCode apply null".split(" "), 0, {}));