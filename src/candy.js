(function() {
  var Candy = {},
      idCounter = 0;

  Candy.pixelRatio = (function() {
    // client browsers
    if (window && window.navigator && window.navigator.userAgent && !/PhantomJS/.test(window.navigator.userAgent)) {
      return 2;
    }
    // headless browsers
    else {
      return 1;
    }
  })();

  Candy.wrappers = [];

  ////////////////////////////////////////////////////////////// WRAPPER //////////////////////////////////////////////////////////////
  
  Candy.Wrapper = function(config) {
    if (!config) {
      config = {};
    }
    this.width = config.width;
    this.height = config.height;
    this.layers = []; 
    this.id = idCounter++;

    this.container = document.createElement('div');
    this.container.className = 'candy-container';
    this.container.style.display = 'inline-block';
    this.container.style.position = 'relative';
    this.setSize(this.width, this.height);

    // clear container
    config.container.innerHTML = '';
    config.container.appendChild(this.container);

    Candy.wrappers.push(this);
  };

  Candy.Wrapper.prototype = {
    add: function(layer) {
      this.layers.push(layer);
      layer.setSize(layer.width || this.width, layer.height || this.height);
      layer.wrapper = this;
      this.container.appendChild(layer.container);
    },
    insert: function() {

    },
    setSize: function(width, height) {
      this.width = width;
      this.height = height;
      this.container.style.width = this.width + 'px';
      this.container.style.height = this.height + 'px';
    },
    clear: function() {
      this.clearScene();
      this.clearHit();
    },
    clearScene: function() {
      this.layers.forEach(function(layer) {
        layer.clearScene();
      });
    },
    clearHit: function() {
      this.layers.forEach(function(layer) {
        layer.clearHit();
      });
    },
    getIntersection: function(x, y) {
      var layers = this.layers,
          len = layers.length,
          n, layer, key;

      for (n=len-1; n>=0; n--) {
        layer = layers[n];
        key = layer.hitCanvas.getIntersection(x, y);
        if (key !== null) {
          return key;
        }
      }

      return null;
    },
    toImage: function() {

    },
    toCanvas: function() {

    },
    download: function() {

    },
    getIndex: function() {
      var wrappers = Candy.wrappers,
          len = wrappers.length,
          n = 0,
          wrapper;

      for (n=0; n<len; n++) {
        wrapper = wrappers[n];
        if (this.id === wrapper.id) {
          return n;
        }
      }

      return null;
    },
    destroy: function() {
      // destroy layers
      this.layers.forEach(function(layer) {
        layer.destroy();
      });

      // remove self from wrappers array
      Candy.wrappers.splice(this.getIndex(), 1);
    }
  };

  ////////////////////////////////////////////////////////////// LAYER //////////////////////////////////////////////////////////////
  
  Candy.Layer = function(config) {
    if (!config) {
      config = {};
    }
    this.width = config.width || 0;
    this.height = config.height || 0;
    this.x = config.x || 0;
    this.y = config.y || 0;

    this.id = idCounter++;
    this.hitCanvas = new Candy.HitCanvas();
    this.sceneCanvas = new Candy.SceneCanvas();

    this.container = document.createElement('div');
    this.container.className = 'candy-layer';
    this.container.style.display = 'inline-block';
    this.container.style.position = 'absolute';
    this.container.style.left = this.x + 'px';
    this.container.style.top = this.y + 'px';
    this.container.appendChild(this.hitCanvas.canvas);
    this.container.appendChild(this.sceneCanvas.canvas);

    if (this.width && this.height) {
      this.setSize(this.width, this.height);
    }
  };

  Candy.Layer.prototype = {
    setX: function(x) {
      this.container.style.left = x + 'px';
    },
    setY: function() {
      this.container.style.top = y + 'px';
    },
    setSize: function(width, height) {
      this.width = width;
      this.container.style.width = width + 'px';
      this.height = height;
      this.container.style.height = height + 'px';

      this.sceneCanvas.setSize(width, height);
      this.hitCanvas.setSize(width, height);
    },
    clear: function() {
      this.sceneCanvas.clear();
      this.hitCanvas.clear();
    },
    moveUp: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      if (index < layers.length - 1) {
        // swap
        layers[index] = layers[index+1];
        layers[index+1] = this;

        wrapper.container.insertBefore(this.container, wrapper.container.children[index+2]);
      }
    },
    moveDown: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      if (index > 0) {
        // swap
        layers[index] = layers[index-1];
        layers[index-1] = this;

        wrapper.container.insertBefore(this.container, wrapper.container.children[index-1]);
      }
    },
    moveToTop: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      layers.splice(index, 1);
      layers.push(this);

      wrapper.container.appendChild(this.container);
    },
    moveToBottom: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      layers.splice(index, 1);
      layers.unshift(this);

      wrapper.container.insertBefore(this.container, wrapper.container.firstChild);
    },
    getIndex: function() {
      var layers = this.wrapper.layers,
          len = layers.length,
          n = 0,
          layer;

      for (n=0; n<len; n++) {
        layer = layers[n];
        if (this.id === layer.id) {
          return n;
        }
      }

      return null;
    },
    destroy: function() {
      // remove self from layers array
      this.wrapper.layers.splice(this.getIndex(), 1);

      // remove self from dom
      this.wrapper.container.removeChild(this.container);
    }
  };

  ////////////////////////////////////////////////////////////// SCENE CANVAS //////////////////////////////////////////////////////////////
  
  Candy.SceneCanvas = function(config) {
    if (!config) {
      config = {};
    }

    this.width = config.width || 0;
    this.height = config.height || 0;

    this.id = idCounter++;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'candy-scene-canvas';
    this.canvas.style.display = 'inline-block';
    this.canvas.style.position = 'absolute';
    this.context = this.canvas.getContext('2d');

    if (this.width && this.height) {
      this.setSize(this.width, this.height);
    }
  };

  Candy.SceneCanvas.prototype = {
    setSize: function(width, height) {
      this.width = width;
      this.height = height;

      this.id = idCounter++;
      this.canvas.width = width * Candy.pixelRatio;
      this.canvas.style.width = width + 'px';
      this.canvas.height = height * Candy.pixelRatio;
      this.canvas.style.height = height + 'px'; 

      if (Candy.pixelRatio !== 1) {
        this.context.scale(Candy.pixelRatio, Candy.pixelRatio);
      }
    },
    clear: function() {
      this.context.clearRect(0, 0, this.width * Candy.pixelRatio, this.height * Candy.pixelRatio);
    },
    toImage: function(callback) {
      var that = this,
          dataURL = this.canvas.toDataURL(),
          imageObj = new Image();

      imageObj.onload = function() {
        imageObj.width = that.width;
        imageObj.height = that.height;
        callback(imageObj);
      };
      imageObj.src = dataURL;
    }
  };

  ////////////////////////////////////////////////////////////// HIT CANVAS //////////////////////////////////////////////////////////////
  
  Candy.HitCanvas = function(config) {
    if (!config) {
      config = {};
    }

    this.width = config.width || 0;
    this.height = config.height || 0;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'candy-hit-canvas';
    this.canvas.style.display = 'none';
    this.canvas.style.position = 'relative';
    this.context = this.canvas.getContext('2d');

    this.hitColorIndex = 0;
    this.keyToColor = {};
    this.colorToKey = {};

    if (this.width && this.height) {
      this.setSize(this.width, this.height);
    }
  };

  Candy.HitCanvas.prototype = {
    setSize: function(width, height) {
      this.width = width;
      this.height = height;

      this.canvas.width = width;
      this.canvas.style.width = width + 'px';
      this.canvas.height = height;
      this.canvas.style.height = height + 'px';
    },
    clear: function() {
      this.context.clearRect(0, 0, this.width, this.height);
    },
    getIntersection: function(x, y) {
      var data, red, blue, green, alpha, colorIndex, key;

      data = this.context.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      red = data[0]; 
      green = data[1]; 
      blue = data[2]; 
      alpha = data[3];

      colorIndex = this.rgbToInt(red, green, blue);
      key = this.colorToKey[colorIndex];

      return key !== undefined  && alpha === 255 ? key : null;
    },
    addKey: function(key) {
      var color;
     
      if (!this.keyToColor[key]) {
        color = this.hitColorIndex++;
        this.colorToKey[color] = key;
        this.keyToColor[key] = color;
      }
    },
    rgbToInt: function(r, g, b) {
      return (r << 16) + (g << 8) + b;
    },
    getColorFromKey: function(key) {
      var color = this.keyToColor[key].toString(16);
      // pad with zeros
      while (color.length < 6) {
        color = '0' + color;
      }
      return '#' + color;
    }
  };

  // export
  window.Candy = Candy;
})();