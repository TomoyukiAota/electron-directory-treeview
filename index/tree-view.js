const $ = require('jquery');
require('jstree');

function render(selectedPath) {

  $('#tree-view').jstree({
    'core' : {
      'data' : [
        { "text" : "Root node", "children" : [
            { "text" : "Child node 1" },
            { "text" : "Child node 2" }
          ]
        }
      ]
    }
  });

}

module.exports = {
  render: render
}