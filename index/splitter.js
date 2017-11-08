const $ = require('jquery');

$(document).ready(function(){
  $('#splitter').mousedown(function(e){
    e.preventDefault();
    $(document).mousemove(function(e){
      $('.content').css("width",$(document).width()-e.pageX+2);
      $('.side-bar').css("width",e.pageX+2);
    })
  });
  $(document).mouseup(function(e){
    $(document).unbind('mousemove');
  });
});