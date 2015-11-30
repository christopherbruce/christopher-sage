var angTest, app;

angTest = {
  'title': myLocalized.appTitle,
  'titleSep': ' | ',
  setTitle: function(name) {
    return document.querySelector('title').innerHTML = name + angTest.titleSep + angTest.title;
  }
};

app = angular.module('app', ['ngRoute', 'ngSanitize']);

app.config([
  "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
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
    });
  }
]);

app.controller('Main', [
  "$scope", "$http", "$routeParams", function($scope, $http, $routeParams) {
    return $http.get('wp-json/taxonomies/category/terms').success(function(res) {
      $scope.categories = res;
      return $http.get('wp-json/posts/').success(function(res, status, headers) {
        $scope.pageTitle = 'Latest Posts: ';
        angTest.setTitle('Home');
        $scope.posts = res;
        $scope.currentPage = 1;
        return $scope.totalPages = headers('X-WP-TotalPages');
      });
    });
  }
]);

app.controller('Single', [
  "$scope", "$http", "$routeParams", function($scope, $http, $routeParams) {
    return $http.get('wp-json/posts/?filter[name]=' + $routeParams.slug).success(function(res) {
      if (res[0]) {
        angTest.setTitle(res[0].title);
        return $scope.post = res[0];
      } else {
        return $http.get('wp-json/pages/?filter[name]=' + $routeParams.slug).success(function(res) {
          angTest.setTitle(res[0].title);
          return $scope.post = res[0];
        });
      }
    });
  }
]);

app.controller('Category', [
  "$scope", "$http", "$routeParams", function($scope, $http, $routeParams) {
    return $http.get('wp-json/taxonomies/category/terms').success(function(res) {
      $scope.categories = res;
      return $http.get('wp-json/taxonomies/category/terms/?filter[slug]=' + $routeParams.category).success(function(res) {
        var currentPage, request;
        angTest.setTitle('Posts in ' + res[0].name);
        $scope.pageTitle = 'Posts in ' + res[0].name + ': ';
        $scope.current_category_id = res[0].ID;
        currentPage = !$routeParams.page ? 1 : parseInt($routeParams.page);
        request = 'wp-json/posts/?filter[category_name]=' + res[0].name;
        if ($routeParams.page) {
          request += '&page=' + $routeParams.page;
        }
        return $http.get(request).success(function(res, status, headers) {
          $scope.posts = res;
          $scope.currentPage = currentPage;
          return $scope.totalPages = headers('X-WP-TotalPages');
        });
      });
    });
  }
]);

app.controller('Search', [
  "$scope", "$http", "$routeParams", function($scope, $http, $routeParams) {
    return $http.get('wp-json/posts/?filter[s]=' + $routeParams.query).success(function(res) {
      angTest.setTitle('Search Results: ' + $routeParams.query);
      $scope.pageTitle = 'Search Results for "' + $routeParams.query + '": ';
      return $scope.posts = res;
    });
  }
]);

app.controller('Paged', [
  '$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
    $http.get('wp-json/taxonomies/category/terms').success(function(res) {
      return $scope.categories = res;
    });
    return $http.get('wp-json/posts/?page=' + $routeParams.page).success(function(res, status, headers) {
      var currentPage;
      currentPage = parseInt($routeParams.page);
      $scope.currentPage = currentPage;
      $scope.totalPages = headers('X-WP-TotalPages');
      $scope.posts = res;
      $scope.pageTitle = 'Posts on Page ' + $scope.currentPage + ':';
      return angTest.setTitle('Page ' + $scope.currentPage);
    });
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
      '$scope', '$http', '$location', function($scope, $http, $location) {
        $scope.filter = {
          s: ''
        };
        return $scope.search = function() {
          return $location.path('/search/' + $scope.filter.s);
        };
      }
    ]
  };
});
