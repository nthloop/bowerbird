/*
 * Copyright: Ankit Solanki, nth loop, 2012.
 * Bowerbird may be freely distributed under the MIT license.
 */

(function () {

var settings = {}, port, editing = false, detailed = false, currentIndex = 0,
  messages = ['grays', 'colors', 'alphas', 'present', 'absent'];

/**
 * Prepares a message, shown to the users when filters are updated.
 */
var notifyUserAboutFilters = function() {
  var message = '';
  if ((!settings.showGrays && !settings.showColors)
      || (!settings.showPresent && !settings.showAbsent)) {
    utils.message('You might want to check your filters.');
    return;
  }

  if (settings.showPresent && settings.showAbsent) message = 'All ';
  else if (settings.showPresent)                   message = '';
  else if (settings.showAbsent)                    message = 'Un-used ';

  var colorTypes = [];
  settings.showGrays  && colorTypes.push('Grays');
  settings.showColors && colorTypes.push('Colors');
  message += colorTypes.join(' & ');

  message += settings.showAlphas ? ', with alpha.' : ', without alpha.';
  utils.message(message);
};

/**
 * Get current state.
 */
var getCurrentSettings = function () {
  settings.format = document.querySelector('#tool-colorFormat button.selected').id;

  settings.showGrays  = $.hasClass('grays',  'selected');
  settings.showColors = $.hasClass('colors', 'selected');
  settings.showAlphas = $.hasClass('alphas', 'selected');

  settings.showPresent = $.hasClass('present', 'selected');
  settings.showAbsent  = $.hasClass('absent',  'selected');

  settings.showLabels = $.hasClass('labels', 'selected');
};

/**
 * This function parses colors returned by the content script.
 *
 * The global colors array will contain the parsed color objects.
 * Each object is in the following form:
 *
 *   {
 *     name: 'rgba(10, 10, 150, 0.5)',
 *
 *     presentInDOM: false, // boolean flag
 *
 *     cssRules: [
 *       // optional list of CSS rules mentioning this color
 *     ],
 *
 *     // flag indicating this color was used as a background
 *     background: true,
 *
 *     // flag indicating this color was used for text
 *     text: false,
 *
 *     // a parsed WebInspector.Color instance
 *     color: new WebInspector.Color('rgba(10, 10, 150, 0.5)')
 *   }
 */
var parseColors = function(dataObj) {
  colors = [];
  for (var name in dataObj) {
    if (!dataObj.hasOwnProperty(name)) {
      continue;
    }
    try {
      var color = new WebInspector.Color(name);
      var obj = dataObj[name];
      obj.color = color;
      colors.push(obj);
    } catch(e) {
      console.log('Could not parse color', name);
    }
  }
  colors.sort(function(a, b) { return ColorUtils.sort(a.color, b.color); });
};

var render = function () {
  getCurrentSettings();

  var thumbs = $.id('thumbs');

  $.clear(thumbs); // clear the pallete

  settings.showLabels ? $.removeClass(thumbs, 'hideLabels') : $.addClass(thumbs, 'hideLabels');

  for (var i = 0; i < colors.length; i++) {
    try {
    var color = colors[i];

    if (!ColorUtils.filter(color, settings)) continue;

    var li     = createSwatch(color, i),
        swatch = li.querySelector('.thumb'),
        code   = li.querySelector('.code');

    $.events(swatch, {click: swatchClicked});
    $.events(code, {
      click: startEditing,
      blur: changeColor,
      keydown: utils.triggerEventOnEnter('blur')
    });

    thumbs.appendChild(li);

    } catch(e) {
      console.log('error in render', e);
    }

  }

};

var createSwatch = function(color, i) {
  var formattedColor = ColorUtils.format(color.color, settings.format);

  var swatch = document.createElement('span');
  swatch.className = 'thumb';
  swatch.style['background-color'] = color.name;

  var code = document.createElement('span');
  code.className = 'code ellipsis';
  code.innerText = formattedColor;

  var textColor = ColorUtils.textOverlayColor(color.color);
  code.style.color = ColorUtils.format(textColor, 'rgb');

  var li = document.createElement('li');
  li.appendChild(swatch); li.appendChild(code);
  li.setAttribute('title', formattedColor);

  $.data(li, 'original-color', color.name);
  $.data(li, 'index', i);
  $.data(li, 'format', formattedColor.match(/^rgb/) ? 'rgb' : settings.format);

  return li;
};

var startEditing = function () {
  currentIndex = $.data(this.parentElement, 'index');
  this.contentEditable = true;
  this.focus();
  document.execCommand('selectAll');
};

var changeColor = function(event) {
  var code = event.target;
  code.contentEditable = false;
  var li = code.parentElement;

  var format = $.data(li, 'format'),
      originalColor = $.data(li, 'original-color'),
      newColor = (code.innerText || '').toLowerCase().replace(/%/g, ''),
      color, colorRGB;

  try {
    // try & parse the new color
    color = new WebInspector.Color(newColor);
  } catch(e) {
    // If parsing fails, try to prepend a # symbol, in case the
    // hex code was entered without the hex.
    newColor = '#' + newColor;
    try {
      color = new WebInspector.Color(newColor);
    } catch(e) {
      // Finally, revert back to the original color.
      color = colors[currentIndex].color;
    }
  }

  colorRGB = ColorUtils.format(color, 'rgb');
  // reset the text, in order to remove selection.
  code.innerText = ''; code.innerText = ColorUtils.format(color, format);

  if (colorRGB == originalColor) {
    return;
  }

  code.style.color = ColorUtils.format(ColorUtils.textOverlayColor(color), 'rgb');
  li.setAttribute('title', ColorUtils.format(color, format));
  $.addClass(li, 'edited');
  $.data(li, 'original-color', colorRGB);
  li.querySelector('.thumb').style['background-color'] = colorRGB;
  setColor(originalColor, colorRGB);

  colors[currentIndex].color = color;
  colors[currentIndex].name = colorRGB;
  if (detailed) {
    displayCurrentColor();
  }
};

/**
 * Clicking on a swatch will either toggle the color formats,
 * or show the color in the details view.
 */
var swatchClicked = function(event) {
  currentIndex = $.data(this.parentElement, 'index');
  if (!detailed) {
    toggleColorFormat.call(this, event);
  } else {
    changeSwatch.call(this, event);
  }
};

var changeSwatch = function(event) {
  var li = this.parentElement;
  currentIndex = parseInt($.data(li, 'index'), 10);
  displayCurrentColor();
};

var toggleColorFormat = function(event) {
  var li = this.parentElement;
  var color = new WebInspector.Color($.data(li, 'original-color'));
  var next = ColorUtils.nextFormat(color, $.data(li, 'format'));
  $.data(li, 'format', next.format);
  li.querySelector('.code').innerText = next.value;
  li.setAttribute('title', next.value);
};

var changeFilters = function(event) {
  var button = event.target;
  if (button.tagName != "BUTTON") return;

  var parent = button.parentElement;

  // some button-groups will only allow a single button to be selected at a time.
  if ($.data(parent, 'select') == 'single') {
    var buttons = parent.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
       $.removeClass(buttons[i], 'selected');
    }
    $.addClass(button, 'selected');
  } else {
    $.toggleClass(button, 'selected');
  }

  if (messages.indexOf(button.id) != -1) {
    setTimeout(notifyUserAboutFilters, 10);
  }
  setTimeout(render, 5);
};

var setColor = function (oldColor, newColor) {
  editing = true;
  port.postMessage({command: 'set', oldColor: oldColor, newColor: newColor});
};

/**
 * Called whenever we receive a message from the content script
 */
var messageReceived = function(msg) {
  parseColors(msg);
  if (!editing) {
    render();
  }
  editing = false;
};

var displayCurrentColor = function() {
  removeSelectionFromSwatches();
  highlightCurrentSwatch();
  var color = colors[currentIndex];
  $.id('ci-color').style['background-color'] = color.name;
  $.id('ci-bg').style['display']  = color.background    ? 'block' : 'none';
  $.id('ci-fg').style['display']  = color.text          ? 'block' : 'none';
  $.id('ci-dom').style['display'] = !color.presentInDOM ? 'block' : 'none';

  $.id('ci-code').innerText = ColorUtils.allFormats(color);

  var rules = $.id('ci-rules');
  if (!color.cssRules.length) {
    $.id('ci-norules').style['display'] = 'block';
    rules.style['display'] = 'none';
    return;
  }

  $.id('ci-norules').style['display'] = 'none';
  $.clear(rules);
  rules.style['display'] = 'block';

  for (var i = 0; i < color.cssRules.length; i++) {
    rules.appendChild(utils.formatCSSRule(color.cssRules[i]));
  }
};

var removeSelectionFromSwatches = function () {
  var lis = document.querySelectorAll('#thumbs li');
  for (var i = 0; i < lis.length; i++) $.removeClass(lis[i], 'selected');
};

var highlightCurrentSwatch = function () {
  var lis = document.querySelectorAll('#thumbs li');
  for (var i = 0; i < lis.length; i++)
    if ($.data(lis[i], 'index') == currentIndex) {
      $.addClass(lis[i], 'selected');
      break;
    }
};

var toggleColorDetails = function () {
  $.toggleClass('content-wrapper', 'detailed');
  detailed = $.hasClass('content-wrapper', 'detailed');

  window.setTimeout(function() {
    if (detailed) {
      $.addClass('color-info', 'selected');
      displayCurrentColor();
    } else {
      $.removeClass('color-info', 'selected');
      removeSelectionFromSwatches();
    }
  }, 10);
};

var exportColors = function(e) {
  e.stopPropagation();
  var area = $.id('exporter');
  var text = [];
  for (var i = 0; i < colors.length; i++) {
    var color = colors[i];
    if (!ColorUtils.filter(color, settings)) continue;
    text.push(ColorUtils.allFormats(color));
  }
  area.innerText = text.join('\n');
  area.focus();
  area.select();

  var val = document.execCommand('copy');
  if (val) utils.message('Colors copied to clipboard.');
  area.innerText = '';
  area.blur();
  return false;
};

window.onload = function() {
  // Toggle button state after click
  $.events('tools', {click: changeFilters});
  $.events('export', {click: exportColors});
  $.events('ci-title', {click: toggleColorDetails});
  $.events('details', {click: toggleColorDetails});

  chrome.extension.onConnect.addListener(function(p) {
    port = p;
    port.onMessage.addListener(messageReceived);
    p.postMessage({command: 'get'});
  });

  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.executeScript(tab.id, { file: "js/content.js" });
  });
};

})();
