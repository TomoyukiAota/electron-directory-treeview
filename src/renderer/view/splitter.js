const $ = require('jquery');

const contentArea = $('#content');
const sideBarArea = $('#side-bar');
const splitter = $('#splitter');
let splitterLocation;

$(document).ready(function () {
  splitter.mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
      splitterLocation = e.pageX;
      contentArea.css('width', $(document).width() - splitterLocation);
      sideBarArea.css('width', splitterLocation);
    });
  });
  $(document).mouseup(function (e) {
    $(document).unbind('mousemove');
  });
});

$(window).resize(function () {
  if (typeof splitterLocation === 'undefined')
    return;

  contentArea.css('width', $(document).width() - splitterLocation);
});
