(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){

/**
 */

module.exports = {
  template    : require(24),
  transpile   : require(26).transpile,
  Attribute   : require(3),
  Component   : require(18),
  noConflict: function() {
    delete global.paperclip;
  }
};

if (typeof window !== "undefined") {
  window.paperclip = module.exports;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"18":18,"24":24,"26":26,"3":3}],2:[function(require,module,exports){
var extend       = require(48);

function POJOAccessor() {
  this._getters  = {};
  this._callers  = {};
  this._watchers = [];
}

function _set(target, keypath, value) {

  var keys = typeof keypath === "string" ? keypath.split(".") : keypath;
  var ct   = target;
  var key;

  for (var i = 0, n = keys.length - 1; i < n; i++) {
    key = keys[i];
    if (!ct[key]) {
      ct[key] = {};
    }
    ct = ct[key];
  }

  ct[keys[keys.length - 1]] = value;
  return value;
}

extend(POJOAccessor.prototype, {

  /**
   */

  call: function(object, keypath, params) {

    var caller;

    if (!(caller = this._callers[keypath])) {
      var ctxPath = ["this"].concat(keypath.split("."));
      ctxPath.pop();
      ctxPath = ctxPath.join(".");
      caller = this._callers[keypath] = new Function("params", "return this." + keypath + ".apply(" + ctxPath + ", params);");
    }

    try {
      var ret = caller.call(object, params);
      this.applyChanges(object);
      return ret;
    } catch (e) {
      return void 0;
    }
  },

  /**
   */

  get: function(object, path) {

    var pt = typeof path !== "string" ? path.join(".") : path;
    var getter;

    if (!(getter = this._getters[pt])) {
      getter = this._getters[pt] = new Function("return this." + pt);
    }

    // is undefined - fugly, but works for this test.
    try {
      return getter.call(object);
    } catch (e) {
      return void 0;
    }
  },

  /**
   */

  set: function(object, path, value) {

    if (typeof path === "string") path = path.split(".");

    var ret = _set(object, path, value);

    this.applyChanges(object);

    return ret;
  },

  /**
   */

  watch: function(object, listener) {

    var self = this;
    var currentValue;
    var firstCall = true;

    return this._addWatcher(function(changedObject) {
      if (changedObject === object) listener();
    });
  },

  /**
   */

  _addWatcher: function(applyChanges) {

    var self = this;

    var watcher = {
      apply: applyChanges,
      trigger: applyChanges,
      dispose: function() {
        var i = self._watchers.indexOf(watcher);
        if (~i) self._watchers.splice(i, 1);
      }
    };

    this._watchers.push(watcher);

    return watcher;
  },

  /**
   */

  applyChanges: function(object) {
    for (var i = 0, n = this._watchers.length; i < n; i++) {
      this._watchers[i].apply(object);
    }
  }
});

/**
 */

module.exports = POJOAccessor;

},{"48":48}],3:[function(require,module,exports){
var protoclass = require(47);

/**
 */

function Base(ref, key, value, view) {
  this.ref      = ref;
  this.node     = ref; // DEPRECATED
  this.key      = key;
  this.value    = value;
  this.view     = view;
  this.template = view.template;
  this.document = view.template.options.document;
  this.initialize();
}

/**
 */

protoclass(Base, {
  initialize: function() {
  },
  update: function() {
  }
});

/**
 */

module.exports = Base;

},{"47":47}],4:[function(require,module,exports){
var BaseAttribute = require(3);

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  update: function() {

    var classes = this.value;

    if (typeof classes === "string") {
      return this.node.setAttribute("class", classes);
    }

    if (!classes) {
      return this.node.removeAttribute("class");
    }

    var classesToUse = this.node.getAttribute("class");
    classesToUse     = classesToUse ? classesToUse.split(" ") : [];

    for (var classNames in classes) {

      var useClass = classes[classNames];
      var classNamesArray = classNames.split(/[,\s]+/g);

      for (var i = 0, n = classNamesArray.length; i < n; i++) {
        var className = classNamesArray[i];

        var j = classesToUse.indexOf(className);
        if (useClass) {
          if (!~j) {
            classesToUse.push(className);
          }
        } else if (~j) {
          classesToUse.splice(j, 1);
        }
      }
    }

    this.node.setAttribute("class", classesToUse.join(" "));
  }
});

module.exports.test = function(vnode, key, value) {
  return typeof value !== "string";
};

},{"3":3}],5:[function(require,module,exports){
var KeyCodedEventAttribute = require(14);

/**
 */

module.exports = KeyCodedEventAttribute.extend({
  keyCodes: [8]
});

},{"14":14}],6:[function(require,module,exports){
var BaseAttribue = require(3);

/**
 */

module.exports = BaseAttribue.extend({
  initialize: function() {
    this.view.transitions.push(this);
  },
  enter: function() {
    this.value.call(this.view, this.node, function() { });
  }
});

},{"3":3}],7:[function(require,module,exports){
var BaseAttribue = require(3);

/**
 */

module.exports = BaseAttribue.extend({
  initialize: function() {
    this.view.transitions.push(this);
  },
  exit: function(complete) {
    this.value.call(this.view, this.node, complete);
  }
});

},{"3":3}],8:[function(require,module,exports){
var BaseAttribute = require(3);

/**
 */

module.exports = BaseAttribute.extend({
  value: true,
  initialize: function() {
    this.update();
  },
  update: function() {
    if (this.value !== false) {
      this.node.removeAttribute("disabled");
    } else {
      this.node.setAttribute("disabled", "disabled");
    }
  }
});

},{"3":3}],9:[function(require,module,exports){
var KeyCodedEventAttribute = require(14);

/**
 */

module.exports = KeyCodedEventAttribute.extend({
  keyCodes: [13]
});

},{"14":14}],10:[function(require,module,exports){
var KeyCodedEventAttribute = require(14);

/**
 */

module.exports = KeyCodedEventAttribute.extend({
  keyCodes: [27]
});

},{"14":14}],11:[function(require,module,exports){
var Base   = require(3);

/**
 */

module.exports = Base.extend({
  initialize: function() {
    if (!this.event) this.event = this.key.match(/on(.+)/)[1].toLowerCase();
    this.ref.addEventListener(this.event, this._onEvent.bind(this));
  },
  _onEvent: function(event) {
    this.value(event);
  }
});

},{"3":3}],12:[function(require,module,exports){
(function (process){
var BaseAttribute = require(3);

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  update: function() {
    if (!this.value) return;
    if (this.node.focus) {
      var self = this;

      if (!process.browser) return this.node.focus();

      // focus after being on screen. Need to break out
      // of animation, so setTimeout is the best option
      setTimeout(function() {
        self.node.focus();
      }, 1);
    }
  }
});

}).call(this,require(31))
},{"3":3,"31":31}],13:[function(require,module,exports){

module.exports = {
  onClick       : require(11),
  onDoubleClick : require(11),
  onLoad        : require(11),
  onSubmit      : require(11),
  onMouseDown   : require(11),
  onMouseMove   : require(11),
  onMouseUp     : require(11),
  onChange      : require(11),
  onMouseOver   : require(11),
  onMouseOut    : require(11),
  onFocusIn     : require(11),
  onFocusOut    : require(11),
  onKeyDown     : require(11),
  onKeyUp       : require(11),
  onDragStart   : require(11),
  onDragStop    : require(11),
  onDragEnd     : require(11),
  onDragOver    : require(11),
  onDragEnter   : require(11),
  onDragLeave   : require(11),
  onDrop        : require(11),
  onSelectStart : require(11),
  onEnter       : require(9),
  onDelete      : require(5),
  focus         : require(12),
  onEscape      : require(10),
  class         : require(4),
  style         : require(15),
  value         : require(16),
  checked       : require(16),
  easeIn        : require(6),
  easeOut       : require(7),
  enable        : require(8)
};

},{"10":10,"11":11,"12":12,"15":15,"16":16,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9}],14:[function(require,module,exports){
var EventAttribute = require(11);

/**
 */

module.exports = EventAttribute.extend({

  /**
   */

  event: "keydown",

  /**
   */

  keyCodes: [],

  /**
   */

  _onEvent: function(event) {

    if (!~this.keyCodes.indexOf(event.keyCode)) {
      return;
    }

    EventAttribute.prototype._onEvent.apply(this, arguments);
  }
});

},{"11":11}],15:[function(require,module,exports){
var BaseAttribute = require(3);

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  initialize: function() {
    this._currentStyles = {};
  },

  /**
   */

  update: function() {

    var styles = this.value;

    if (typeof styles === "string") {
      this.node.setAttribute("style", styles);
      return;
    }

    var newStyles = {};

    for (var name in styles) {
      var style = styles[name];
      if (style !== this._currentStyles[name]) {
        newStyles[name] = this._currentStyles[name] = style || "";
      }
    }

    for (var key in newStyles) {
      this.node.style[key] = newStyles[key];
    }
  }
});

/**
 */


module.exports.test = function(vnode, key, value) {
  return typeof value !== "string";
};

},{"3":3}],16:[function(require,module,exports){
var BaseAttribute = require(3);
var _bind         = require(28);

/**
 */

module.exports = BaseAttribute.extend({

  /**
   */

  _events: ["change", "keyup", "input"],

  /**
   */

  initialize: function() {
    this._onInput = _bind(this._onInput, this);
    var self = this;
    this._events.forEach(function(event) {
      self.node.addEventListener(event, self._onInput);
    });
  },

  /**
   */

  // bind: function() {
  //   BaseAttribute.prototype.bind.call(this);
  //
  //   var self = this;
  //
  //   // TODO - move this to another attribute helper (more optimal)
  //   if (/^(text|password|email)$/.test(this.node.getAttribute("type"))) {
  //     this._autocompleteCheckInterval = setInterval(function() {
  //       self._onInput();
  //     }, process.browser ? 500 : 10);
  //   }
  // },

  /**
   */

  // unbind: function() {
  //   BaseAttribute.prototype.unbind.call(this);
  //   clearInterval(this._autocompleteCheckInterval);
  //
  //   var self = this;
  // },

  /**
   */

  update: function() {

    var model = this.model = this.value;

    if (!model) return;

    if (!model || !model.__isReference) {
      throw new Error("input value must be a reference. Make sure you have <~> defined");
    }

    if (model.gettable) {
      this._elementValue(this._parseValue(model.value()));
    }
  },

  _parseValue: function(value) {
    if (value == null || value === "") return void 0;
    return value;
  },

  /**
   */

  _onInput: function(event) {

    clearInterval(this._autocompleteCheckInterval);

    // ignore some keys
    if (event && (!event.keyCode || !~[27].indexOf(event.keyCode))) {
      event.stopPropagation();
    }

    var value = this._parseValue(this._elementValue());

    if (!this.model) return;

    if (String(this.model.value()) == String(value))  return;

    this.model.value(value);
  },

  /**
   */

  _elementValue: function(value) {

    var isCheckbox        = /checkbox/.test(this.node.type);
    var isRadio           = /radio/.test(this.node.type);
    var isRadioOrCheckbox = isCheckbox || isRadio;
    var hasValue          = Object.prototype.hasOwnProperty.call(this.node, "value");
    var isInput           = hasValue || /input|textarea|checkbox/.test(this.node.nodeName.toLowerCase());

    if (!arguments.length) {
      if (isCheckbox) {
        return Boolean(this.node.checked);
      } else if (isInput) {
        return this.node.value || "";
      } else {
        return this.node.innerHTML || "";
      }
    }

    if (value == null) {
      value = "";
    } else {
      clearInterval(this._autocompleteCheckInterval);
    }

    if (isRadioOrCheckbox) {
      if (isRadio) {
        if (String(value) === String(this.node.value)) {
          this.node.checked = true;
        }
      } else {
        this.node.checked = value;
      }
    } else if (String(value) !== this._elementValue()) {

      if (isInput) {
        this.node.value = value;
      } else {
        this.node.innerHTML = value;
      }
    }
  }
});

/**
 */


module.exports.test = function(vnode, key, value) {
  return typeof value !== "string";
};

},{"28":28,"3":3}],17:[function(require,module,exports){
var extend     = require(48);
var transpiler = require(26);

/**
 */

function Compiler() { }

/**
 */

extend(Compiler.prototype, {

  /**
   */

  compile: function(source, options) {
    var js = transpiler.transpile(source, options);
    return new Function("return " + js)();
  }
});

/**
 */

module.exports = new Compiler();

},{"26":26,"48":48}],18:[function(require,module,exports){
var protoclass = require(47);

function Component() {

};

module.exports = Component;

},{"47":47}],19:[function(require,module,exports){
module.exports = {
  repeat: require(20)
};

},{"20":20}],20:[function(require,module,exports){
var extend = require(48);
var ivd    = require(40);

/**
 */

function Repeat(section, vnode, attributes, view) {
  extend(this, attributes);
  this.section    = section;
  this._cTemplate  = ivd.template(vnode, view.template.options);
  this._children   = [];
}

/**
 */

function _each(target, iterate) {

  if (!target) return;

  if (target.forEach) {
    // use API here since target could be an object
    target.forEach(iterate);
  } else {
    for (var key in target) {
      if (target.hasOwnProperty(key)) iterate(target[key], key);
    }
  }
}

/**
 */

extend(Repeat.prototype, {

  /**
   */

  setAttribute: function(k, v) {
    this[k] = v;
  },

  /**
   */

  update: function(parent) {

    var as       = this.as;
    var each     = this.each;
    var key      = this.key || "key";

    var n        = 0;
    var self     = this;

    var properties;

    _each(each, function(model, k) {

      var child;

      if (as) {
        properties       = { };
        properties[key]  = k;
        properties[as]   = model;
      } else {
        properties = model;
      }

      if (n >= self._children.length) {
        child = self._cTemplate.view(properties, {
          parent: parent
        });
        self._children.push(child);
        self.section.appendChild(child.render());
      } else {
        child = self._children[n];
        child.update(properties);
      }

      n++;
    });

    this._children.splice(n).forEach(function(child) {
      child.remove();
    });
  }
});

/**
 */

module.exports = Repeat;

},{"40":40,"48":48}],21:[function(require,module,exports){
var extend = require(48);

module.exports = function(initialize, update) {

  if (!update) update = function() { };

  /**
   */

  function Binding(ref, view) {
    this.ref              = ref;
    this.view             = view;
    this.template         = view.template;
    this.options          = this.template.options;
    this.attributeClasses = this.options.attributes || {};
    this.initialize();
    this.attrBindings     = {};
  }

  /**
   */

  extend(Binding.prototype, {

    /**
     */

    initialize: initialize || function() { },

    /**
     */

    update2: update || function() { },

    /**
     */

    setAttribute: function(key, value) {
      if (!this.setAsRegisteredAttribute(key, value)) {
        if (value != void 0) {
          this.ref.setAttribute(key, value);
        } else {
          this.ref.removeAttribute(key);
        }
      }
    },

    /**
     */

    setProperty: function(key, value) {
      if (!this.setAsRegisteredAttribute(key, value)) {
        if (value != void 0) {
          this.ref[key] = value;
        } else {
          this.ref[key] = void 0;
        }
      }
    },

    /**
     */

    setAsRegisteredAttribute: function(key, value) {
      if (this.attrBindings[key]) {
        this.attrBindings[key].value = value;
      } else {
        var attrClass = this.attributeClasses[key];
        if (attrClass) {
          this.attrBindings[key] = new attrClass(this.ref, key, value, this.view);
        } else {
          return false;
        }
      }
      return true;
    },

    /**
     */

    update: function(view) {
      this.update2(view);
      for(var key in this.attrBindings) {
        this.attrBindings[key].update(view);
      }
    }
  });

  return Binding;
};

},{"48":48}],22:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleIndices = { Start: 0 },
        peg$startRuleIndex   = 0,

        peg$consts = [
          function(children) { return children; },
          peg$FAILED,
          "<!DOCTYPE",
          { type: "literal", value: "<!DOCTYPE", description: "\"<!DOCTYPE\"" },
          [],
          /^[^>]/,
          { type: "class", value: "[^>]", description: "[^>]" },
          ">",
          { type: "literal", value: ">", description: "\">\"" },
          function(info) {
                return ["doctype", info.join("")];
              },
          function(children) { return trimTextExpressions(children); },
          "<!--",
          { type: "literal", value: "<!--", description: "\"<!--\"" },
          void 0,
          "-->",
          { type: "literal", value: "-->", description: "\"-->\"" },
          function(v) { return v; },
          function(value) {
              return ["comment", trimEnds(value.join(""))];
            },
          "<",
          { type: "literal", value: "<", description: "\"<\"" },
          "area",
          { type: "literal", value: "area", description: "\"area\"" },
          "base",
          { type: "literal", value: "base", description: "\"base\"" },
          "br",
          { type: "literal", value: "br", description: "\"br\"" },
          "col",
          { type: "literal", value: "col", description: "\"col\"" },
          "command",
          { type: "literal", value: "command", description: "\"command\"" },
          "embed",
          { type: "literal", value: "embed", description: "\"embed\"" },
          "hr",
          { type: "literal", value: "hr", description: "\"hr\"" },
          "img",
          { type: "literal", value: "img", description: "\"img\"" },
          "input",
          { type: "literal", value: "input", description: "\"input\"" },
          "keygen",
          { type: "literal", value: "keygen", description: "\"keygen\"" },
          "link",
          { type: "literal", value: "link", description: "\"link\"" },
          "meta",
          { type: "literal", value: "meta", description: "\"meta\"" },
          "param",
          { type: "literal", value: "param", description: "\"param\"" },
          "source",
          { type: "literal", value: "source", description: "\"source\"" },
          "track",
          { type: "literal", value: "track", description: "\"track\"" },
          "wbr",
          { type: "literal", value: "wbr", description: "\"wbr\"" },
          null,
          "/>",
          { type: "literal", value: "/>", description: "\"/>\"" },
          function(nodeName, attributes, endTag) {

              if (endTag && nodeName != endTag.name) {
                expected("</" + nodeName + ">");
              }

              return ["element", nodeName, attributes, []];
            },
          "</",
          { type: "literal", value: "</", description: "\"</\"" },
          function(name) {
                return {
                  name: name
                };
              },
          function(startTag, children, endTag) {

              if (startTag.name != endTag.name) {
                expected("</" + startTag.name + ">");
              }

              return ["element", startTag.name, startTag.attributes, children];
            },
          function(value) {
                return ["text", trimNewLineChars(value.join(""))];
              },
          "{{",
          { type: "literal", value: "{{", description: "\"{{\"" },
          function() {
                return text();
              },
          function(info) { return info; },
          function(info) { return ["element", info.name, info.attributes, []]; },
          function(name, attrs) {
                return {
                  name: name,
                  attributes: attrs
                };
              },
          function(attributes) {
                return attributes;
            },
          /^[a-zA-Z0-9:_.\-]/,
          { type: "class", value: "[a-zA-Z0-9:_.\\-]", description: "[a-zA-Z0-9:_.\\-]" },
          function(word) { return word.join(""); },
          "=",
          { type: "literal", value: "=", description: "\"=\"" },
          function(name, values) {
                return ["attribute", name, values];
              },
          function(name, property) {
                return ["property", name, property];
              },
          function(name) {
                return ['attribute', name, []];
              },
          "\"",
          { type: "literal", value: "\"", description: "\"\\\"\"" },
          /^[^"]/,
          { type: "class", value: "[^\"]", description: "[^\"]" },
          function() { return ["string", text()]; },
          function(values) { return attrValues(values); },
          "'",
          { type: "literal", value: "'", description: "\"'\"" },
          /^[^']/,
          { type: "class", value: "[^']", description: "[^']" },
          "}}",
          { type: "literal", value: "}}", description: "\"}}\"" },
          function(value) {
                return ["script", value];
              },
          function(script) {
              return ["block", script[1]];
            },
          "?",
          { type: "literal", value: "?", description: "\"?\"" },
          ":",
          { type: "literal", value: ":", description: "\":\"" },
          function(condition, left, right) {
                return ["condition", condition, left, right];
              },
          "(",
          { type: "literal", value: "(", description: "\"(\"" },
          ")",
          { type: "literal", value: ")", description: "\")\"" },
          function(params) {
                return params;
              },
          "()",
          { type: "literal", value: "()", description: "\"()\"" },
          function() { return []; },
          ",",
          { type: "literal", value: ",", description: "\",\"" },
          function(param1, rest) {
                return [param1].concat(rest.map(function(v) {
                  return v[1];
                }));
              },
          function(left, right) {
                return ["assign", left, right];
              },
          "&&",
          { type: "literal", value: "&&", description: "\"&&\"" },
          "||",
          { type: "literal", value: "||", description: "\"||\"" },
          "===",
          { type: "literal", value: "===", description: "\"===\"" },
          "==",
          { type: "literal", value: "==", description: "\"==\"" },
          "!==",
          { type: "literal", value: "!==", description: "\"!==\"" },
          "!=",
          { type: "literal", value: "!=", description: "\"!=\"" },
          ">==",
          { type: "literal", value: ">==", description: "\">==\"" },
          ">=",
          { type: "literal", value: ">=", description: "\">=\"" },
          "<==",
          { type: "literal", value: "<==", description: "\"<==\"" },
          "<=",
          { type: "literal", value: "<=", description: "\"<=\"" },
          "+",
          { type: "literal", value: "+", description: "\"+\"" },
          "-",
          { type: "literal", value: "-", description: "\"-\"" },
          "%",
          { type: "literal", value: "%", description: "\"%\"" },
          "*",
          { type: "literal", value: "*", description: "\"*\"" },
          "/",
          { type: "literal", value: "/", description: "\"/\"" },
          function(left, operator, right) {
                return ["operator", operator, left, right];
              },
          function(value) { return value; },
          function(expression, modifiers) {

                for (var i = 0, n = modifiers.length; i < n; i++) {
                  expression = ["modifier", modifiers[i].name, [expression].concat(modifiers[i].parameters)];
                }

                return expression;
              },
          "|",
          { type: "literal", value: "|", description: "\"|\"" },
          function(name, parameters) {
              return {
                name: name,
                parameters: parameters || []
              };
            },
          function(context) { return context; },
          "!",
          { type: "literal", value: "!", description: "\"!\"" },
          function(not, value) {
                return ["not", value];
              },
          function(not, value) {
                return ["negative", value];
              },
          /^[0-9]/,
          { type: "class", value: "[0-9]", description: "[0-9]" },
          function(value) {
                return ["literal", parseFloat(text())];
              },
          ".",
          { type: "literal", value: ".", description: "\".\"" },
          function(group) { return ["group", group]; },
          function(expression) {
                return expression;
              },
          "true",
          { type: "literal", value: "true", description: "\"true\"" },
          "false",
          { type: "literal", value: "false", description: "\"false\"" },
          function(value) {
                return ["literal", value === "true"];
              },
          "undefined",
          { type: "literal", value: "undefined", description: "\"undefined\"" },
          function() { return ["literal", void 0]; },
          "NaN",
          { type: "literal", value: "NaN", description: "\"NaN\"" },
          function() { return ["literal", NaN]; },
          "Infinity",
          { type: "literal", value: "Infinity", description: "\"Infinity\"" },
          function() { return ["literal", Infinity]; },
          "null",
          { type: "literal", value: "null", description: "\"null\"" },
          "NULL",
          { type: "literal", value: "NULL", description: "\"NULL\"" },
          function() { return ["literal", null]; },
          function(reference, parameters) {
                return ["call", reference, parameters];
              },
          "^",
          { type: "literal", value: "^", description: "\"^\"" },
          "~>",
          { type: "literal", value: "~>", description: "\"~>\"" },
          "<~>",
          { type: "literal", value: "<~>", description: "\"<~>\"" },
          "~",
          { type: "literal", value: "~", description: "\"~\"" },
          "<~",
          { type: "literal", value: "<~", description: "\"<~\"" },
          function(bindingType, reference, path) {
                path = [reference].concat(path.map(function(p) { return p[1]; }));
                return ["reference", path, bindingType];
              },
          /^[a-zA-Z_$0-9]/,
          { type: "class", value: "[a-zA-Z_$0-9]", description: "[a-zA-Z_$0-9]" },
          function(name) { return text(); },
          "{",
          { type: "literal", value: "{", description: "\"{\"" },
          "}",
          { type: "literal", value: "}", description: "\"}\"" },
          function(values) {
                return ["hash", values];
              },
          function(values) {
                var s = {};
                for (var i = 0, n = values.length; i < n; i++) {
                  s[values[i].key] = values[i].value;
                }
                return s;
              },
          function(firstValue, additionalValues) {
                return [
                  firstValue
                ].concat(additionalValues.length ? additionalValues[0][1] : []);
              },
          function(key, value) {
                return {
                  key: key,
                  value: value
                };
              },
          function(key) { return key[1]; },
          function(key) { return key; },
          { type: "other", description: "string" },
          function(chars) {
                return ["string", chars.join("")];
              },
          "\\",
          { type: "literal", value: "\\", description: "\"\\\\\"" },
          function() { return text(); },
          "\\\"",
          { type: "literal", value: "\\\"", description: "\"\\\\\\\"\"" },
          "\\'",
          { type: "literal", value: "\\'", description: "\"\\\\'\"" },
          { type: "any", description: "any character" },
          /^[a-zA-Z]/,
          { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
          function(chars) { return chars.join(""); },
          /^[ \n\r\t]/,
          { type: "class", value: "[ \\n\\r\\t]", description: "[ \\n\\r\\t]" }
        ],

        peg$bytecode = [
          peg$decode("7!"),
          peg$decode("!7#+' 4!6 !! %"),
          peg$decode("!.\"\"\"2\"3#+q$7U+g% $0%\"\"1!3&+,$,)&0%\"\"1!3&\"\"\" !+B%7U+8%.'\"\"2'3(+(%4%6)%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("! $7%*5 \"7'*/ \"7$*) \"7(*# \"73,;&7%*5 \"7'*/ \"7$*) \"7(*# \"73\"+' 4!6*!! %"),
          peg$decode("!7U+\xC7$.+\"\"2+3,+\xB7% $!!8..\"\"2.3/9*$$\"\" -\"# !+2$7S+(%4\"60\"! %$\"# !\"# !+T$,Q&!!8..\"\"2.3/9*$$\"\" -\"# !+2$7S+(%4\"60\"! %$\"# !\"# !\"\"\" !+B%..\"\"2.3/+2%7U+(%4%61%!\"%$%# !$$# !$## !$\"# !\"# !*# \"7\""),
          peg$decode("!.2\"\"2233+\u012A$.4\"\"2435*\xD1 \".6\"\"2637*\xC5 \".8\"\"2839*\xB9 \".:\"\"2:3;*\xAD \".<\"\"2<3=*\xA1 \".>\"\"2>3?*\x95 \".@\"\"2@3A*\x89 \".B\"\"2B3C*} \".D\"\"2D3E*q \".F\"\"2F3G*e \".H\"\"2H3I*Y \".J\"\"2J3K*M \".L\"\"2L3M*A \".N\"\"2N3O*5 \".P\"\"2P3Q*) \".R\"\"2R3S+f%7-+\\%.'\"\"2'3(*) \".U\"\"2U3V*# \" T+:%7&*# \" T+*%4%6W%##\" %$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7U+\u010C$.X\"\"2X3Y+\xFC%.4\"\"2435*\xD1 \".6\"\"2637*\xC5 \".8\"\"2839*\xB9 \".:\"\"2:3;*\xAD \".<\"\"2<3=*\xA1 \".>\"\"2>3?*\x95 \".@\"\"2@3A*\x89 \".B\"\"2B3C*} \".D\"\"2D3E*q \".F\"\"2F3G*e \".H\"\"2H3I*Y \".J\"\"2J3K*M \".L\"\"2L3M*A \".N\"\"2N3O*5 \".P\"\"2P3Q*) \".R\"\"2R3S+8%.'\"\"2'3(+(%4$6Z$!!%$$# !$## !$\"# !\"# !"),
          peg$decode("!7*+>$7#+4%7.+*%4#6[##\"! %$## !$\"# !\"# !*# \"7+"),
          peg$decode("! $7)+&$,#&7)\"\"\" !+' 4!6\\!! %"),
          peg$decode("!!8.2\"\"2233*) \".]\"\"2]3^9*$$\"\" -\"# !+1$7S+'%4\"6_\" %$\"# !\"# !"),
          peg$decode("!7U+\\$.2\"\"2233+L%7,+B%.'\"\"2'3(+2%7U+(%4%6`%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7U+\\$.2\"\"2233+L%7,+B%.U\"\"2U3V+2%7U+(%4%6a%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7/+3$7-+)%4\"6b\"\"! %$\"# !\"# !"),
          peg$decode("!7U+D$ $70,#&70\"+2%7U+(%4#6c#!!%$## !$\"# !\"# !"),
          peg$decode("!.X\"\"2X3Y+B$7/+8%.'\"\"2'3(+(%4#6Z#!!%$## !$\"# !\"# !"),
          peg$decode("!7U+M$ $0d\"\"1!3e+,$,)&0d\"\"1!3e\"\"\" !+(%4\"6f\"! %$\"# !\"# !"),
          peg$decode("!7/+W$7U+M%.g\"\"2g3h+=%7U+3%71+)%4%6i%\"$ %$%# !$$# !$## !$\"# !\"# !*t \"!7/+W$7U+M%.g\"\"2g3h+=%7U+3%72+)%4%6j%\"$ %$%# !$$# !$## !$\"# !\"# !*/ \"!7/+' 4!6k!! %"),
          peg$decode("!.l\"\"2l3m+\u0146$ $72*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0n\"\"1!3o+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0n\"\"1!3o+#%'\"%$\"# !\"# !\"\"\" !+& 4!6p! %,\xA1&72*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0n\"\"1!3o+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0n\"\"1!3o+#%'\"%$\"# !\"# !\"\"\" !+& 4!6p! %\"+8%.l\"\"2l3m+(%4#6q#!!%$## !$\"# !\"# !*\u0157 \"!.r\"\"2r3s+\u0146$ $72*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0t\"\"1!3u+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0t\"\"1!3u+#%'\"%$\"# !\"# !\"\"\" !+& 4!6p! %,\xA1&72*\x9B \"! $!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0t\"\"1!3u+#%'\"%$\"# !\"# !+U$,R&!!8.]\"\"2]3^9*$$\"\" -\"# !+3$0t\"\"1!3u+#%'\"%$\"# !\"# !\"\"\" !+& 4!6p! %\"+8%.r\"\"2r3s+(%4#6q#!!%$## !$\"# !\"# !"),
          peg$decode("!.]\"\"2]3^+V$7U+L%74+B%7U+8%.v\"\"2v3w+(%4%6x%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!72+' 4!6y!! %"),
          peg$decode("!77+^$.z\"\"2z3{+N%74+D%.|\"\"2|3}+4%74+*%4%6~%#$\" %$%# !$$# !$## !$\"# !\"# !*# \"77"),
          peg$decode("!.\"\"23\x80+B$76+8%.\x81\"\"2\x813\x82+(%4#6\x83#!!%$## !$\"# !\"# !*4 \"!.\x84\"\"2\x843\x85+& 4!6\x86! %"),
          peg$decode("!74+q$ $!.\x87\"\"2\x873\x88+-$74+#%'\"%$\"# !\"# !,>&!.\x87\"\"2\x873\x88+-$74+#%'\"%$\"# !\"# !\"+)%4\"6\x89\"\"! %$\"# !\"# !"),
          peg$decode("!7<+C$.g\"\"2g3h+3%77+)%4#6\x8A#\"\" %$## !$\"# !\"# !*# \"78"),
          peg$decode("!79+\u0104$.\x8B\"\"2\x8B3\x8C*\xDD \".\x8D\"\"2\x8D3\x8E*\xD1 \".\x8F\"\"2\x8F3\x90*\xC5 \".\x91\"\"2\x913\x92*\xB9 \".\x93\"\"2\x933\x94*\xAD \".\x95\"\"2\x953\x96*\xA1 \".\x97\"\"2\x973\x98*\x95 \".\x99\"\"2\x993\x9A*\x89 \".'\"\"2'3(*} \".\x9B\"\"2\x9B3\x9C*q \".\x9D\"\"2\x9D3\x9E*e \".2\"\"2233*Y \".\x9F\"\"2\x9F3\xA0*M \".\xA1\"\"2\xA13\xA2*A \".\xA3\"\"2\xA33\xA4*5 \".\xA5\"\"2\xA53\xA6*) \".\xA7\"\"2\xA73\xA8+4%78+*%4#6\xA9##\"! %$## !$\"# !\"# !*# \"79"),
          peg$decode("!7U+<$7:+2%7U+(%4#6\xAA#!!%$## !$\"# !\"# !"),
          peg$decode("!7=+;$ $7;,#&7;\"+)%4\"6\xAB\"\"! %$\"# !\"# !*) \"7H*# \"7<"),
          peg$decode("!.\xAC\"\"2\xAC3\xAD+W$7U+M%7J+C%75*# \" T+3%7U+)%4%6\xAE%\"\"!%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7U+<$7>+2%7U+(%4#6\xAF#!!%$## !$\"# !\"# !"),
          peg$decode("!.\xB0\"\"2\xB03\xB1+3$7=+)%4\"6\xB2\"\"! %$\"# !\"# !*b \"!.\xB0\"\"2\xB03\xB1*) \".\xA1\"\"2\xA13\xA2+3$7=+)%4\"6\xB3\"\"! %$\"# !\"# !*/ \"7B*) \"7H*# \"7<"),
          peg$decode("7A*5 \"7K*/ \"7?*) \"7P*# \"7I"),
          peg$decode("!!.\xA1\"\"2\xA13\xA2*# \" T+i$! $0\xB4\"\"1!3\xB5+,$,)&0\xB4\"\"1!3\xB5\"\"\" !+3$7@*# \" T+#%'\"%$\"# !\"# !*# \"7@+#%'\"%$\"# !\"# !+' 4!6\xB6!! %"),
          peg$decode("!.\xB7\"\"2\xB73\xB8+H$ $0\xB4\"\"1!3\xB5+,$,)&0\xB4\"\"1!3\xB5\"\"\" !+#%'\"%$\"# !\"# !"),
          peg$decode("!.\"\"23\x80+B$74+8%.\x81\"\"2\x813\x82+(%4#6\xB9#!!%$## !$\"# !\"# !"),
          peg$decode("!7C*5 \"7D*/ \"7G*) \"7E*# \"7F+' 4!6\xBA!! %"),
          peg$decode("!.\xBB\"\"2\xBB3\xBC*) \".\xBD\"\"2\xBD3\xBE+' 4!6\xBF!! %"),
          peg$decode("!.\xC0\"\"2\xC03\xC1+& 4!6\xC2! %"),
          peg$decode("!.\xC3\"\"2\xC33\xC4+& 4!6\xC5! %"),
          peg$decode("!.\xC6\"\"2\xC63\xC7+& 4!6\xC8! %"),
          peg$decode("!.\xC9\"\"2\xC93\xCA*) \".\xCB\"\"2\xCB3\xCC+& 4!6\xCD! %"),
          peg$decode("!7<+3$75+)%4\"6\xCE\"\"! %$\"# !\"# !"),
          peg$decode("!.\xCF\"\"2\xCF3\xD0*M \".\xD1\"\"2\xD13\xD2*A \".\xD3\"\"2\xD33\xD4*5 \".\xD5\"\"2\xD53\xD6*) \".\xD7\"\"2\xD73\xD8*# \" T+\x90$7U+\x86%7J+|% $!.\xB7\"\"2\xB73\xB8+-$7J+#%'\"%$\"# !\"# !,>&!.\xB7\"\"2\xB73\xB8+-$7J+#%'\"%$\"# !\"# !\"+4%7U+*%4%6\xD9%#$\"!%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("! $0\xDA\"\"1!3\xDB+,$,)&0\xDA\"\"1!3\xDB\"\"\" !+' 4!6\xDC!! %"),
          peg$decode("!.\xDD\"\"2\xDD3\xDE+\\$7U+R%7L*# \" T+B%7U+8%.\xDF\"\"2\xDF3\xE0+(%4%6\xE1%!\"%$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7M+' 4!6\xE2!! %"),
          peg$decode("!7N+q$ $!.\x87\"\"2\x873\x88+-$7M+#%'\"%$\"# !\"# !,>&!.\x87\"\"2\x873\x88+-$7M+#%'\"%$\"# !\"# !\"+)%4\"6\xE3\"\"! %$\"# !\"# !"),
          peg$decode("!7U+]$7O+S%7U+I%.|\"\"2|3}+9%74*# \" T+)%4%6\xE4%\"# %$%# !$$# !$## !$\"# !\"# !"),
          peg$decode("!7P+' 4!6\xE5!! %*/ \"!7J+' 4!6\xE6!! %"),
          peg$decode("8!.l\"\"2l3m+J$ $7Q,#&7Q\"+8%.l\"\"2l3m+(%4#6\xE8#!!%$## !$\"# !\"# !*[ \"!.r\"\"2r3s+J$ $7R,#&7R\"+8%.r\"\"2r3s+(%4#6\xE8#!!%$## !$\"# !\"# !9*\" 3\xE7"),
          peg$decode("!!8.l\"\"2l3m*) \".\xE9\"\"2\xE93\xEA9*$$\"\" -\"# !+1$7S+'%4\"6\xEB\" %$\"# !\"# !*) \".\xEC\"\"2\xEC3\xED"),
          peg$decode("!!8.r\"\"2r3s*) \".\xE9\"\"2\xE93\xEA9*$$\"\" -\"# !+1$7S+'%4\"6\xEB\" %$\"# !\"# !*) \".\xEE\"\"2\xEE3\xEF"),
          peg$decode("-\"\"1!3\xF0"),
          peg$decode("! $0\xF1\"\"1!3\xF2+,$,)&0\xF1\"\"1!3\xF2\"\"\" !+' 4!6\xF3!! %"),
          peg$decode(" $0\xF4\"\"1!3\xF5,)&0\xF4\"\"1!3\xF5\"")
        ],

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleIndices)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleIndex = peg$startRuleIndices[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$decode(s) {
      var bc = new Array(s.length), i;

      for (i = 0; i < s.length; i++) {
        bc[i] = s.charCodeAt(i) - 32;
      }

      return bc;
    }

    function peg$parseRule(index) {
      var bc    = peg$bytecode[index],
          ip    = 0,
          ips   = [],
          end   = bc.length,
          ends  = [],
          stack = [],
          params, i;

      function protect(object) {
        return Object.prototype.toString.apply(object) === "[object Array]" ? [] : object;
      }

      while (true) {
        while (ip < end) {
          switch (bc[ip]) {
            case 0:
              stack.push(protect(peg$consts[bc[ip + 1]]));
              ip += 2;
              break;

            case 1:
              stack.push(peg$currPos);
              ip++;
              break;

            case 2:
              stack.pop();
              ip++;
              break;

            case 3:
              peg$currPos = stack.pop();
              ip++;
              break;

            case 4:
              stack.length -= bc[ip + 1];
              ip += 2;
              break;

            case 5:
              stack.splice(-2, 1);
              ip++;
              break;

            case 6:
              stack[stack.length - 2].push(stack.pop());
              ip++;
              break;

            case 7:
              stack.push(stack.splice(stack.length - bc[ip + 1], bc[ip + 1]));
              ip += 2;
              break;

            case 8:
              stack.pop();
              stack.push(input.substring(stack[stack.length - 1], peg$currPos));
              ip++;
              break;

            case 9:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1]) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 10:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1] === peg$FAILED) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 11:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (stack[stack.length - 1] !== peg$FAILED) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 12:
              if (stack[stack.length - 1] !== peg$FAILED) {
                ends.push(end);
                ips.push(ip);

                end = ip + 2 + bc[ip + 1];
                ip += 2;
              } else {
                ip += 2 + bc[ip + 1];
              }

              break;

            case 13:
              ends.push(end);
              ips.push(ip + 3 + bc[ip + 1] + bc[ip + 2]);

              if (input.length > peg$currPos) {
                end = ip + 3 + bc[ip + 1];
                ip += 3;
              } else {
                end = ip + 3 + bc[ip + 1] + bc[ip + 2];
                ip += 3 + bc[ip + 1];
              }

              break;

            case 14:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (input.substr(peg$currPos, peg$consts[bc[ip + 1]].length) === peg$consts[bc[ip + 1]]) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 15:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (input.substr(peg$currPos, peg$consts[bc[ip + 1]].length).toLowerCase() === peg$consts[bc[ip + 1]]) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 16:
              ends.push(end);
              ips.push(ip + 4 + bc[ip + 2] + bc[ip + 3]);

              if (peg$consts[bc[ip + 1]].test(input.charAt(peg$currPos))) {
                end = ip + 4 + bc[ip + 2];
                ip += 4;
              } else {
                end = ip + 4 + bc[ip + 2] + bc[ip + 3];
                ip += 4 + bc[ip + 2];
              }

              break;

            case 17:
              stack.push(input.substr(peg$currPos, bc[ip + 1]));
              peg$currPos += bc[ip + 1];
              ip += 2;
              break;

            case 18:
              stack.push(peg$consts[bc[ip + 1]]);
              peg$currPos += peg$consts[bc[ip + 1]].length;
              ip += 2;
              break;

            case 19:
              stack.push(peg$FAILED);
              if (peg$silentFails === 0) {
                peg$fail(peg$consts[bc[ip + 1]]);
              }
              ip += 2;
              break;

            case 20:
              peg$reportedPos = stack[stack.length - 1 - bc[ip + 1]];
              ip += 2;
              break;

            case 21:
              peg$reportedPos = peg$currPos;
              ip++;
              break;

            case 22:
              params = bc.slice(ip + 4, ip + 4 + bc[ip + 3]);
              for (i = 0; i < bc[ip + 3]; i++) {
                params[i] = stack[stack.length - 1 - params[i]];
              }

              stack.splice(
                stack.length - bc[ip + 2],
                bc[ip + 2],
                peg$consts[bc[ip + 1]].apply(null, params)
              );

              ip += 4 + bc[ip + 3];
              break;

            case 23:
              stack.push(peg$parseRule(bc[ip + 1]));
              ip += 2;
              break;

            case 24:
              peg$silentFails++;
              ip++;
              break;

            case 25:
              peg$silentFails--;
              ip++;
              break;

            default:
              throw new Error("Invalid opcode: " + bc[ip] + ".");
          }
        }

        if (ends.length > 0) {
          end = ends.pop();
          ip = ips.pop();
        } else {
          break;
        }
      }

      return stack[0];
    }


    /*jshint laxcomma:false */

    function trimWhitespace(ws) {
      return trimNewLineChars(ws).replace(/(^[\r\n]+)|([\r\n]+$)/, " ");
    }

    function trimEnds(ws) {
      return ws.replace(/(^\s+)|(\s+$)/, "").replace(/[\r\n]/g, "\\n");
    }

    function trimNewLineChars(ws) {
      return ws.replace(/[ \r\n\t]+/g, " ");
    }

    function trimmedText() {
      return trimWhitespace(text());
    }

    function attrValues(values) {

      values = values.filter(function(v) {
        return !/^[\n\t\r]+$/.test(v.value);
      });

      if (values.length === 1 && values[0].type === "string") {
        return values[0];
      } else {
        return values;
      }
    }

    function trimTextExpressions(expressions) {

      function _trim(exprs) {
        var expr;
        for (var i = exprs.length; i--;) {
          expr = exprs[i];
          if (expr.type == "textNode" && !/\S/.test(expr.value) && !expr.decoded) {
            exprs.splice(i, 1);
          } else {
            break;
          }
        }
        return exprs;
      }

      return _trim(_trim(expressions.reverse()).reverse());
    }

    function expression(name) {
      return Array.prototype.slice.call(arguments);
    }



    peg$result = peg$parseRule(peg$startRuleIndex);

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
},{}],23:[function(require,module,exports){
var protoclass = require(47);

/**
 */

function Reference(view, path, gettable, settable) {
  this.view     = view;
  this.path     = path;
  this.settable = settable !== false;
  this.gettable = gettable !== false;
}

/**
 */

protoclass(Reference, {

  /**
   */

  __isReference: true,

  /**
   */

  value: function(value) {
    if (!arguments.length) {
      return this.gettable ? this.view.get(this.path) : void 0;
    }
    if (this.settable) this.view.set(this.path, value);
  },

  /**
   */

  toString: function() {
    return this.view.get(this.path);
  }
});

module.exports = Reference;

},{"47":47}],24:[function(require,module,exports){
var ivd                = require(40);
var compiler           = require(17);
var extend             = require(48);
var defaultComponents  = require(19);
var defaultAttributes  = require(13);
var createBindingClass = require(21);
var View               = require(30);



/**
 */

module.exports = function(source, options) {
  var createVNode = typeof source === "string" ? compiler.compile(source, options) : source;
  var vnode       = createVNode(ivd.fragment, ivd.element, ivd.text, ivd.comment, ivd.dynamic, createBindingClass);

  if (!options) options = {};

  if (!options.document && typeof document !== "undefined") {
    options.document = document;
  }

  return ivd.template(vnode, extend({
    components : defaultComponents,
    attributes : defaultAttributes,
    viewClass  : View
  }, options));
};

},{"13":13,"17":17,"19":19,"21":21,"30":30,"40":40,"48":48}],25:[function(require,module,exports){
(function (process){
var protoclass = require(47);
var async      = require(27);

/**
 */

function Transitions() {
  this._enter = [];
  this._exit  = [];
}

/**
 */

module.exports = protoclass(Transitions, {

  /**
   */

  push: function(transition) {
    if (transition.enter) this._enter.push(transition);
    if (transition.exit) this._exit.push(transition);
  },

  /**
   */

  enter: function() {
    if (!this._enter.length) return false;
    for (var i = 0, n = this._enter.length; i < n; i++) {
      this._enter[i].enter();
    }
  },

  /**
   */

  exit: function(complete) {
    if (!this._exit.length) return false;
    var self = this;
    process.nextTick(function() {
      async.each(self._exit, function(transition, next) {
        transition.exit(next);
      }, complete);
    });

    return true;
  }
});

}).call(this,require(31))
},{"27":27,"31":31,"47":47}],26:[function(require,module,exports){
var extend = require(48);
var parser = require(22);

/**
 */

function Transpiler() {
  for (var k in this) {
    if (k.charAt(0) === "_") {
      this[k] = this[k].bind(this);
    }
  }
  this.transpile = this.transpile.bind(this);
}

/**
 */

function _dashToCamelCase(string) {
  return string.split("-").map(function(part, i) {
    var p = part.toLowerCase();
    return i > 0 ? p.charAt(0).toUpperCase() + p.substr(1) : p;
  }).join("");
}
/**
 */

extend(Transpiler.prototype, {

  /**
   */

  transpile: function(source) {
    return this._root(parser.parse(source));
  },

  /**
   */

  _root: function(elements) {

    var buffer = "function(fragment, element, text, comment, dynamic, createBindingClass) {";
    var fragment = "fragment(" + elements.map(this._expression).join(",") + ")";
    buffer += "return " + fragment;
    buffer += "}";

    return buffer;
  },

  /**
   */

  _expression: function(expression) {
    return this["_" + expression[0]](expression);
  },

  /**
   */

  _element: function(expression) {
    var buffer = "element('" + expression[1] + "'";

    var dynamicAttributes = [];

    buffer += ", {";

    var attrs = [];

    buffer += expression[2].map(function(attr) {
      var value = attr[2];
      if (!value.length || (value.length === 1 && value[0][0] === "string")) {
        return "'" + attr[1] + "':" + (value.length ? this._expression(value[0]) : "true");
      } else {
        dynamicAttributes.push(attr);
      }
    }.bind(this)).filter(function(str) {
      return !!str;
    }).join(",");

    buffer += "}";

    expression[3].forEach(function(child) {
      buffer += "," + this._expression(child);
    }.bind(this));

    var children = expression[3];

    buffer += ")";

    if (dynamicAttributes.length) {

      var dynamicAttrBuffer = "";
      var staticAttrBuffer  = "";

      dynamicAttributes.forEach(function(expression) {

        var type = expression[0];
        // var key  = _dashToCamelCase(expression[1]);

        dynamicAttrBuffer += "this";
        if (type === "block") {
          dynamicAttrBuffer += ".ref.nodeValue = " + this._expression(expression[1]);
        } else if (type === "attribute") {
          var value = expression[2].map(this._expression).join("+");
          if (value == "") {
            value = "true";
          }
          dynamicAttrBuffer += ".setAttribute('" + expression[1] + "', " + value + ");";
        } else if (type === "property") {
          // dynamicAttrBuffer += ".ref." + expression[1] + "=" + this._expression(expression[2]);
          dynamicAttrBuffer += ".setProperty('" + expression[1] + "', " + this._expression(expression[2]) + ");";
        }
      }.bind(this));

      if (dynamicAttrBuffer.length) {
        dynamicAttrBuffer = "function(view) {" + dynamicAttrBuffer + "}";
      }

      if (staticAttrBuffer.length) {
        staticAttrBuffer = "function() { var self = this; " + staticAttrBuffer + "}";
      }

      if (dynamicAttrBuffer.length || staticAttrBuffer.length) {
        buffer  = "dynamic(" + buffer + ",";
        buffer += "createBindingClass(" + (staticAttrBuffer.length ? staticAttrBuffer : "void 0") + ", " + (dynamicAttrBuffer ? dynamicAttrBuffer : "void 0") + ")";
        buffer += ")";
      }

    }

    return buffer;
  },

  /**
   */

  __addReference: function(expression) {
    var name = "_" + (++this._refCounter);
    this._refs[name] = expression;
    return name;
  },

  /**
   */

  _block: function(expression) {

    // TODO - check for unbound expressions here
    var buffer = "dynamic(text(), createBindingClass(void 0, function(view) {";
    buffer += "this.ref.nodeValue = " + this._expression(expression[1]) + ";";
    return buffer + "}))";
  },

  /**
   */

  _text: function(expression) {
    return "text('" + expression[1] + "')";
  },

  /**
   */

  _comment: function(expression) {
    return "comment('" + expression[1] + "')";
  },

  /**
   */

  _hash: function(expression) {

    var items = expression[1];

    var buffer = [];

    for (var key in items) {
      buffer.push("'" + key + "':" + this._expression(items[key]));
    }

    return "{" + buffer.join(",") + "}";
  },

  /**
   */

  _script: function(expression) {
    return this._expression(expression[1]);
  },

  /**
   */

  _reference: function(expression) {
    if (expression[2]) {

      var gettable = !!~expression[2].indexOf("<~");
      var settable = !!~expression[2].indexOf("~>");

      return "view.ref('" + expression[1].join(".") + "', " + gettable + ", " + settable + ")";
    }
    return "view.get('" + expression[1].join(".") + "')";
  },

  /**
   */

  _string: function(expression) {
    return "'" + expression[1] + "'";
  },

  /**
   */

  _operator: function(expression) {
    return this._expression(expression[2]) + expression[1] + this._expression(expression[3]);
  },

  /**
   */

  _condition: function(expression) {
    return this._expression(expression[1])  +
    "?" + this._expression(expression[2]) +
    ":" + this._expression(expression[3]);
  },

  /**
   */

  _literal: function(expression) {
    return expression[1];
  },

  /**
   */

  _not: function(expression) {
    return "!" + this._expression(expression[1]);
  },

  /**
   */

  _negative: function(expression) {
    return "-" + this._expression(expression[1]);
  },

  /**
   */

  _call: function(expression) {
    var buffer = "view.call('" + expression[1][1].join(".") + "', [";
    buffer += expression[2].map(this._expression).join(",");
    return buffer + "])";
  },

  /**
   */

  _modifier: function(expression) {
    return "this.options.modifiers." + expression[1] + "(" + expression[2].map(this._expression).join(",") + ")";
  },

  /**
   */

  _group: function(expression) {
    return "(" + this._expression(expression[1]) + ")";
  },

  /**
   */

  __findExpressions: function(type, expr) {
    var exprs = [];

    this.__traverse(expr, function(expr) {
      if (expr[0] === type) exprs.push(expr);
    });

    return exprs;
  },

  /**
   */

  __traverse: function(expr, iterator) {
    iterator(expr);
    expr.forEach(function(v) {
      if (v && typeof v === "object") {
        this.__traverse(v, iterator);
      }
    }.bind(this));

  }
});

/**
 */

module.exports = new Transpiler();

},{"22":22,"48":48}],27:[function(require,module,exports){
module.exports = {

  /**
   */

  each: function(items, each, complete) {

    var total     = items.length;
    var completed = 0;

    items.forEach(function(item) {
      var called = false;
      each(item, function() {
        if (called) throw new Error("callback called twice");
        called = true;
        if (++completed === total && complete) complete();
      });
    });
  }
};

},{}],28:[function(require,module,exports){
module.exports = function(callback, context) {
  if (callback.bind) return callback.bind.apply(callback, [context].concat(Array.prototype.slice.call(arguments, 2)));
  return function() {
    return callback.apply(context, arguments);
  };
};

},{}],29:[function(require,module,exports){
/* istanbul ignore next */
function _stringifyNode(node) {

  var buffer = "";

  if (node.nodeType === 11) {
    for (var i = 0, n = node.childNodes.length; i < n; i++) {
      buffer += _stringifyNode(node.childNodes[i]);
    }
    return buffer;
  }

  buffer = node.nodeValue || node.outerHTML || "";

  if (node.nodeType === 8) {
    buffer = "<!--" + buffer + "-->";
  }

  return buffer;
}

module.exports = _stringifyNode;

},{}],30:[function(require,module,exports){
(function (global){
var ivd            = require(40);
var extend         = require(48);
var BaseView       = ivd.View;
var Accessor       = require(2);
var _stringifyNode = require(29);
var Transitions    = require(25);
var Reference      = require(23);

/**
 */

function PaperclipView(node, template, options) {

  if (!options) options = {};

  this.parent       = options.parent;
  this.accessor     = this.parent ? this.parent.accessor : new Accessor();
  this.transitions  = new Transitions();
  this._remove      = this._remove.bind(this);

  BaseView.call(this, node, template, options);
}

/**
 */

extend(PaperclipView.prototype, BaseView.prototype, {

  /**
   */

  get: function(keypath) {
    var v =  this.accessor.get(this.context, keypath);
    return v != void 0 ? v : this.parent ? this.parent.get(keypath) : void 0;
  },

  /**
   */

  set: function(keypath, value) {
    return this.accessor.set(this.context, keypath, value);
  },

  /**
   */

  ref: function(keypath, gettable, settable) {
    if (!this._refs) this._refs = {};

    return new Reference(this, keypath, gettable, settable);
    // return this._refs[keypath] || (this._refs[keypath] = new Reference(this, keypath, gettable, settable));
  },

  /**
   */

  call: function(keypath, params) {
    var v =  this.accessor.get(this.context, keypath);
    return v != void 0 ? this.accessor.call(this.context, keypath, params) : this.parent ? this.parent.call(keypath, params) : void 0;
  },

  /**
   */

  update: function(context) {
    this.context         = context;
    BaseView.prototype.update.call(this, this);
  },

  /**
   * for testing. TODO - move this stuff to sections instead.
   */

  toString: function() {

    if (this.template.section.document === global.document) {
      return _stringifyNode(this.section.start ? this.section.start.parentNode : this.section.node);
    }

    return (this.section.start ? this.section.start.parentNode : this.section.node).toString();
  },

  /**
   */

  render: function() {
    var section = BaseView.prototype.render.call(this);
    this.transitions.enter();
    return section;
  },

  /**
   */

  remove: function() {
    if (this.transitions.exit(this._remove)) return;
    this._remove();
    return this;
  },

  /**
   */

  _remove: function() {
    BaseView.prototype.remove.call(this);
    this.update(void 0);
  }
});

/**
 */

module.exports = PaperclipView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"2":2,"23":23,"25":25,"29":29,"40":40,"48":48}],31:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],32:[function(require,module,exports){
var extend        = require(46);
var getNodeByPath = require(33);
var getNodePath   = require(34);

/**
 */

function FragmentSection(document, start, end) {
  this.document = document;

  this.start = start || document.createTextNode("");
  this.end   = end   || document.createTextNode("");

  if (!this.start.parentNode) {
    var parent = document.createDocumentFragment();
    parent.appendChild(this.start);
    parent.appendChild(this.end);
  }
}

/**
 */

extend(FragmentSection.prototype, {

  /**
   */

  appendChild: function(node) {
    this.end.parentNode.insertBefore(node, this.end);
  },

  /**
   */

  render: function() {
    return this.start.parentNode;
  },

  /**
   */

  remove: function() {
    var node     = this.document.createDocumentFragment();
    var start    = this.start;
    var current  = start.nextSibling;
    var end      = this.end;

    while (current !== end) {
      node.appendChild(current);
      current = start.nextSibling;
    }

    node.insertBefore(start, node.childNodes[0]);
    node.appendChild(end);

    return this;
  },

  /**
   */

  createMarker: function() {
    return new Marker(this.document, getNodePath(this.start), getNodePath(this.end));
  },

  /**
   */

  clone: function() {
    var parentClone;

    // fragment?
    if (this.start.parentNode.nodeType === 11) {
      parentClone = this.start.parentNode.cloneNode(true);
    } else {
      parentClone  = this.document.createDocumentFragment();
      var children = this._getChildNodes();
      var n        = children.length;

      for (var i = 0; i < n; i++) {
        parentClone.appendChild(children[i].cloneNode(true));
      }
    }

    var first = parentClone.childNodes[0];
    var last  = parentClone.childNodes[parentClone.childNodes.length - 1];

    return new FragmentSection(this.document, first, last);
  },

  /**
   */

  _getChildNodes: function() {
    var current = this.start;
    var end     = this.end.nextSibling;
    var children = [];
    while (current !== end) {
      children.push(current);
      current = current.nextSibling;
    }
    return children;
  }
});

/**
 */

function Marker(document, startPath, endPath) {
  this.document  = document;
  this.startPath = startPath;
  this.endPath   = endPath;
}

/**
 */

extend(Marker.prototype, {

  /**
   */

  createSection: function(root) {
    return new FragmentSection(this.document, getNodeByPath(root, this.startPath), getNodeByPath(root, this.endPath));
  }
});

module.exports = FragmentSection;

},{"33":33,"34":34,"46":46}],33:[function(require,module,exports){
module.exports = function(root, path) {

  var c = root;

  for (var i = 0, n = path.length; i < n; i++) {
    c = c.childNodes[path[i]];
  }

  return c;
};

},{}],34:[function(require,module,exports){
module.exports = function(node) {

  var path = [];
  var p    = node.parentNode;
  var c    = node;

  while (p) {

    path.unshift(Array.prototype.indexOf.call(p.childNodes, c));
    c = p;

    p = p.parentNode;

    // virtual nodes - must be skipped
    while (p && p.nodeType > 12) p = p.parentNode;
  }

  return path;
};

},{}],35:[function(require,module,exports){
var extend        = require(46);
var getNodeByPath = require(33);
var getNodePath   = require(34);

/**
 */

function NodeSection(document, node) {
  this.document = document;
  this.node     = node;
}

/**
 */

extend(NodeSection.prototype, {

  /**
   */

  createMarker: function() {
    return new Marker(this.document, getNodePath(this.node));
  },

  /**
   */

  appendChild: function(childNode) {
    this.node.appendChild(childNode);
  },

  /**
   */

  render: function() {
    return this.node;
  },

  /**
   */

  remove: function() {
    if (this.node.parentNode) this.node.parentNode.removeChild(this.node);
  },

  /**
   */

  clone: function() {
    return new NodeSection(this.document, this.node.cloneNode(true));
  }
});

/**
 */

function Marker(document, path) {
  this.document = document;
  this.path     = path;
}

/**
 */

extend(Marker.prototype, {

  /**
   */

  createSection: function(root) {
    return new NodeSection(this.document, this.findNode(root));
  },

  /**
   */

  findNode: function(root) {
    return getNodeByPath(root, this.path);
  }
});

module.exports = NodeSection;

},{"33":33,"34":34,"46":46}],36:[function(require,module,exports){
/**
 */

function Comment(nodeValue) {
  this.nodeValue = nodeValue || "";
}

/**
 */

Comment.prototype.nodeType = 8;

/**
 */

Comment.prototype.freeze = function(options) {
  return options.document.createComment(this.nodeValue);
};

/**
 */

module.exports = function(nodeValue) {
  return new Comment(nodeValue);
};

},{}],37:[function(require,module,exports){
var extend        = require(46);
var getNodePath   = require(34);
var getNodeByPath = require(33);

/**
 */

function DynamicNode(vnode, bindingClass) {
  this.vnode            = vnode;
  this.bindingClass     = bindingClass;
  this.vnode.parentNode = this;
}

/**
 */

DynamicNode.prototype.freeze = function(options, hydrators) {
  if (options.components[this.vnode.nodeName]) {
    return this.freezeComponent(options, hydrators);
  } else {
    return this.freezeElement(options, hydrators);
  }
};

/**
 */

DynamicNode.prototype.freezeComponent = function(options, hydrators) {
  var h2 = [];
  var element = this.vnode.freeze(options, h2);
  hydrators.push(new ComponentHydrator(h2[0], this.bindingClass, options));
  return element;
};

/**
 */

DynamicNode.prototype.freezeElement = function(options, hydrators) {
  var node = this.vnode.freeze(options, hydrators);
  hydrators.push(new Hydrator(node, this.bindingClass, options));
  return node;
};

/**
 */

function Hydrator(ref, bindingClass, options) {
  this.options      = options;
  this.ref          = ref;
  this.bindingClass = bindingClass;
}

/**
 */

extend(Hydrator.prototype, {

  /**
   */

  hydrate: function(root, view) {
    if (!this._refPath) this._refPath = getNodePath(this.ref);
    view.bindings.push(new this.bindingClass(getNodeByPath(root, this._refPath), view));
  }
});
/**
 */

function ComponentHydrator(hydrator, bindingClass, options) {
  this.options       = options;
  this.hydrator      = hydrator;
  this.bindingClass  = bindingClass;
}

/**
 */

extend(ComponentHydrator.prototype, {
  hydrate: function(root, view) {
    this.hydrator.hydrate(root, view);
    var component = view.bindings[view.bindings.length - 1];
    view.bindings.splice(view.bindings.indexOf(component), 0, new this.bindingClass(component, view));
  }
});

/**
 */

module.exports = function(vnode, bindingClass) {
  return new DynamicNode(vnode, bindingClass);
};

},{"33":33,"34":34,"46":46}],38:[function(require,module,exports){
var createSection    = require(41);
var fragment         = require(39);
var FragmentSection  = require(32);
var NodeSection      = require(35);

/**
 */

function Element(nodeName, attributes, childNodes) {
  this.nodeName   = String(nodeName).toLowerCase();
  this.attributes = attributes;
  this.childNodes = childNodes;
  for (var i = childNodes.length; i--;) childNodes[i].parentNode = this;
}

/**
 */

Element.prototype.nodeType = 1;

/**
 */

Element.prototype.freeze = function(options, hydrators) {

  var components = options.components || {};
  var attributes = options.attributes || {};

  if (components[this.nodeName]) {
    return this._freezeComponent(components[this.nodeName], options, hydrators);
  }

  return this._freezeElement(options, hydrators);
};

/**
 */

Element.prototype._freezeComponent = function(clazz, options, hydrators) {

  // TODO - check parent node to see if there are anymore children. If not, then user NodeSection
  var section = new FragmentSection(options.document);
  var frag    = fragment.apply(this, this.childNodes);
  hydrators.push(new ComponentHydrator(clazz, section, frag, this._splitAttributes(options), options));
  return section.render();
};

/**
 */

Element.prototype._freezeElement = function(options, hydrators) {

  var element = options.document.createElement(this.nodeName);

  var inf = this._splitAttributes(options);

  for (var attrName in inf.staticAttributes) {
    element.setAttribute(attrName, inf.staticAttributes[attrName]);
  }

  for (var i = 0, n = this.childNodes.length; i < n; i++) {
    element.appendChild(this.childNodes[i].freeze(options, hydrators));
  }

  if (Object.keys(inf.dynamicAttributes).length) {
    hydrators.push(new ElementAttributeHydrator(new NodeSection(options.document, element), options, inf.dynamicAttributes));
  }

  return element;
};


/**
 */

Element.prototype._splitAttributes = function(options) {

  var dynamicAttributes = {};
  var staticAttributes  = {};

  if (options.attributes) {
    for (var key in this.attributes) {
      var attrClass = options.attributes[key];
      if (attrClass && (!attrClass.test || attrClass.test(this, key, this.attributes[key]))) {
        dynamicAttributes[key] = this.attributes[key];
      } else {
        staticAttributes[key]  = this.attributes[key];
      }
    }
  } else {
    staticAttributes = this.attributes;
  }


  return {
    dynamicAttributes : dynamicAttributes,
    staticAttributes  : staticAttributes
  };
};

/**
*/

function ComponentHydrator(clazz, section, childNodes, attrInfo, options) {
  this.clazz                = clazz;
  this.section              = section;
  this.childNodes           = childNodes;
  this.dynamicAttributes    = attrInfo.dynamicAttributes;
  this.attributes           = attrInfo.staticAttributes;
  this.hasDynamicAttributes = !!Object.keys(attrInfo.dynamicAttributes).length;
  this.options              = options;
}

/**
*/

ComponentHydrator.prototype.hydrate = function(root, view) {
  if (!this._marker) this._marker = this.section.createMarker();
  var ref = new this.clazz(this._marker.createSection(root), this.childNodes, this.attributes, view);
  if (this.hasDynamicAttributes) {
    _hydrateDynamicAttributes(ref, this.options, this.dynamicAttributes, view);
  }
  view.bindings.push(ref);
};

/**
 */

module.exports = function(name, attributes, children) {
  return new Element(name, attributes, Array.prototype.slice.call(arguments, 2));
};

/**
 */

function ElementAttributeHydrator(section, options, dynamicAttributes) {
  this.section           = section;
  this.options           = options;
  this.dynamicAttributes = dynamicAttributes;
}

/**
 */

ElementAttributeHydrator.prototype.hydrate = function(root, view) {
  if (!this._marker) this._marker = this.section.createMarker();
  _hydrateDynamicAttributes(this._marker.findNode(root), this.options, this.dynamicAttributes, view);
};

/**
 */

function _hydrateDynamicAttributes(ref, options, dynamicAttributes, view) {
  for (var key in dynamicAttributes) {
    var clazz = options.attributes[key];
    var attr = new clazz(ref, key, dynamicAttributes[key], view);
    if (attr.update) view.bindings.push(attr);
  }
}

},{"32":32,"35":35,"39":39,"41":41}],39:[function(require,module,exports){

/**
 */

function Fragment(childNodes) {
  this.childNodes = childNodes;
  for (var i = childNodes.length; i--;) childNodes[i].parentNode = this;
}

/**
 */

Fragment.prototype.nodeType = 11;

/**
 */

Fragment.prototype.freeze = function(options, hydrators) {

  var fragment = options.document.createDocumentFragment();

  for (var i = 0, n = this.childNodes.length; i < n; i++) {
    fragment.appendChild(this.childNodes[i].freeze(options, hydrators));
  }

  return fragment;
};

/**
 */

module.exports = function() {
  var children = Array.prototype.slice.call(arguments);
  if (children.length === 1) return children[0];
  return new Fragment(children);
};

},{}],40:[function(require,module,exports){
/**
 */

module.exports = {
  element   : require(38),
  fragment  : require(39),
  text      : require(43),
  dynamic   : require(37),
  comment   : require(36),
  template  : require(42),

  View      : require(44)
};

},{"36":36,"37":37,"38":38,"39":39,"42":42,"43":43,"44":44}],41:[function(require,module,exports){
var extend          = require(46);
var FragmentSection = require(32);
var NodeSection     = require(35);

module.exports = function(document, node) {
  if (node.nodeType === 11) {
    var section = new FragmentSection(document);
    section.appendChild(node);
    return section;
  } else {
    return new NodeSection(document, node);
  }
};

},{"32":32,"35":35,"46":46}],42:[function(require,module,exports){
var defaultDocument = require(45);
var View            = require(44);
var extend          = require(46);
var FragmentSection = require(32);
var NodeSection     = require(35);

function _lowercaseHash(hash) {
  var c1 = hash || {};
  var c2 = {};

  for (var k in c1) {
    c2[k.toLowerCase()] = c1[k];
  }

  return c2;
}

/**
 */

function _lowercaseComponentNames(options) {
  return extend({}, options, {
    components: _lowercaseHash(options.components),
    attributes: options.attributes
  });
}

/**
 */

function Template(vnode, options) {

  this.vnode = vnode;

  // hydrates nodes when the template is used
  this._hydrators = [];

  options = _lowercaseComponentNames(extend({
    document  : defaultDocument
  }, options));

  this.viewClass = options.viewClass || View;
  this.options   = options;

  // freeze & create the template node immediately
  var node = vnode.freeze(options, this._hydrators);

  if (node.nodeType === 11) {
    this.section = new FragmentSection(options.document);
    this.section.appendChild(node);
  } else {
    this.section = new NodeSection(options.document, node);
  }
}

/**
 * creates a new view
 */

Template.prototype.view = function(context, options) {

  // TODO - make compatible with IE 8
  var section     = this.section.clone();

  var view = new this.viewClass(section, this, options);

  for (var i = 0, n = this._hydrators.length; i < n; i++) {
    this._hydrators[i].hydrate(section.node || section.start.parentNode, view);
  }

  if (context) view.update(context);

  // TODO - set section instead of node
  return view;
};

/**
 */

module.exports = function(vnode, options) {
  return new Template(vnode, options);
};

},{"32":32,"35":35,"44":44,"45":45,"46":46}],43:[function(require,module,exports){
/**
 */

function Text(nodeValue) {
  this.nodeValue = nodeValue || "";
}

/**
 */

Text.prototype.freeze = function(options) {
  return options.document.createTextNode(this.nodeValue);
};

/**
 */

module.exports = function(nodeValue) {
  return new Text(nodeValue);
};

},{}],44:[function(require,module,exports){
/**
 */

function View(section, template, options) {
  this.section  = section;
  this.bindings = [];
  this.template = template;
  this.options  = options;
}

/**
 * updates the view
 */

View.prototype.update = function(context) {
  for (var i = 0, n = this.bindings.length; i < n; i++) {
    this.bindings[i].update(context);
  }
};

/**
 */

View.prototype.render = function() {
  return this.section.render();
};

/**
 */

View.prototype.remove = function() {
  return this.section.remove();
};

/**
 */

module.exports = View;

},{}],45:[function(require,module,exports){
module.exports = document;

},{}],46:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],47:[function(require,module,exports){
function _copy (to, from) {

  for (var i = 0, n = from.length; i < n; i++) {

    var target = from[i];

    for (var property in target) {
      to[property] = target[property];
    }
  }

  return to;
}

function protoclass (parent, child) {

  var mixins = Array.prototype.slice.call(arguments, 2);

  if (typeof child !== "function") {
    if(child) mixins.unshift(child); // constructor is a mixin
    child   = parent;
    parent  = function() { };
  }

  _copy(child, parent); 

  function ctor () {
    this.constructor = child;
  }

  ctor.prototype  = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  child.parent    = child.superclass = parent;

  _copy(child.prototype, mixins);

  protoclass.setup(child);

  return child;
}

protoclass.setup = function (child) {


  if (!child.extend) {
    child.extend = function(constructor) {

      var args = Array.prototype.slice.call(arguments, 0);

      if (typeof constructor !== "function") {
        args.unshift(constructor = function () {
          constructor.parent.apply(this, arguments);
        });
      }

      return protoclass.apply(this, [this].concat(args));
    }

    child.mixin = function(proto) {
      _copy(this.prototype, arguments);
    }

    child.create = function () {
      var obj = Object.create(child.prototype);
      child.apply(obj, arguments);
      return obj;
    }
  }

  return child;
}


module.exports = protoclass;
},{}],48:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"46":46}]},{},[1]);
