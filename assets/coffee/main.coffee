angTest =
  'title': myLocalized.appTitle
  'titleSep': ' | '
  setTitle: (name) ->
    document.querySelector('title').innerHTML = name + angTest.titleSep + angTest.title

app = angular.module('app', ['ngRoute', 'ngSanitize'])

app.config ["$routeProvider", "$locationProvider", ($routeProvider, $locationProvider) ->
  $locationProvider.html5Mode(true)

  $routeProvider.when '/',
    templateUrl: myLocalized.partials + 'main.html'
    controller: 'Main'

  .when '/:slug',
    templateUrl: myLocalized.partials + 'single.html'
    controller: 'Single'

  .when '/category/:category',
    templateUrl: myLocalized.partials + 'main.html'
    controller: 'Category'

  .when '/category/:category/page/:page',
    templateUrl: myLocalized.partials + 'main.html'
    controller: 'Category'

  .when '/page/:page',
    templateUrl: myLocalized.partials + 'main.html'
    controller: 'Paged'

  .when '/search/:query',
    templateUrl: myLocalized.partials + 'main.html'
    controller: 'Search'
]

app.controller 'Main', ["$scope", "$http", "$routeParams", ($scope, $http, $routeParams) ->
	$http.get('wp-json/taxonomies/category/terms').success (res)->
		$scope.categories = res

  $http.get('wp-json/posts/').success (res, status, headers) ->
    $scope.pageTitle = 'Latest Posts: '
    angTest.setTitle('Home')
    $scope.posts = res

    $scope.currentPage = 1
    $scope.totalPages = headers('X-WP-TotalPages')
]

app.controller 'Single', ["$scope", "$http", "$routeParams", ($scope, $http, $routeParams) ->
  $http.get('wp-json/posts/?filter[name]=' + $routeParams.slug).success (res) ->
    if res[0]
      angTest.setTitle(res[0].title)
      $scope.post = res[0]
    else
      $http.get('wp-json/pages/?filter[name]=' + $routeParams.slug).success (res) ->
        angTest.setTitle(res[0].title)
        $scope.post = res[0]
]

app.controller 'Category', ["$scope", "$http", "$routeParams", ($scope, $http, $routeParams) ->
	$http.get('wp-json/taxonomies/category/terms').success (res)->
		$scope.categories = res

  $http.get('wp-json/taxonomies/category/terms/?filter[slug]=' + $routeParams.category).success (res)->
    angTest.setTitle('Posts in ' + res[0].name)
    $scope.pageTitle = 'Posts in ' + res[0].name + ': '
    $scope.current_category_id = res[0].ID

    currentPage = if !$routeParams.page then 1 else parseInt($routeParams.page)

    request = 'wp-json/posts/?filter[category_name]=' + res[0].name
    request += '&page=' + $routeParams.page if $routeParams.page
    $http.get(request).success (res, status, headers) ->
      $scope.posts = res
      $scope.currentPage = currentPage
      $scope.totalPages = headers('X-WP-TotalPages')
]

app.controller 'Search', ["$scope", "$http", "$routeParams", ($scope, $http, $routeParams) ->
  $http.get('wp-json/posts/?filter[s]='+ $routeParams.query).success (res)->
    angTest.setTitle('Search Results: ' + $routeParams.query)
    $scope.pageTitle = 'Search Results for "' + $routeParams.query + '": '
    $scope.posts = res
]

app.controller 'Paged', ['$scope', '$routeParams', '$http', ($scope, $routeParams, $http) ->
	$http.get('wp-json/taxonomies/category/terms').success (res)->
		$scope.categories = res

	$http.get('wp-json/posts/?page=' + $routeParams.page).success (res, status, headers) ->
    currentPage = parseInt($routeParams.page)
    $scope.currentPage = currentPage
    $scope.totalPages = headers('X-WP-TotalPages')
    $scope.posts = res
    $scope.pageTitle = 'Posts on Page ' + $scope.currentPage + ':'
    angTest.setTitle('Page ' + $scope.currentPage)
]

app.directive 'postsNavLink', () ->
	restrict: 'EA'
	templateUrl: myLocalized.partials + 'posts-nav-link.html',
	controller: ['$scope', '$element', '$routeParams', ( $scope, $element, $routeParams) ->
    currentPage = if !$routeParams.page then 1 else parseInt($routeParams.page)
    linkPrefix = if !$routeParams.category then 'page/' else 'category/' + $routeParams.category + '/page/'
    $scope.postsNavLink =
      prevLink: linkPrefix + ( currentPage - 1 )
      nextLink: linkPrefix + ( currentPage + 1 )
      sep: if !$element.attr('sep') then '|' else $element.attr('sep')
      prevLabel: if !$element.attr('prev-label') then 'Previous Page' else $element.attr('prev-label')
      nextLabel: if !$element.attr('next-label') then 'Next Page' else $element.attr('next-label')
  ]

app.directive 'searchForm', () ->
  restrict: 'EA'
  templateUrl: myLocalized.partials + 'search-form.html',
  controller: ['$scope', '$http', '$location', ($scope, $http, $location) ->
    $scope.filter =
      s: ''
    $scope.search = () ->
      $location.path('/search/' + $scope.filter.s)
  ]
