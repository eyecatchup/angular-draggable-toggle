/**
AngularJS Draggable Toggle Buttons v0.0.2
Copyright 2015 Stephan Schmitz - MIT License
--------------------------------------------
Based on copyrighted work by Simon Tabor (https://github.com/simontabor/jquery-toggles/).
*/

(function(root) {

  var factory = function($) {

    var Toggles = root['Toggles'] = function(el, opts) {
      var self = this;

      if (typeof opts === 'boolean' && el.data('toggles')) {
        el.data('toggles').toggle(opts);
        return;
      }

      var dataAttr = [ 'on', 'drag', 'click', 'width', 'height', 'animate', 'type', 'checkbox', 'handleWidth' ];
      var dataOpts = {};
      for (var i = 0; i < dataAttr.length; i++) {
        var opt = el.data('toggle-' + dataAttr[i]);
        if (typeof opt !== 'undefined') dataOpts[dataAttr[i]] = opt;
      }

      // extend default opts with the users options
      opts = self.opts = $.extend({
        // can the toggle be dragged
        'drag': true,
        // can it be clicked to toggle
        'click': true,
        'text': {
          // text for the ON/OFF position
          'on': 'ON',
          'off': 'OFF'
        },
        // is the toggle ON on init
        'on': false,
        // animation time (ms)
        'animate': 250,
        // the checkbox to toggle (for use in forms)
        'checkbox': null,
        // element that can be clicked on to toggle. removes binding from the toggle itself (use nesting)
        'clicker': null,
        // handle width used if not set in css
        'handleWidth': 100,
        // width used if not set in css
        'width': 200,
        // height used if not set in css
        'height': 50,
        // defaults to a compact toggle, other option is 'select' where both options are shown at once
        'type': 'compact',
        // the event name to fire when we toggle
        'event': 'toggle',
        // the event name to fire when we toggle
        'touch': true
      }, opts || {}, dataOpts);

      self.el = el;

      el.data('toggles', self);

      self.selectType = opts['type'] === 'select';

      // make checkbox a jquery element
      self.checkbox = $(opts['checkbox']);

      // leave as undefined if not set
      if (opts['clicker']) self.clicker = $(opts['clicker']);

      // leave as undefined if not set
      if (opts['handleWidth']) self.handleWidth = $(opts['handleWidth']);

      self.mouseDown = !opts['touch'] ? 'mousedown' : 'mousedown touchstart';
      self.mouseMove = !opts['touch'] ? 'mousemove' : 'mousemove touchmove';
      self.mouseLeave = !opts['touch'] ? 'mouseleave' : 'mouseleave touchend';
      self.mouseUp = !opts['touch'] ? 'mouseup' : 'mouseup touchend';

      self.createEl();
      self.bindEvents();

      // set active to the opposite of what we want, so toggle will run properly
      self['active'] = !opts['on'];

      // toggle the toggle to the correct state with no animation and no event
      self.toggle(opts['on'], true, true);
    };

    Toggles.prototype.createEl = function() {
      var self = this;

      var height = self.el.height();
      var width = self.el.width();

      // if the element doesnt have an explicit height/width in css, set them
      if (!height) self.el.height(height = self.opts['height']);
      if (!width) self.el.width(width = self.opts['width']);

      self.h = height;
      self.w = width;

      self.sliderInnerWidth = self.w;
      self.handleWidth = self.opts['handleWidth'];
      self.onOffWidth = self.sliderInnerWidth - self.handleWidth;
      self.labelWidth = self.onOffWidth / 2;

      var div = function(name) {
        return $('<div class="toggle-' + name +'">');
      };

      self.els = {
        // wrapper inside toggle
        slide: div('slide'),

        // inside slide, this bit moves
        inner: div('inner'),

        // the on/off divs
        on: div('on'),
        off: div('off'),

        // the grip to drag the toggle
        handle: div('handle')
      };

      var halfHeight = height / 2;
      var handleWidth = self.handleWidth;
      var halfHandleWidth = handleWidth / 2;
      var onOffWidth = self.onOffWidth;

      var isSelect = self.selectType;

      // set up the CSS for the individual elements
      self.els.on
        .css({
          height: height,
          width: onOffWidth,
          textIndent: isSelect ? '' : onOffWidth / 3,
          lineHeight: height + 'px'
        })
        .html(self.opts['text']['on']);

      self.els.off
        .css({
          height: height,
          width: onOffWidth,
          textIndent: isSelect ? '' : onOffWidth / 3,
          lineHeight: height + 'px'
        })
        .html(self.opts['text']['off']);

      self.els.handle.css({
        height: height,
        width: handleWidth,
        marginLeft: 0
      });

      self.els.inner.css({
        width: width * 2 - handleWidth,
        marginLeft: (isSelect || self['active']) ? 0 : -width + handleWidth
      });

      if (self.selectType) {
        self.els.slide.addClass('toggle-select');
        self.el.css('width', onOffWidth * 2);
        self.els.handle.hide();
      }

      // construct the toggle
      self.els.inner.append(self.els.on, self.els.handle, self.els.off);
      self.els.slide.html(self.els.inner);
      self.el.html(self.els.slide);
    };

    Toggles.prototype.bindEvents = function() {
      var self = this;

      // evt handler for click events
      var clickHandler = function(e) {

        // if the target isn't the handle or dragging is disabled, toggle!
        if (e['target'] !== self.els.handle[0] || !self.opts['drag']) {
          self.toggle();
        }
      };

      // if click is enabled and toggle isn't within the clicker element (stops double binding)
      if (self.opts['click'] && (!self.opts['clicker'] || !self.opts['clicker'].has(self.el).length)) {
        self.el.on('click', clickHandler);
      }

      // setup the clicker element
      if (self.opts['clicker']) {
        self.opts['clicker'].on('click', clickHandler);
      }

      // bind up dragging stuff
      if (self.opts['drag'] && !self.selectType) self.bindDrag();
    };

    Toggles.prototype.bindDrag = function() {
      var self = this;

      // time to begin the dragging parts/handle clicks
      var diff;
      var slideLimit = self.onOffWidth / 3;

      // fired on mouseup and mouseleave events
      var upLeave = function(e) {
        self.el.off(self.mouseMove);
        self.els.slide.off(self.mouseLeave);
        self.els.handle.off(self.mouseUp);

        if (!diff && self.opts['click'] && e.type !== 'mouseleave') {
          self.toggle();
          return;
        }

        var overBound = self['active'] ? diff < -slideLimit : diff > slideLimit;
        if (overBound) {
          // dragged far enough, toggle
          self.toggle();
        } else {
          // reset to previous state
          self.els.inner.stop().animate({
            marginLeft: self['active'] ? 0 : -self.sliderInnerWidth
          }, self.opts['animate'] / 2);
        }
      };

      var wh = -self.w + self.handleWidth;

      self.els.handle.on(self.mouseDown, function(e) {

        // reset diff
        diff = 0;

        self.els.handle.off(self.mouseUp);
        self.els.slide.off(self.mouseLeave);
        var cursor = e.pageX;
        if (cursor === undefined && self.opts['touch'] === true) {
          cursor = e.originalEvent.touches[0].pageX;
          //cursor = e.changedTouches[0].pageX;
        }

        self.el.on(self.mouseMove, self.els.handle, function(e) {
          var currentCursor = e.pageX;
          if (currentCursor === undefined && self.opts['touch'] === true) {
            currentCursor = e.originalEvent.touches[0].pageX;
            //currentCursor = e.changedTouches[0].pageX;
          }
          diff = currentCursor - cursor;
          var marginLeft;

          if (self['active']) {

            marginLeft = diff;

            // keep it within the limits
            if (diff > 0) marginLeft = 0;
            if (diff < wh) marginLeft = wh;
          } else {

            marginLeft = diff + wh;

            if (diff < 0) marginLeft = wh;
            if (diff > -wh) marginLeft = 0;

          }

          self.els.inner.css('margin-left', marginLeft);
        });

        self.els.handle.on(self.mouseUp, upLeave);
        self.els.slide.on(self.mouseLeave, upLeave);
        //self.els.slide.on('mouseleave', upLeave);
      });
    };

    Toggles.prototype.toggle = function(state, noAnimate, noEvent) {
      var self = this;

      // check we arent already in the desired state
      if (self['active'] === state) return;

      var active = self['active'] = !self['active'];

      self.el.data('toggle-active', active);

      self.els.off.toggleClass('active', !active);
      self.els.on.toggleClass('active', active);
      self.checkbox.prop('checked', active);

      if (!noEvent) self.el.trigger(self.opts['event'], active);

      if (self.selectType) return;

      var margin = active ? 0 : -self.w + self.handleWidth;
      // move the toggle!
      self.els.inner.stop().animate({
        'marginLeft': margin
      }, noAnimate ? 0 : self.opts['animate']);
    };

    $.fn['toggles'] = function(opts) {
      return this.each(function() {
        new Toggles($(this), opts);
      });
    };

  };

  if (typeof define === 'function' && define['amd']) {
    define(['jquery'], factory);
  } else {
    factory(root['jQuery'] || root['Zepto'] || root['ender'] || root['$'] || $);
  }

})(this);
