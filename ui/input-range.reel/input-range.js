/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */
/**
    @module "montage/ui/input-range.reel"
*/
/*global require,exports */
var Montage = require("montage").Montage,
    Component = require("ui/component").Component,
    dom = require("ui/dom");

/**
 * The input type="range" field
 * @class module:"montage/ui/input-range.reel".InputRange
 * @extends module:"montage/ui/native/input-range.reel".InputRange
 */
var InputRange = exports.InputRange = Montage.create(Component, /** @lends module:"montage/ui/input-range.reel".InputRange */  {

    DEFAULT_WIDTH: {
        value: 100
    },

    HANDLE_ADJUST: {
        value: 13
    },

    // public API
    _min: {
        value: null
    },

    min: {
        get: function() {
            return this._min;
        },
        set: function(value) {
            this._min =  String.isString(value) ? parseFloat(value) : value;
            this.needsDraw = true;
        }
    },

    _max: {
        value: null
    },

    max: {
        get: function() {
            return this._max;
        },
        set: function(value) {
            this._max = String.isString(value) ? parseFloat(value) : value;
            this.needsDraw = true;
        }
   },

    _step: {
        value: null
    },

    step: {
        get: function() {
            return this._step;
        },
        set: function(value) {
            this._step =  String.isString(value) ? parseFloat(value) : value;
            this.needsDraw = true;
        }
    },

    /** Width of the slider in px. Default = 300 */
    _width: {
        value: null
    },

    width: {
        get: function() {
            return this._width;
        },
        set: function(value) {
            this._width =  String.isString(value) ? parseFloat(value) : value;
            this.needsDraw = true;
        }
    },

    percent: {
        value: null
    },

    _valueSyncedWithPosition: {
        value: null
    },

    _value: {
        value: null
    },

    value: {
        get: function() {
            return this._value;
        },
        set: function(value, fromInput) {
            this._value =  String.isString(value) ? parseFloat(value) : value;
            //console.log('value set', this._value);
            if(fromInput) {
                this._valueSyncedWithPosition = true;
            } else {
                this._valueSyncedWithPosition = false;
                this.needsDraw = true;
            }
        }
    },

    // private
    _handleEl: {
        value: null
    },

    _translateComposer: {
        value: null
    },

    _sliderLeft: {
        value: null
    },

    _sliderWidth: {
        value: null
    },

    __positionX: {
        value: null
    },

    _positionX: {
        get: function() {
            return this.__positionX;
        },
        set: function(value, fromValue) {
            //console.log('positionX', value);
            if(value !== null && !isNaN(value)) {
                this.__positionX = value;
                if(!fromValue) {
                    this._calculateValueFromPosition();
                }
                this.needsDraw = true;
            }
        }
    },

    _calculateValueFromPosition: {
        value: function() {
            if(this._sliderWidth > 0) {
                var percent = this.percent = (this._positionX / this._sliderWidth) * 100;
                var value = (this.min + ((percent/100) * (this.max - this.min)));
                Object.getPropertyDescriptor(this, "value").set.call(this, value, true);
                this._valueSyncedWithPosition = true;
            }

        }
    },

    _calculatePositionFromValue: {
        value: function() {
            // unless the element is ready, we cannot position the handle
            if(this._sliderWidth) {
                var percent, value = this.value;
                var range = (this.max - this.min);
                percent = ((this.value-this.min)/range) * 100;
                var positionX = (percent/100)*this._sliderWidth;
                Object.getPropertyDescriptor(this, "_positionX").set.call(this, positionX, true);

                this.percent = percent;
                this._valueSyncedWithPosition = true;
            } else {
                this._valueSyncedWithPosition = false;
            }
        }
    },

    _positionOfElement: {
        value: function(element) {
            return dom.convertPointFromNodeToPage(element);
        }
    },

    _getElementPosition: {
        value: function(obj) {
            var curleft = 0, curtop = 0, curHt = 0, curWd = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                    curHt += obj.offsetHeight;
                    curWd += obj.offsetWidth;
                } while ((obj = obj.offsetParent));
            }
            return {
                top: curtop,
                left: curleft,
                height: curHt,
                width: curWd
            };
            //return [curleft,curtop, curHt, curWd];

        }
    },


    prepareForDraw: {
        value: function() {
            // read initial values from the input type=range
            this.min = this.min || this.element.getAttribute('min') || 0;
            this.max = this.max || this.element.getAttribute('max') || 100;
            this.step = this.step || this.element.getAttribute('step') || 1;
            this.value = this.value || this.element.getAttribute('value') || 0;
        }
    },

    // @todo: Without prepareForActivationEvents, the _translateComposer does not work
    prepareForActivationEvents: {
        value: function() {
            this._translateComposer.addEventListener('translateStart', this, false);
            this._translateComposer.addEventListener('translateEnd', this, false);
            this._addEventListeners();
        }
    },

    _addEventListeners: {
        value: function() {

            if(window.Touch) {
                this.element.addEventListener('touchstart', this, false);
            } else {
                this.element.addEventListener('mousedown', this, false);
            }

        }
    },

    _removeEventListeners: {
        value: function() {

            if(window.Touch) {
                this.element.removeEventListener('touchstart', this, false);
            } else {
                this.element.removeEventListener('mousedown', this, false);
            }

        }
    },

    handleTranslateStart: {
        value: function(e) {
            this._removeEventListeners();
            this._valueSyncedWithPosition = false;
        }
    },

    handleTranslateEnd: {
        value: function(e) {
            this._addEventListeners();
        }
    },

    // handle user clicking the slider scale directly instead of moving the knob
    _handleClick: {
        value: function(position) {
            //console.log('handleClick requested position',position, this._sliderLeft);
            if(this._sliderLeft <= 0) {
                var x = this._getElementPosition(this.element).left;
                if(x > 0) {
                    this._sliderLeft = x;
                }
            }
            var positionX = (position - (this._sliderLeft + InputRange.HANDLE_ADJUST));
            //console.log('handleClick positionX', positionX);
            if(positionX < 0) {
                positionX = 0;
            }
            this._positionX = positionX;
        }
    },

    handleMousedown: {
        value: function(e) {
            this._handleClick(e.clientX);
        }
    },

    handleTouchstart: {
        value: function(e) {
            this._handleClick(e.targetTouches[0].clientX);
        }
    },

    surrenderPointer: {
        value: function(pointer, composer) {
            // If the user is sliding us then we do not want anyone using
            // the pointer
            return false;
        }
    },

    willDraw: {
        value: function() {
            this._sliderWidth = this.element.offsetWidth - (1.5*InputRange.HANDLE_ADJUST);

            //var x = this._positionOfElement(this.element).x;
            var x = this._getElementPosition(this.element).left;
            if(x > 0) {
                this._sliderLeft = x;
            }
            console.log('willDraw element position', this._sliderLeft, this._sliderWidth);
            if(!this._valueSyncedWithPosition) {
                this._calculatePositionFromValue();
            }

        }
    },

    draw: {
        value: function() {
            //console.log('inputrange draw', this._positionX, this.value);
            var el = this._handleEl;
            if(el.style.webkitTransform != null) {
                // detection for webkitTransform to use Hardware acceleration where available
                el.style.webkitTransform = 'translate(' + this._positionX + 'px)';
            } else if(el.style.MozTransform != null) {
                el.style.MozTransform = 'translate(' + this._positionX + 'px)';
            } else if(el.style.transform != null) {
                el.style.transform = 'translate(' + this._positionX + 'px)';
            } else {
                // fallback
                el.style['left'] = this._positionX + 'px';
            }

        }
    }
});
