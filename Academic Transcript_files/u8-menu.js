(function(angular) {
  var u8 = angular.module('u8');

  u8.directive('u8Menu', ['u8MenuService', function(__service) {

      function controller() {
        var ctrl = this;

        //
        // Object to maintain the current trail from the root menu, to the
        // currenly displayed menu.  This is used to display the correct
        // back link when a menu can potentially have multiple parents.
        //
        var trail = (function() {
          var index = [],
              store = {};

          return {
            has: function(__name) {
              return !!store[__name];
            },
            push: function(__name, __parent, __caption) {
              if (this.has(__name)) {
                for (var i = (index.length - 1); i >= 0; --i) {
                  if (index[i] == __name) {
                    break;
                  }

                  this.pop();
                }
              } else {
                index.push(__name);
                store[__name] = {
                  name: __name,
                  parent: __parent,
                  caption: __caption
                };
              }
            },
            pop: function() {
              if (!this.empty()) {
                delete store[index.pop()];
              }
            },
            top: function() {
              return this.empty() ? null : store[index[index.length - 1]];
            },
            empty: function() {
              return index.length == 0;
            }
          };
        }());

        function open(__name, __parent, __caption) {
          __service.get(__name)
            .then(function(__menu) {
              trail.push(__name, __parent, __caption);

              ctrl.back = trail.top();
              ctrl.menu = __menu;
            });
        }

        function close() {
          if (!this.atTop()) {
            var current = trail.top();

            trail.pop();

            __service.get(current.parent)
              .then(function(__menu) {
                ctrl.back = trail.top();
                ctrl.menu = __menu;
              });
          }
        }

        this.back = null;
        this.menu = null;
        this.flyoutController = null;

        this.open = function(__submenu) {
          open(__submenu.name, __submenu.menu, __submenu.caption);
        };

        this.close = close;

        this.atTop = function() {
          var top = trail.top();

          if (top) {
            return top.name === __service.TOP;
          } else {
            return fales;
          }
        }

        open(__service.TOP, null, null);
      }

      function link(__scope, __element, __attributes, __controllers) {
        var menuController = __controllers[0],
            flyoutController = __controllers[1];

        menuController.flyoutController = flyoutController;
      }

      return {
        restrict: 'E',
        require: ['u8Menu', '^flyout'],
        controllerAs: '$ctrl',
        templateUrl: '/local/unified/js/templates/menu.html',
        controller: [controller],
        link: link
      }
  }]);

  var keys = {
    isArrowRight: function(__event) {
      return  __event.key === 'ArrowRight' ||
              __event.key === 'Right' ||
              __event.keyCode === 39 ||
              __event.which === 39;
    },
    isArrowLeft: function(__event) {
      return  __event.key === 'ArrowLeft' ||
              __event.key === 'Left' ||
              __event.keyCode === 37 ||
              __event.which === 37;
    },
    isArrowDown: function(__event) {
      return  __event.key === 'ArrowDown' ||
              __event.key === 'Down' ||
              __event.keyCode === 40 ||
              __event.which === 40;
    },
    isArrowUp: function(__event) {
      return  __event.key === 'ArrowUp' ||
              __event.key === 'Up' ||
              __event.keyCode === 38 ||
              __event.which === 38;
    },
    isEnter: function(__event) {
      return  __event.key === 'Enter' ||
              __event.keyCode === 13 ||
              __event.which === 13;
    }
  }

  u8.directive('u8MenuActivate', function() {
    return {
      restrict: 'A',
      require: '^u8Menu',
      link: function(__scope, __element, __attributes, __controller) {
        if (!__element.attr('tabindex')) {
          __element.attr('tabindex', '-1');
        }

        __element.on('keyup', function(__event) {
          if (keys.isEnter(__event)) {
            __element.find('a')[0].click();
          }
        });
      }
    }
  });

  u8.directive('u8MenuOpen', [function() {
    return {
      restrict: 'A',
      require: '^u8Menu',
      link: function(__scope, __element, __attributes, __controller) {
        function open() {
          __controller.flyoutController.clearFocus();
          __controller.open(__scope.$eval(__attributes.u8MenuOpen));
        }

        if (!__element.attr('tabindex')) {
          __element.attr('tabindex', '-1');
        }

        __element.on('keyup', function(__event) {
          if (keys.isEnter(__event) || keys.isArrowRight(__event)) {
            open();
          }
        });

        __element.on('click', function(__event) {
          open();
        });
      }
    }
  }]);

  u8.directive('u8MenuArrowBack', function() {
    return {
      restrict: 'A',
      require: '^u8Menu',
      link: function(__scope, __element, __attributes, __controller) {
        function close() {
          if (!__controller.atTop()) {
            __controller.flyoutController.clearFocus();
            __controller.close();
          }
        }

        if (!__element.attr('tabindex')) {
          __element.attr('tabindex', '-1');
        }

        __element.on('keyup', function(__event) {
          if (keys.isArrowLeft(__event)) {
            close();
          }
        });
      }
    }
  });

  u8.directive('u8MenuClose', function() {
    return {
      restrict: 'A',
      require: '^u8Menu',
      link: function(__scope, __element, __attributes, __controller) {
        function close() {
          __controller.flyoutController.clearFocus();

          __controller.close();
        }

        if (!__element.attr('tabindex')) {
          __element.attr('tabindex', '-1');
        }

        __element.on('keyup', function(__event) {
          if (keys.isEnter(__event) || keys.isArrowLeft(__event)) {
            close();
          }
        });

        __element.on('click', function(__event) {
          close();
        });
      }
    }
  });

  u8.directive('u8MenuUpDown', function() {
    return {
      restrict: 'A',
      require: '^u8Menu',
      link: function(__scope, __element, __attributes, __controller) {
        if (!__element.attr('tabindex')) {
          __element.attr('tabindex', '-1');
        }

        __element.on('keydown', function(__event) {
          if (keys.isArrowDown(__event)) {
            var next = __element[0].nextElementSibling;

            if (next) {
              next.focus();
            }
          } else if (keys.isArrowUp(__event)) {
            var previous = __element[0].previousElementSibling;

            if (previous) {
              previous.focus();
            }
          }
        });
      }
    }
  });

}(window.angular));
