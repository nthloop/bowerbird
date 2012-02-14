/*
 * Copyright: Ankit Solanki, nth loop, 2012.
 * Bowerbird may be freely distributed under the MIT license.
 */

/**
 * Utility functions around colors.
 */
var ColorUtils = {

  formats: ["nickname", "shorthex", "rgb", "hsl"],
  formatsWithAlpha: ["rgb", "hsl"],

  /**
   * Return true if the color is grayscale.
   */
  isGray: function(color) {
    // Just check if the R, G & B values match
    var rgb = color.rgb || color.rgba;
    return (rgb[0] == rgb[1]) && (rgb[1] == rgb[2]);
  },

  /**
   * Returns true if the color has alpha.
   */
  hasAlpha: function(color) {
    var rgba = color.rgba || color.rgb;
    if (rgba.length == 3) {
      return false;
    }
    return rgba[4] != 1;
  },

  /**
   * Returns true if the color will be visible given the current
   * display settings.
   *
   *   @param colorObj a color object from the colors array
   */
  filter: function (colorObj, settings) {
    // Cascade conditions one by one.

    if (colorObj.presentInDOM && !settings.showPresent) return false;

    if (!colorObj.presentInDOM && !settings.showAbsent) return false;

    var gray = ColorUtils.isGray(colorObj.color);

    if (gray && !settings.showGrays) return false;

    if (!gray && !settings.showColors) return false;

    if (ColorUtils.hasAlpha(colorObj.color) && !settings.showAlphas) return false;

    return true;

  },

  /**
   * A naive sort function, used to sort colors by hue.
   */
  sort: function(c1, c2) {
    var hsl1 = c1.hsla || c1.hsl, hsl2 = c2.hsla || c2.hsl;
    if (hsl1.length == 4 && hsl1[3] == 0) return 1;
    if (hsl2.length == 4 && hsl2[3] == 0) return -1;
    return hsl1[2] - hsl2[2];
  },

  /**
   * Returns the string representation of the color in the given format.
   *
   * Defaults to RGB, in case format is omitted or the conversion gives
   * an error.
   *
   * @param color a WebInspector.Color object
   */
  format: function(color, format) {
    format = format || 'rgb';
    try {
      // append 'a' to get rgba or hsla value
      return color.toString(format + 'a');
    } catch (e) {}

    var formatted =  color.toString(format);
    if (formatted == '#null') {
      return ColorUtils.format(color, 'rgb');
    } else {
      return formatted;
    }
  },

  textOverlayColor: function(color) {
    var hsl = color.hsla || color.hsl;
    var hue = hsl[0];
    var sat = 0;
    var lig = hsl[2] <= 50 ? 100 : 0;

    if (hsl.length == 4 && hsl[3] < 0.5) {
      if (hsl[3] == 0) // transperent colors
        hue = 0; sat = 0; lig = 0;
    }

    var newColor = 'hsl(' + hue + ',' + sat + ',' + lig + ')';
    return new WebInspector.Color(newColor);
  },

  allFormats: function(color) {
    var formats = [];
    for (var i = 0; i < ColorUtils.formats.length; i++) {
      try {
        var value = ColorUtils.format(color.color, ColorUtils.formats[i]);
        if (value && formats.indexOf(value) == -1) {
          formats.push(value);
        }
      } catch(e) {}
    }
    return formats.join(', ');
  },

  nextFormat: function(color, format) {
    var next = {};
    var formats = ColorUtils.hasAlpha(color) ? ColorUtils.formatsWithAlpha : ColorUtils.formats;
    var index = formats.indexOf(format), originalIndex = index;

    while (!next.value) {
      index++;
      if (index >= formats.length) index = 0;
      if (index == originalIndex) break;

      var value = ColorUtils.format(color, formats[index]);
      next.format = formats[index];
      next.value = value;
    }
    return next;
  }
};
