/*eslint-env browser */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function getHead() {
  return document.head || document.getElementsByTagName('head')[0];
}

function attachAttributes(tag, attributes) {
  for (var key in attributes) {
    if (!attributes.hasOwnProperty(key)) {
      continue;
    }
    var value = attributes[key];
    tag.setAttribute('data-' + key, value);
  }
}

var insertCSS = {
  // Create a <link> tag with optional data attributes
  createLink: function createLink(href) {
    var head = getHead();
    var link = document.createElement('link');

    link.href = href;
    link.rel = 'stylesheet';

    attachAttributes(link);

    head.appendChild(link);

    return link;
  },
  // Create a <style> tag with optional data attributes
  createStyle: function createStyle(cssText, attributes) {
    var head = getHead();
    var style = document.createElement('style');

    style.type = 'text/css';

    attachAttributes(style, attributes);

    if (style.sheet) {
      // for jsdom and IE9+
      style.innerHTML = cssText;
      style.sheet.cssText = cssText;
      head.appendChild(style);
    } else if (style.styleSheet) {
      // for IE8 and below
      head.appendChild(style);
      style.styleSheet.cssText = cssText;
    } else {
      // for Chrome, Firefox, and Safari
      style.appendChild(document.createTextNode(cssText));
      head.appendChild(style);
    }

    return style;
  }
};

exports['default'] = insertCSS;
module.exports = exports['default'];