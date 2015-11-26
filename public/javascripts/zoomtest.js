/**
 * Created by p2admin on 11/25/2015.
 */
(function ($) {

    $(document).ready(function () {


        var scale = 1; // scale of the image
        var xLast = 0; // last x location on the screen
        var yLast = 0; // last y location on the screen
        var xImage = 0; // last x location on the image
        var yImage = 0; // last y location on the image

        Hammer($('.zoomable img').get(0)).on("tap", function (event) {

            var posX = event.gesture.center.pageX;
            var posY = event.gesture.center.pageY;


            // find current location on screen
            var xScreen = posX; //- $(this).offset().left;
            var yScreen = posY; //- $(this).offset().top;

            // find current location on the image at the current scale
            xImage = xImage + ((xScreen - xLast) / scale);
            yImage = yImage + ((yScreen - yLast) / scale);

            scale++;

            // determine the location on the screen at the new scale
            var xNew = (xScreen - xImage) / scale;
            var yNew = (yScreen - yImage) / scale;

            // save the current screen location
            xLast = xScreen;
            yLast = yScreen;

            // redraw
            $(this).css('-webkit-transform', 'scale(' + scale + ')' + 'translate(' + xNew + 'px, ' + yNew + 'px' + ')')
                .css('-webkit-transform-origin', xImage + 'px ' + yImage + 'px').css('-moz-transform', 'scale(' + scale + ') translate(' + xNew + 'px, ' + yNew + 'px)').css('-moz-transform-origin', xImage + 'px ' + yImage + 'px')
                .css('-o-transform', 'scale(' + scale + ') translate(' + xNew + 'px, ' + yNew + 'px)').css('-o-transform-origin', xImage + 'px ' + yImage + 'px').css('transform', 'scale(' + scale + ') translate(' + xNew + 'px, ' + yNew + 'px)');
        });
    });
})(jQuery);