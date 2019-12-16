(function(angular) {
  var u8 = angular.module('u8');

  u8.directive('u8Breadcrumbs', [function() {

    function controller(__element) {
      var crumbs = [];

      this.add = function(__crumb) {
        crumbs.push(__crumb);
      }

      this.activateLast = function() {
        if (crumbs.length > 0) {
          crumbs[crumbs.length - 1].click();
        }
      }
    }

    return {
      restrict: 'A',
      controller: ['$element', controller]
    }
  }]);

  u8.directive('u8Breadcrumb', [function() {
    return {
      restrict: 'A',
      require: '^u8Breadcrumbs',
      link: function(__scope, __element, __attributes, __controller) {
        __controller.add(__element[0]);
      }
    }
  }]);

  u8.directive('u8BreadcrumbPop', [function() {
    return {
      restrict: 'A',
      require: '^u8Breadcrumbs',
      link: function(__scope, __element, __attributes, __controller) {
        __element.on('click', function() {
          __controller.activateLast();
        });
      }
    }
  }]);

}(window.angular));
