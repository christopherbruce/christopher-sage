
/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can
 * always reference jQuery with $, even when in .noConflict() mode.
 *
 * Google CDN, Latest jQuery
 * To use the default WordPress version of jQuery, go to lib/config.php and
 * remove or comment out: add_theme_support('jquery-cdn');
 * ========================================================================
 */
(function($) {
  var Sage, UTIL;
  Sage = {
    'common': {
      init: function() {
        console.log("hi there");
      },
      finalize: function() {}
    },
    'home': {
      init: function() {},
      finalize: function() {}
    },
    'about_us': {
      init: function() {}
    }
  };
  UTIL = {
    fire: function(func, funcname, args) {
      var fire, namespace;
      fire = void 0;
      namespace = Sage;
      funcname = funcname === void 0 ? 'init' : funcname;
      fire = func !== '';
      fire = fire && namespace[func];
      fire = fire && typeof namespace[func][funcname] === 'function';
      if (fire) {
        namespace[func][funcname](args);
      }
    },
    loadEvents: function() {
      UTIL.fire('common');
      $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function(i, classnm) {
        UTIL.fire(classnm);
        UTIL.fire(classnm, 'finalize');
      });
      UTIL.fire('common', 'finalize');
    }
  };
  $(document).ready(UTIL.loadEvents);
})(jQuery);
