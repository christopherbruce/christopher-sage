app = angular.module('app', ['ngRoute', 'ngSanitize'])

app.config ["$routeProvider", "$locationProvider",
($routeProvider, $locationProvider) ->
  $locationProvider.html5Mode(true)

  # fix for x-origin on localhost or whatever
  myLocalized.partials = myLocalized.partials.replace(myLocalized.appUrl, '')

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

  .otherwise templateUrl: myLocalized.partials + '404.html', controller: '404'
]

app.controller 'headerController', ["$scope", "$http", "$routeParams",
($scope, $http, $routeParams, $sce) ->
  $http.get('wp-json/menu-locations').then (res)->
    mainMenuID = res.data.primary_navigation.ID
    $http.get('wp-json/menus/'+mainMenuID).then (res)->
      $scope.mainMenu = []
      j=0
      for i in [0..res.data.items.length - 1]
        if res.data.items[i].parent == 0
          $scope.mainMenu[j] = res.data.items[i]
          hasChildren = $scope.mainMenu[j]
          hasChildren.children = []
          j++
          k=0
        else if res.data.items[i].parent is hasChildren.ID
          hasChildren.children[k] = res.data.items[i]
          hasChildrensChildren = hasChildren.children[k]
          hasChildrensChildren.children = []
          k++
          l=0
        else if res.data.items[i].parent is hasChildrensChildren.ID
          hasChildrensChildren.children[l] = res.data.items[i]
          l++
]

app.controller 'Main', ["$scope", 'WPService',
($scope, WPService) ->
  WPService.getAllCategories()
  WPService.getPosts(1)
  $scope.data = WPService
]

app.controller '404', () ->
  #angTest.setTitle('Page not found')

app.controller 'Single', ["$scope", "$http", "$routeParams",
($scope, $http, $routeParams) ->
  $http.get('wp-json/posts/?filter[name]=' + $routeParams.slug).then (res) ->
    if res.data[0]
      #angTest.setTitle(res.data[0].title)
      $scope.post = res.data[0]
    else
      $http.get('wp-json/pages/?filter[name]=' + $routeParams.slug).then (res)->
        if res.data[0]
          #angTest.setTitle(res.data[0].title)
          $scope.post = res.data[0]
        else
          status: 404
          message: 'Could not find that post!'
  .then (msg) ->
    if msg.status is 404
      $scope.is404 = true
      #angTest.setTitle('Page not found')
      $scope.errorMessage = 'Error: ' + msg.message
]

app.controller 'Category', ["$scope", "$http", "$routeParams", 'WPService',
($scope, $http, $routeParams, WPService) ->
  WPService.getAllCategories()
  request = 'wp-json/taxonomies/category/terms/?filter[slug]='+
  $routeParams.category
  $http.get(request).then (res) ->
    if res.data[0]
      $scope.current_category_id = res.data[0].ID
      WPService.getPostsInCategory(res.data[0], $routeParams.page)
    else
      status: 404
      message: "That category doesn't exit!"
  .then (msg) ->
    if msg.status is 404
      $scope.is404 = true
      WPService.setTitle('Page not found', '')
      $scope.errorMessage = 'Error: ' + msg.message
  $scope.data = WPService
]

app.controller 'Search', ["$scope", "$routeParams", 'WPService',
($scope, $routeParams, WPService) ->
  WPService.getSearchResults($routeParams.query)
  $scope.data = WPService
]

app.controller 'Paged', ["$scope", "$routeParams", 'WPService',
($scope, $routeParams, WPService) ->
  WPService.getAllCategories()
  WPService.getPosts($routeParams.page)
  $scope.data = WPService
]

app.directive 'postsNavLink', () ->
  restrict: 'EA'
  templateUrl: myLocalized.partials + 'posts-nav-link.html',
  controller: ['$scope', '$element', '$routeParams',
  ( $scope, $element, $routeParams ) ->
    currentPage = if !$routeParams.page then 1 else parseInt($routeParams.page)
    linkPrefix = if !$routeParams.category then 'page/'
    else 'category/' + $routeParams.category + '/page/'
    $scope.postsNavLink =
      prevLink: linkPrefix + ( currentPage - 1 )
      nextLink: linkPrefix + ( currentPage + 1 )
      sep: if !$element.attr('sep') then '|' else $element.attr('sep')
      prevLabel: if !$element.attr('prev-label') then 'Previous Page'
      else $element.attr('prev-label')
      nextLabel: if !$element.attr('next-label') then 'Next Page'
      else $element.attr('next-label')
    ]

app.directive 'searchForm', () ->
  restrict: 'EA'
  templateUrl: myLocalized.partials + 'search-form.html',
  controller: ['$scope', '$http', '$location', '$routeParams',
  ($scope, $http, $location, $routeParams) ->
    $scope.filter =
      s: $routeParams.query
    $scope.search = () ->
      $location.path('/search/' + $scope.filter.s)
  ]
