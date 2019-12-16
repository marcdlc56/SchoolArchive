(function(angular) {

  var u8 = angular.module('u8');

  u8.factory('u8MenuService', ['$http', '$q',
    function($http, $q) {
      var TOP = "Top";

      var api = 'navigation.menu';

      var cache = (function() {
        var store = {};

        return {
          has: function(__name) { return !!store[__name]; },
          get: function(__name) { return store[__name]; },
          put: function(__name, __promise) { store[__name] = __promise; }
        };
      }());

      //
      // load the given menu from the navigation rest api and cache the
      // promise.
      //
      function load(__name) {
        //console.log('menuService', '::', '*load', '->', __name);

        var defer = $q.defer(),
            promise = defer.promise;

        cache.put(__name, promise);

        $http.get(api, {
          params: {
            name: __name
          }
        }).then(function(__response) {
          //console.log('menuService', '::', '*load', '->', 'successCallback[', __response.status, ']');

          if (typeof __response.data === 'object') {
            //console.log('menuService', '::', '*load', '->', 'successCallback[', __response.data.name, ']');

            defer.resolve(__response.data);
          } else {
            //console.log('menuService', '::', '*load', '->', 'successCallback[invalid data]');

            defer.reject('invalid response data');
          }
        }, function(__error) {
          //console.log(__error);

          //console.log('menuService', '::', '*load', '->', 'errorCallback[', __error, ']');

          // if the user is not logged in (session expired) a parsererror
          // is returned, eventually this should trigger a notification in
          // the notification box with a link to the cas url

          console.log('failed to load menu');
          console.log(__error);
          defer.reject('menu request failed');
        });

        return promise;
      }

      //
      // load all of the child menus of the given menu that are not already
      // cached.
      //
      function expand(__menu) {
        //console.log('menuService', '::', '*expand', '->', __menu.name);

        var elements = __menu.elements;

        for (var i = 0; i < elements.length; ++i) {
          var element = elements[i];

          if (element.type == "MENU" && !cache.has(element.name)) {
            load(element.name)
              .then(function(__menu) {
                //console.log('menuService', '::', '*expand', '->', 'successCallback[', __menu.name, ']');
              });
          }
        }
      }

      // cache the top menu
      load('Top');

      return {
        TOP: TOP,

        get: function(__name) {
          //console.log('menuService', '::', 'get', '->', __name);

          var name = __name ? __name : TOP,
              promise = cache.has(name) ? cache.get(name) : load(name);

          promise.then(function(__menu) {
            expand(__menu);
          });

          return promise;
        }
      };
    }
  ]);


}(window.angular));
