(function() {
  var Candy = {};

  Candy.Wrapper = function(config) {
    if (!config) {
      config = {};
    }
    this.width = config.width;
    this.height = config.height;
    this.layers = []; 
    this.layerMap = {};

    this.container = document.createElement('div');
    this.container.className = 'candy-container';
    this.container.style.display = 'inline-block';
    this.setSize(this.width, this.height);

    // first clear config container
    config.container.innerHTML = '';
    config.container.appendChild(this.container);
  };

  Candy.Wrapper.prototype = {
    add: function(layer) {
      this.layers.push(layer);

      if (layer.id !== undefined) {
        this.layerMap[layer.id] = layer;
      }

      this.container.appendChild(layer.container);
    },
    setWidth: function(width) {
      this.container.style.width = this.width + 'px';
    },
    setHeight: function(height) {
      this.container.style.height = this.height + 'px';
    },
    setSize: function(width, height) {
      this.setWidth(width);
      this.setHeight(height);
    },
    clear: function() {
      this.clearScene();
      this.clearHit();
    },
    clearScene: function() {

    },
    clearHit: function() {

    },
    getIntersection: function(x, y) {

    },
    exportPNG: function() {

    },
    exportCanvas: function() {

    },
    download: function() {

    },
    destroy: function() {

    }
  };

  Candy.Layer = function(config) {
    if (!config) {
      config = {};
    }
    this.id = config.id;

    this.hitCanvas = document.createElement('canvas');
    this.hitCanvas.className = 'candy-layer-hit';
    this.hitCanvas.style.display = 'none';
    this.hitCanvas.style.position = 'absolute';
    this.hitContext = this.hitCanvas.getContext('2d');

    this.sceneCanvas = document.createElement('canvas');
    this.sceneCanvas.className = 'candy-layer-scene';
    this.sceneCanvas.style.display = 'inline-block';
    this.sceneCanvas.style.position = 'absolute';
    this.sceneContext = this.sceneCanvas.getContext('2d');

    this.container = document.createElement('div');
    this.container.className = 'candy-layer';
    this.container.style.display = 'inline-block';
    this.container.style.position = 'relative';
    this.container.appendChild(this.hitCanvas);
    this.container.appendChild(this.sceneCanvas);
  };

  Candy.Layer.prototype = {
    setX: function(x) {

    },
    setY: function(y) {

    },
    setWidth: function(width) {

    },
    setHeight: function(height) {

    },
    setSize: function(width, height) {
      this.setWidth(width);
      this.setHeight(height);
    },
    setViewport: function(x, y, width, height) {

    },
    clear: function() {
      this.clearScene();
      this.clearHit();
    },
    clearScene: function() {

    },
    clearHit: function() {

    },
    getIntersection: function(x, y) {

    },
    exportPNG: function() {

    },
    exportCanvas: function() {

    },
    moveUp: function() {

    },
    moveDown: function() {

    },
    moveToTop: function() {

    },
    moveToBottom: function() {

    },
    destroy: function() {

    }
  };

  // export
  window.Candy = Candy;
})();