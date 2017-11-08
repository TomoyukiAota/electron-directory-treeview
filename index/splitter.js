const $ = require('jquery');

var splitterLocation;

$(document).ready(function(){
  $('#splitter').mousedown(function(e){
    e.preventDefault();
    $(document).mousemove(function(e){
      splitterLocation = e.pageX;
      $('.content').css("width", $(document).width() - splitterLocation);
      $('.side-bar').css("width", splitterLocation);
    })
  });
  $(document).mouseup(function(e){
    $(document).unbind('mousemove');
  });
});

$(window).resize(function() {
  if(typeof splitterLocation === "undefined") 
    return;
    
  $('.content').css("width", $(document).width() - splitterLocation);
});