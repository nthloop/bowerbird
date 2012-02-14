/*
 * Copyright: Ankit Solanki, nth loop, 2012.
 * Bowerbird may be freely distributed under the MIT license.
 */


/**
 * Just a few utility functions
 */
var utils = {

/**
 * Show a message on-screen and then fade it out.
 */
message: function (message) {
  var bar = $.id('noti');

  bar.style.display = "block";
  bar.innerText = message;
  $.removeClass(bar, 'disappear');

  window.setTimeout(function() {
    $.addClass(bar, 'disappear');
  }, 5);
},

/**
 * This is a keyboard handler. When ENTER or TAB is pressed,
 * this handler will trigger an event of the given type
 * the target element. It will also stop propagation of the
 * keyboard event.
 */
triggerEventOnEnter: function(eventType) {
  return function(event) {
    if (event.keyCode == 13 || event.keyCode == 9) {
      event.target.dispatchEvent(new Event(eventType));
      event.stopPropagation();
      event.preventDefault();
      return false;
    }
    return true;
  };
},

formatCSSRule: function (ruleArray) {
  var href = ruleArray[0];
  var rule = ruleArray[1];

  // This function should ideally use a lexer.
  var pre = document.createElement('pre');
  $.addClass(pre, 'ci-rule');

  var html = "";

  if (href.indexOf('/') == -1) {
    html += '<span class="stylesheet">' + href + '</span>';
  } else {
    html += '<span class="stylesheet"><a class="ellipsis" target="_blank" title="' +
      href + '" href="view-source:' + href + '">' + href + '</a></span>';
  }

  html += '<span class="selector">';

  // from the first character of the rule to the first occurance of '{' is the selector
  var selector = rule.slice(0, rule.indexOf('{')).trim();
  html += selector;
  html += '</span> {\n';

  // use the remaining part of the CSS rule
  var rest = rule.slice(rule.indexOf('{')).trim();
  // remove opening and closing braces
  rest = rest.replace(/^{\s+/, '');
  rest = rest.replace(/\s+}$/, '');

  // find individual properties within the declaration
  var props = rest.split(';');
  for (var i = 0; i < props.length; i++ ) {

    var prop = props[i].trim();
    if (!prop) continue;
    if (prop.indexOf(':') == -1) continue;

    var name = prop.slice(0, prop.indexOf(':')).trim();
    html += '  <span class="rule-prop">';
    html += name;
    html += '</span>:<span class="rule-value">';
    html += prop.slice(prop.indexOf(':') + 1).trim();
    html += '</span>;\n';
  }

  html += '}';

  pre.innerHTML = html;
  return pre;
}


};
