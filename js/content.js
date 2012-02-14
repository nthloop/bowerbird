/*
 * Copyright: Ankit Solanki, nth loop, 2012.
 * Bowerbird may be freely distributed under the MIT license.
 */

(function () {

var properties = [
  'color', 'background-color',
  'border-top-color', 'border-bottom-color', 'border-left-color', 'border-right-color',
  'outline-color'
];

/**
 * Iterates over all stylesheets of the page. Calls the
 * callback function for each rule, with the rule itself
 * as the argument.
 */
var iterateOverStyleSheets = function(callback) {
  var ss = document.styleSheets;
  if (!ss || !ss.length) {
    return;
  }
  for (var i = 0; i < ss.length; i++) {
    var cssRules = ss[i].cssRules;
    if (!cssRules || !cssRules.length) {
      continue;
    }

    for (var j = 0; j < cssRules.length; j++) {
      var rule = cssRules[j];
      if (!rule || !rule.style) continue;
      callback(rule);
    }
  }
};

/**
 * Iterates over all Elements of a page. Calls the callback
 * function for elements that have a computed style, with the
 * computed style and element as arguments.
 */
var iterateOverDOM = function (callback) {
  var items = document.getElementsByTagName("*"), length = items.length;
  for (var i = 0; i !== length; i++) {
    var style = window.getComputedStyle(items[i]);
    if (!style) continue;
    callback(style, items[i]);
  }
};



var getColors = function () {
  var colors = {};

  var addColor = function(color, used, isDOM, cssRule) {
    if (!color || color == 'initial' || color == 'inherit') return;
    if (!colors[color]) {
      colors[color] = {name: color, presentInDOM: false, cssRules: [], background: false, text: false};
    }
    if (used == 'text') colors[color].text = true;
    if (used == 'background') colors[color].background = true;
    if (isDOM)   colors[color].presentInDOM = true;
    if (cssRule && cssRule.cssText) {
      colors[color].cssRules.push([cssRule.parentStyleSheet.href || 'inline', cssRule.cssText]);
    }
  };

  var addColors = function(style, isDOM, rule) {
    for (var i = 0; i < properties.length; i++) {
      var property = properties[i];
      var colorType = property == 'color' ? 'text' : 'background';
      addColor(style[property], colorType, isDOM, rule);
    }
  };

  iterateOverStyleSheets(function(rule) {
    addColors(rule.style, false, rule);
  });

  iterateOverDOM(function(rule) {
    addColors(rule, true);
  });

  return colors;

};


var setColor = function (oldColor, newColor) {

  var updateColor = function(rule, element) {
    // if a DOM element is given, update it, else update
    // the CSS rule object.
    var updatableValue;

    if (element) {
      updatableValue = element.style;
    } else {
      rule = rule.style;
      updatableValue = rule;
    }

    for (var i = 0; i < properties.length; i++) {
      try {
        var property = properties[i];
        if (rule[property] == oldColor) {
          updatableValue[property] = newColor;
        }
      } catch(e) {
        //console.log('could not modify rule', property, e, rule);
      }
    }

  };

  iterateOverStyleSheets(updateColor);
  iterateOverDOM(updateColor);

  return true;
};

/**
 * Setup messaging between the extension and the content script.
 */
var port = chrome.extension.connect({name: "colors"});
port.onMessage.addListener(function(msg) {
  if (msg.command == "get") {
    var colors = getColors();
    port.postMessage(colors);
  } else if (msg.command == "set") {
    setColor(msg.oldColor, msg.newColor);
    port.postMessage(getColors());
  }
});

})();
