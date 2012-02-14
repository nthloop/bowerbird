/*
 * Copyright: Ankit Solanki, nth loop, 2012.
 * Bowerbird may be freely distributed under the MIT license.
 */


/**
 * A few DOM shortcuts.
 *
 * It would be better to use a tested script like zepto,
 * but this is more fun!
 */
var $ = {

id: function (i) {
  return document.getElementById(i);
},

clear: function(e) {
  e = typeof(e) == 'string' ? $.id(e) : e;
  while (e.hasChildNodes()) {
    e.removeChild(e.firstChild);
  }
},

/**
 * data(li, 'key', value) -> set data attribute to value
 * data(li, 'key')        -> get data attribute
 */
data: function(e, key, value) {
  if (value === undefined) return e.getAttribute('data-' + key);
  e.setAttribute('data-' + key, value);
  return value;
},

/**
 * Mini function for event binding.
 * Usage: events(element, {click: clickHandler});
 */
events: function(e, params) {
  e = typeof(e) == 'string' ? $.id(e) : e;
  for (name in params) {
    if (!params.hasOwnProperty(name)) {
      continue;
    }
    e.addEventListener(name, params[name]);
  }
},

addClass: function(e, className) {
  e = typeof(e) == 'string' ? $.id(e) : e;
  e.classList.add(className); return e;
},

removeClass: function(e, className) {
  e = typeof(e) == 'string' ? $.id(e) : e;
  e.classList.remove(className); return e;
},

hasClass: function(e, className) {
  e = typeof(e) == 'string' ? $.id(e) : e;
  return e.classList.contains(className);
},

toggleClass: function(e, className) {
  e = typeof(e) == 'string' ? $.id(e) : e;
  e.classList.toggle(className); return e;
}

};
