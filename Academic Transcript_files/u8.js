(function(angular) {

  var u8 = angular.module('u8', ['ngMaterial','ngMessages']);

  //rlj 01/23/2018 added "ngMaterial,ngMessags" above and u8.config u8.controller below
  u8.config(function($mdThemingProvider) {
	 $mdThemingProvider.theme('default')
		.primaryPalette('green');
  });
  
  u8.controller("MainCtrl", ['$scope', function($scope) {
	$scope.title = "Main";
	$scope.status = '  ';
    $scope.customFullscreen = false;
  }]);
  
  //rlj 04/11/2018 added filter to allow ng-bind-html
  u8.filter('unsafe', ['$sce', function($sce) {
    return function(text) {
	  return $sce.trustAsHtml(text);
    };
  }]);
  
  //rlj 09/26/2018 added filter to remove all white space
  u8.filter('nowhitespace', function() {
    return function(value) {
      return (!value) ? '' : value.replace(/\s/g, '');
    };
  });

  u8.factory('u8KeyService', ['$document', function(__document) {
    var modifierCode = {
      SHIFT: 1,
      ALT: 2,
      CTRL: 4
      //META: 8 //windows key or command key (mac)
      //MOD: platform-specific, Ctrl on windows/unix or Command on Mac.  See 'mousetrap' library
    };

    var modifierStrings = {
      'shift':modifierCode.SHIFT,
      'alt':modifierCode.ALT,
      'ctrl':modifierCode.CTRL
    };

    var keys = {
      backspace: 0x08,
      tab: 0x09,
      'return': 0x0d,
      escape: 0x1b,
      space: 0x20,
      pageUp: 0x21,
      pageDown: 0x22,
      end: 0x23,
      home: 0x24,
      left: 0x25,
      up: 0x26,
      right: 0x27,
      down: 0x28,
      insert: 0x2d,
      'delete': 0x30,
      f1: 0x70,
      f2: 0x71,
      f3: 0x72,
      f4: 0x73,
      f5: 0x74,
      f6: 0x75,
      f7: 0x76,
      f8: 0x77,
      f9: 0x78,
      f10: 0x79,
      f11: 0x7a,
      f12: 0x7b,
      '`':0xc0,
      '-':0xbd,
      '=':0xbb,
      '[':0xdb,
      ']':0xdd,
      '\\':0xdc,
      ';': 0xba,
      '\'': 0xde,
      ',': 0xbc,
      '.': 0xbe,
      '/': 0xbf
    };

    function KeyException(message) {
      this.message = message;
      this.name = "KeyException";
    }

    function parseModifiers( shortcut ) {
      var modifiers = 0,
          words = shortcut.split('+');

      for (var i = 0; i < words.length - 1; ++i) {
        var word = words[i];
        var value = modifierStrings[ word.toLowerCase() ];

        if ( value ) {
            modifiers |= value;
        } else {
            throw new KeyException( "Unknown modifier '" + word + "' in shortcut '" + shortcut + "'" );
        }
      }

      return modifiers;
    };

    function parseKey( shortcut ) {
      var word = shortcut.split('+').pop(),
          code = keys[word.toLowerCase()];

      if ( !code ) {
        if ( word.length > 1 ) {
          throw new KeyException( "Unknown key name '" + word + "' in shortcut '" + shortcut + "'" );
        } else {
          code = word.toUpperCase().charCodeAt(0);
        }
      }

      return code;
    };

    function BoundKey( shortcut, handler ) {
      this.modifiers = parseModifiers( shortcut );
      this.code = parseKey( shortcut );
      this.handler = handler;
    };

    var boundKeys = [];

    function handler( event ) {
      for (var i = 0; i < boundKeys.length; ++i) {
        var boundKey = boundKeys[i];

        if ( boundKey.code != event.keyCode ) {
          continue;
        }
        if ( boundKey.modifiers != modifierKeysPressed(event) ) {
          continue;
        }

        boundKey.handler( event );
      }
    };

    function modifierKeysPressed(event){
      return (( event.shiftKey && modifierCode.SHIFT ) | ( event.altKey && modifierCode.ALT ) | ( event.ctrlKey && modifierCode.CTRL ));
    }

    return {
      /**
       * bind shortcut & handler pairs.
       * key.bind( 'shift+home', homeFunction, 'alt+m', menuFunction, ... )
       *   or
       * key.bind( ['shift+home', homeFunction, 'alt+m', menuFunction, ...] )
       */
      bind: function() {
        var shortcuts = arguments.length > 1 ? arguments : arguments[0];
        var i = 0;

        if ( !boundKeys.length ) {
            // register page-level event handler only once
            __document.on( 'keyup', handler );
        }

        for ( ; i < shortcuts.length; i += 2 ) {
          shortcut = shortcuts[ i ];
          handler = shortcuts[ i+1 ];
          boundKeys.push( new BoundKey( shortcut, handler ));
        }
      }
    }
  }]);
}(window.angular));

var u8 = {
  //
  // Set the content-only flag on the page wrapper to hide the header and
  // footer on the page.
  //
  setContentOnly: function() {
    var el = document.getElementById("pageWrapper");

    if (el) {
      el.className += ' content-only';
    } else {
      if ($) {
        $(function() {
          var el = $("#pageWrapper");

          el.addClass('content-only');
        });
      }
    }
  }
}
