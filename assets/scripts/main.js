var app;

app = angular.module('app', ['ngRoute', 'ngSanitize']);

app.config([
  "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    myLocalized.partials = myLocalized.partials.replace(myLocalized.appUrl, '');
    return $routeProvider.when('/', {
      templateUrl: myLocalized.partials + 'main.html',
      controller: 'Main'
    }).when('/:slug', {
      templateUrl: myLocalized.partials + 'single.html',
      controller: 'Single'
    }).when('/category/:category', {
      templateUrl: myLocalized.partials + 'main.html',
      controller: 'Category'
    }).when('/category/:category/page/:page', {
      templateUrl: myLocalized.partials + 'main.html',
      controller: 'Category'
    }).when('/page/:page', {
      templateUrl: myLocalized.partials + 'main.html',
      controller: 'Paged'
    }).when('/search/:query', {
      templateUrl: myLocalized.partials + 'main.html',
      controller: 'Search'
    }).otherwise({
      templateUrl: myLocalized.partials + '404.html',
      controller: '404'
    });
  }
]);

app.controller('headerController', [
  "$scope", "$http", "$routeParams", function($scope, $http, $routeParams, $sce) {
    return $http.get('wp-json/menu-locations').then(function(res) {
      var mainMenuID;
      mainMenuID = res.data.primary_navigation.ID;
      return $http.get('wp-json/menus/' + mainMenuID).then(function(res) {
        var hasChildren, hasChildrensChildren, i, j, k, l, m, ref, results;
        $scope.mainMenu = [];
        j = 0;
        results = [];
        for (i = m = 0, ref = res.data.items.length - 1; 0 <= ref ? m <= ref : m >= ref; i = 0 <= ref ? ++m : --m) {
          if (res.data.items[i].parent === 0) {
            $scope.mainMenu[j] = res.data.items[i];
            hasChildren = $scope.mainMenu[j];
            hasChildren.children = [];
            j++;
            results.push(k = 0);
          } else if (res.data.items[i].parent === hasChildren.ID) {
            hasChildren.children[k] = res.data.items[i];
            hasChildrensChildren = hasChildren.children[k];
            hasChildrensChildren.children = [];
            k++;
            results.push(l = 0);
          } else if (res.data.items[i].parent === hasChildrensChildren.ID) {
            hasChildrensChildren.children[l] = res.data.items[i];
            results.push(l++);
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    });
  }
]);

app.controller('Main', [
  "$scope", 'WPService', function($scope, WPService) {
    WPService.getAllCategories();
    WPService.getPosts(1);
    return $scope.data = WPService;
  }
]);

app.controller('404', function() {});

app.controller('Single', [
  "$scope", "$http", "$routeParams", function($scope, $http, $routeParams) {
    return $http.get('wp-json/posts/?filter[name]=' + $routeParams.slug).then(function(res) {
      if (res.data[0]) {
        return $scope.post = res.data[0];
      } else {
        return $http.get('wp-json/pages/?filter[name]=' + $routeParams.slug).then(function(res) {
          if (res.data[0]) {
            return $scope.post = res.data[0];
          } else {
            return {
              status: 404,
              message: 'Could not find that post!'
            };
          }
        });
      }
    }).then(function(msg) {
      if (msg.status === 404) {
        $scope.is404 = true;
        return $scope.errorMessage = 'Error: ' + msg.message;
      }
    });
  }
]);

app.controller('Category', [
  "$scope", "$http", "$routeParams", 'WPService', function($scope, $http, $routeParams, WPService) {
    var request;
    WPService.getAllCategories();
    request = 'wp-json/taxonomies/category/terms/?filter[slug]=' + $routeParams.category;
    $http.get(request).then(function(res) {
      if (res.data[0]) {
        $scope.current_category_id = res.data[0].ID;
        return WPService.getPostsInCategory(res.data[0], $routeParams.page);
      } else {
        return {
          status: 404,
          message: "That category doesn't exit!"
        };
      }
    }).then(function(msg) {
      if (msg.status === 404) {
        $scope.is404 = true;
        WPService.setTitle('Page not found', '');
        return $scope.errorMessage = 'Error: ' + msg.message;
      }
    });
    return $scope.data = WPService;
  }
]);

app.controller('Search', [
  "$scope", "$routeParams", 'WPService', function($scope, $routeParams, WPService) {
    WPService.getSearchResults($routeParams.query);
    return $scope.data = WPService;
  }
]);

app.controller('Paged', [
  "$scope", "$routeParams", 'WPService', function($scope, $routeParams, WPService) {
    WPService.getAllCategories();
    WPService.getPosts($routeParams.page);
    return $scope.data = WPService;
  }
]);

app.directive('postsNavLink', function() {
  return {
    restrict: 'EA',
    templateUrl: myLocalized.partials + 'posts-nav-link.html',
    controller: [
      '$scope', '$element', '$routeParams', function($scope, $element, $routeParams) {
        var currentPage, linkPrefix;
        currentPage = !$routeParams.page ? 1 : parseInt($routeParams.page);
        linkPrefix = !$routeParams.category ? 'page/' : 'category/' + $routeParams.category + '/page/';
        return $scope.postsNavLink = {
          prevLink: linkPrefix + (currentPage - 1),
          nextLink: linkPrefix + (currentPage + 1),
          sep: !$element.attr('sep') ? '|' : $element.attr('sep'),
          prevLabel: !$element.attr('prev-label') ? 'Previous Page' : $element.attr('prev-label'),
          nextLabel: !$element.attr('next-label') ? 'Next Page' : $element.attr('next-label')
        };
      }
    ]
  };
});

app.directive('searchForm', function() {
  return {
    restrict: 'EA',
    templateUrl: myLocalized.partials + 'search-form.html',
    controller: [
      '$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
        $scope.filter = {
          s: $routeParams.query
        };
        return $scope.search = function() {
          return $location.path('/search/' + $scope.filter.s);
        };
      }
    ]
  };
});
