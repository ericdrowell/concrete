/*
 * Candy v0.1.0
 * A sweet, fat free, HTML5 canvas library for all ages.
 * Release Date: 3-27-2016
 * https://github.com/ericdrowell/candy
 * Licensed under the MIT or GPL Version 2 licenses.
 *
 * Copyright (C) 2016 Eric Rowell @ericdrowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
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
  
  /**
   * Candy Wrapper constructor
   * @param {Object} config
   * @param {Integer} config.width - wrapper width in pixels
   * @param {Integer} config.height - wrapper height in pixels
   */
  Candy.Wrapper = function(config) {
    if (!config) {
      config = {};
    }
    this.width = 0;
    this.height = 0;
    this.layers = []; 
    this.id = idCounter++;

    this.container = document.createElement('div');
    this.container.className = 'candy-container';
    this.container.style.display = 'inline-block';
    this.container.style.position = 'relative';

    if (config.width && config.height) {
      this.setSize(config.width, config.height);
    }

    // clear container
    config.container.innerHTML = '';
    config.container.appendChild(this.container);

    Candy.wrappers.push(this);
  };

  Candy.Wrapper.prototype = {
    /**
     * add layer
     * @param {Candy.Layer} layer
     */
    add: function(layer) {
      this.layers.push(layer);
      layer.setSize(layer.width || this.width, layer.height || this.height);
      layer.wrapper = this;
      this.container.appendChild(layer.container);
    },
    /**
     * set wrapper size
     * @param {Integer} width - wrapper width in pixels
     * @param {Integer} height - wrapper height in pixels
     * @returns {Candy.Wrapper}
     */
    setSize: function(width, height) {
      this.width = width;
      this.height = height;
      this.container.style.width = this.width + 'px';
      this.container.style.height = this.height + 'px';
      return this;
    },
    /**
     * clear all layers
     * @returns {Candy.wrapper}
     */
    clear: function() {
      this.clearScene();
      this.clearHit();
      return this;
    },
    /**
     * clear all layer scene canvases
     * @returns {Candy.wrapper}
     */
    clearScene: function() {
      this.layers.forEach(function(layer) {
        layer.clearScene();
      });
      return this;
    },
    /**
     * clear all layer hit canvases
     * @returns {Candy.wrapper}
     */
    clearHit: function() {
      this.layers.forEach(function(layer) {
        layer.clearHit();
      });
      return this;
    },
    /**
     * get key associated to coordinate.  This can be used for mouse interactivity.
     * @param {Number} x
     * @param {Number} y
     * @returns {String|null} key
     */
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
    /** 
     * convert wrapper into a Candy canvas
     * @param {Object} config
     * @param {Number} config.pixelRatio - typically 1 or 2
     * @returns {Candy.Canvas}
     */
    toCanvas: function(config) {
      if (!config) {
        config = {};
      }
      var canvas = new Candy.SceneCanvas({
        pixelRatio: config.pixelRatio,
        width: this.width,
        height: this.height
      });

      this.layers.forEach(function(layer) {
        canvas.context.drawImage(layer.sceneCanvas.canvas, 0, 0, layer.width, layer.height);
      });

      return canvas;
    },
    /** 
     * get wrapper index from all Candy wrappers
     * @returns {Integer}
     */
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
    /**
     * destroy wrapper
     */
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

  /**
   * Candy Layer constructor
   * @param {Object} config
   * @param {Integer} [config.x]
   * @param {Integer} [config.y]
   * @param {Integer} [config.width] - wrapper width in pixels
   * @param {Integer} [config.height] - wrapper height in pixels
   */
  Candy.Layer = function(config) {
    if (!config) {
      config = {};
    }
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

    this.id = idCounter++;
    this.hitCanvas = new Candy.HitCanvas();
    this.sceneCanvas = new Candy.SceneCanvas();

    this.container = document.createElement('div');
    this.container.className = 'candy-layer';
    this.container.style.display = 'inline-block';
    this.container.style.position = 'absolute';
    this.container.appendChild(this.hitCanvas.canvas);
    this.container.appendChild(this.sceneCanvas.canvas);

    if (config.x && config.y) {
      this.setPosition(config.x, config.y);
    }
    if (config.width && config.height) {
      this.setSize(config.width, config.height);
    }
  };

  Candy.Layer.prototype = {
    /**
     * set layer position
     * @param {Number} x
     * @param {Number} y
     * @returns {Candy.Layer}
     */
    setPosition: function(x, y) {
      this.x = x;
      this.container.style.left = x + 'px';
      this.y = y;
      this.container.style.top = y + 'px';
      return this;
    },
    /**
     * set layer size
     * @param {Number} width
     * @param {Number} height
     * @returns {Candy.Layer}
     */
    setSize: function(width, height) {
      this.width = width;
      this.container.style.width = width + 'px';
      this.height = height;
      this.container.style.height = height + 'px';
      this.sceneCanvas.setSize(width, height);
      this.hitCanvas.setSize(width, height);
      return this;
    },
    /**
     * clear scene and hit canvases
     * @returns {Candy.Layer}
     */
    clear: function() {
      this.sceneCanvas.clear();
      this.hitCanvas.clear();
      return this;
    },
    /** 
     * move up
     * @returns {Candy.Layer}
     */
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

      return this;
    },
    /** 
     * move down
     * @returns {Candy.Layer}
     */
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

      return this;
    },
    /** 
     * move to top
     * @returns {Candy.Layer}
     */
    moveToTop: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      layers.splice(index, 1);
      layers.push(this);

      wrapper.container.appendChild(this.container);
    },
    /** 
     * move to bottom
     * @returns {Candy.Layer}
     */
    moveToBottom: function() {
      var index = this.getIndex(),
          wrapper = this.wrapper,
          layers = wrapper.layers;

      layers.splice(index, 1);
      layers.unshift(this);

      wrapper.container.insertBefore(this.container, wrapper.container.firstChild);

      return this;
    },
    /** 
     * get layer index from wrapper layers
     * @returns {Number|null}
     */
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
    /**
     * destroy
     */
    destroy: function() {
      // remove self from layers array
      this.wrapper.layers.splice(this.getIndex(), 1);

      // remove self from dom
      this.wrapper.container.removeChild(this.container);
    }
  };

  ////////////////////////////////////////////////////////////// SCENE CANVAS //////////////////////////////////////////////////////////////
  
  /**
   * Candy SceneCanvas constructor
   * @param {Object} config
   * @param {Integer} [config.width] - canvas width in pixels
   * @param {Integer} [config.height] - canvas height in pixels
   * @param {Number} [config.pixelRatio] - typically 1 or 2
   */
  Candy.SceneCanvas = function(config) {
    if (!config) {
      config = {};
    }

    this.width = 0;
    this.height = 0;
    this.pixelRatio = config.pixelRatio || Candy.pixelRatio;

    this.id = idCounter++;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'candy-scene-canvas';
    this.canvas.style.display = 'inline-block';
    this.canvas.style.position = 'absolute';
    this.context = this.canvas.getContext('2d');

    if (config.width && config.height) {
      this.setSize(config.width, config.height);
    }
  };

  Candy.SceneCanvas.prototype = {
    /**
     * set canvas size
     * @param {Number} width
     * @param {Number} height
     * @returns {Candy.SceneCanvas}
     */
    setSize: function(width, height) {
      this.width = width;
      this.height = height;

      this.id = idCounter++;
      this.canvas.width = width * this.pixelRatio;
      this.canvas.style.width = width + 'px';
      this.canvas.height = height * this.pixelRatio;
      this.canvas.style.height = height + 'px'; 

      if (this.pixelRatio !== 1) {
        this.context.scale(this.pixelRatio, this.pixelRatio);
      }

      return this;
    },
    /** 
     * clear canvas
     * @returns {Candy.SceneCanvas}
     */
    clear: function() {
      this.context.clearRect(0, 0, this.width * this.pixelRatio, this.height * this.pixelRatio);
      return this;
    },
    /** 
     * convert canvas into an image
     * @param {Function} callback
     */
    toImage: function(callback) {
      var that = this,
          imageObj = new Image(),
          dataURL = this.canvas.toDataURL('image/png');

      imageObj.onload = function() {
        imageObj.width = that.width;
        imageObj.height = that.height;
        callback(imageObj);
      };
      imageObj.src = dataURL;
    },
    /** 
     * download canvas as an image
     * @param {Object} config
     * @param {String} config.fileName
     */
    download: function(config) {
      var dataURL = this.canvas.toDataURL('image/png'),
          anchor = document.createElement('a'),
          evObj = document.createEvent('Events'),
          fileName;

      if (!config) {
        config = {};
      }

      fileName = config.fileName || 'canvas.png',
      dataURL = dataURL.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

      // set a attributes
      anchor.setAttribute('href', dataURL);
      anchor.setAttribute('download', fileName);

      // simulate click
      evObj.initEvent('click', true, false);
      anchor.dispatchEvent(evObj);
    }
  };

  ////////////////////////////////////////////////////////////// HIT CANVAS //////////////////////////////////////////////////////////////
  
  /**
   * Candy HitCanvas constructor
   * @param {Object} config
   * @param {Integer} [config.width] - canvas width in pixels
   * @param {Integer} [config.height] - canvas height in pixels
   * @param {Number} [config.pixelRatio] - typically 1 or 2
   */
  Candy.HitCanvas = function(config) {
    if (!config) {
      config = {};
    }

    this.width = 0;
    this.height = 0;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'candy-hit-canvas';
    this.canvas.style.display = 'none';
    this.canvas.style.position = 'relative';
    this.context = this.canvas.getContext('2d');

    this.hitColorIndex = 0;
    this.keyToColor = {};
    this.colorToKey = {};

    if (config.width && config.height) {
      this.setSize(config.width, config.height);
    }
  };

  Candy.HitCanvas.prototype = {
    /**
     * set canvas size
     * @param {Number} width
     * @param {Number} height
     * @returns {Candy.HitCanvas}
     */
    setSize: function(width, height) {
      this.width = width;
      this.height = height;

      this.canvas.width = width;
      this.canvas.style.width = width + 'px';
      this.canvas.height = height;
      this.canvas.style.height = height + 'px';
    },
    /** 
     * clear canvas
     * @returns {Candy.HitCanvas}
     */
    clear: function() {
      this.context.clearRect(0, 0, this.width, this.height);
    },
    /**
     * get key associated to coordinate.  This can be used for mouse interactivity.
     * @param {Number} x
     * @param {Number} y
     * @returns {String|null} key
     */
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
    /**
     * register key for hit detection
     * @returns {Candy.HitCanvas)
     */
    registerKey: function(key) {
      var color;
     
      if (!this.keyToColor[key]) {
        color = this.hitColorIndex++;
        this.colorToKey[color] = key;
        this.keyToColor[key] = color;
      }

      return this;
    },
    /**
     * convert rgb components into integer 
     * @returns {Integer}
     */
    rgbToInt: function(r, g, b) {
      return (r << 16) + (g << 8) + b;
    },
    /** 
     * get color integer from key.  This is needed in order to draw things onto the hit canvas 
     * for hit detection
     * @param {String} key
     * @returns {Integer}
     */
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