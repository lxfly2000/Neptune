/**
 * Created by Pencil on 2017/7/12 0012.
 */

var Background = {};

(function () {
    var bgUrl;
    var bgImg;

    Background.setBackground = function (url, type) {
        if (type === 'img')
            bgImg = url;
        else
            bgUrl = url;

        url = bgImg || bgUrl || 'neptune/assets/image/bg_park.jpg';

        document.body.style.backgroundImage = 'url(' + url + ')';
        document.body.style.backgroundSize = 'cover';
    };

    //This function is not finished yet

    var konachanTag = 'landscape';

    Background.loadKonachan = function () {
        function onPostCountReceived(xml, url) {
            l2dLog('xml: ' + url + '<br><br>' + xml);
            var firstQuoteIndex = xml.indexOf('\"');
            if (firstQuoteIndex !== -1) {
                var secondQuoteIndex = xml.indexOf('\"', firstQuoteIndex);
                var postCount = parseInt(xml.substring(firstQuoteIndex, secondQuoteIndex));

                if (!isNaN(postCount)) {
                    //Each page has 21 posts
                    var randomPage = parseInt(Math.random() * postCount / 21);
                    ajax('http://konachan.net/post.xml?tags=' + konachanTag + '&page=' + randomPage, false, onPostsReceived);
                }
            }
        }

        function onPostsReceived(json, url) {
            l2dLog('json: ' + url + '<br><br>' + json);
        }

        ajax('http://konachan.net/tags=' + konachanTag, false, onPostCountReceived);
    }
})();