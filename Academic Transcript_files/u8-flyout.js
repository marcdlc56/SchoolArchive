(function(angular) {
  var u8 = angular.module('u8');

  u8.directive('flyout', ['$document', 'u8KeyService', function(__document, __keyService) {
    var registry = [],
        current = null;

    function controller(__element) {
      var focus = null,
          classes = [];

      this.setFocus = function(__element) {
        if (!focus) {
          focus = __element;

          if (current === this) {
            this.focus();
          }
        }
      }

      this.clearFocus = function() {
        if (focus) {
          focus.blur();
        }

        focus = null;
      }

      this.registerAppliedClass = function(__element, __className) {
        classes.push({
          element: __element,
          className: __className
        });
      }

      this._open = function() {
        for (var i = 0; i < registry.length; ++i) {
          if (registry[i] !== this) {
            registry[i]._close();
          }
        }

        for (var i = 0; i < classes.length; ++i) {
          classes[i].element.addClass(classes[i].className);
        }

        this.focus();

        current = this;
      }

      this._close = function() {
        if (current === this) {
          for (var i = 0; i < classes.length; ++i) {
            classes[i].element.removeClass(classes[i].className);
          }

          current = null;
        }
      }

      this.trigger = function() {
        if (current === this) {
          this._close();
        } else {
          this._open();
        }
      }

      this.focus = function() {
        if (focus) {
          focus.focus();
        }
      }
    }

    __keyService.bind('escape', function() {
      if (current) {
        current._close();
      }
    });

    function link(__scope, __element, __attributes, __controller) {
      registry.push(__controller);

      __document.on('click', function() {
        if (current) {
          current._close();
        }
      });

      __element.on('click', function(__event) {
        __event.stopPropagation();
      });
    }

    return {
      restrict: 'A',
      controller: ['$element', controller],
      link: link
    }
  }]);

  u8.directive('flyoutTrigger', ['$document', 'u8KeyService', function(__document, __keyService) {

    function link(__scope, __element, __attributes, __controller) {
      __element.on('click', function() {
        __controller.trigger()
      });

      if (__attributes.flyoutTrigger) {
        __keyService.bind(__attributes.flyoutTrigger, function() {
          __controller.trigger();
        });
      }
    }

    return {
      restrict: 'A',
      require: '^flyout',
      link: link
    }
  }]);

  u8.directive('flyoutClass', [function() {

    function link(__scope, __element, __attributes, __controller) {
      if (__attributes.flyoutClass) {
        __controller.registerAppliedClass(__element, __attributes.flyoutClass);
      }
    }

    return {
      restrict: 'A',
      require: '^flyout',
      link: link
    }
  }]);

  u8.directive('flyoutFocus', [function() {

    function link(__scope, __element, __attributes, __controller) {
      __controller.setFocus(__element[0]);

      if (!__element.attr('tabindex')) {
        __element.attr('tabindex', '0');
      }
    }

    return {
      restrict: 'A',
      require: '^flyout',
      link: link
    }
  }]);

  u8.directive('flyoutCollapseOnClick', [function() {

    function link(__scope, __element, __attributes, __controller) {
      __element.on('click', function(__event) {
        __controller.trigger();
        __event.stopPropagation();
      });
    }

    return {
      restrict: 'A',
      require: '^flyout',
      link: link
    }
  }]);

}(window.angular));
