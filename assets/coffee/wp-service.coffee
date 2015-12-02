WPService = ($http) ->
  WPService =
    categories: []
    posts: []
    pageTitle: ''
    currentPage: 1
    totalPages: 1

  _setTitle = (documentTitle, pageTitle) ->
    titleSep = ' * '
    title = myLocalized.appTitle
    WPService.pageTitle = pageTitle
    document.querySelector('title').innerHTML = documentTitle + titleSep + title

  _setArchivePage = (posts, page, headers) ->
    WPService.posts = posts
    WPService.currentPage = page
    WPService.totalPages = headers('X-WP-TotalPages')

  WPService.getAllCategories = () ->
    return if WPService.categories.length
    return $http.get('wp-json/taxonomies/category/terms').then (res) ->
      WPService.categories = res.data

  WPService.getPosts = (page) ->
    return $http.get('wp-json/posts/?page=' + page).then (res)->
      page = parseInt(page)

      if isNaN(page) or page > res.headers('X-WP-TotalPages')
        _setTitle('Page Not Found', 'Page Not Found')
      else
        if page>1
          _setTitle('Posts on Page ' + page, 'Posts on Page ' + page + ':')
        else
          _setTitle('Home', 'Latest Posts:')

        _setArchivePage( res.data, page, res.headers)

  WPService.getPostsInCategory = (category, page) ->
    page = if isNaN(page) then 1 else parseInt(page)
    pageTitle = 'Posts in ' + category.name
    documentTitle = 'Category: ' + category.name
    if page > 1
      pageTitle += ' Page ' + page
      documentTitle += ', Page: ' + page
    _setTitle(documentTitle, pageTitle + ':')
    request = 'wp-json/posts/?filter[category_name]=' + category.name
    if page then request += '&page=' + page
    return $http.get(request).then (res)->
      _setArchivePage(res.data, page, res.headers)

  WPService.getSearchResults = (s) ->
    return $http.get('wp-json/posts/?filter[s]=' + s +
    '&filter[posts_per_page]=-1').then (res)->
      _setTitle('Search Results for ' + s, 'Search Results:')
      WPService.filter =
        s: s

      _setArchivePage( res.data, 1, res.headers)

  return WPService

app.factory 'WPService', ['$http', WPService]
