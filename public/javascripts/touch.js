/**
 * Created by p2admin on 11/12/2015.
 */

//$(document).on("pagecreate","#pageone",function(){
//    $("p").on("swipe",function(){
//        $("span").text("Swipe detected!");
//    });
//});

if( window.OrientationEvent || typeof(window.onorientationchange) != "undefined"){
    $('#home p').html('Yes it is!');
} else {
    $('#home p').html('No it isnt!');
}
