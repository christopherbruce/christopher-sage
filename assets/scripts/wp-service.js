var WPService;

WPService = function($http) {
  var _setArchivePage, _setTitle;
  WPService = {
    categories: [],
    posts: [],
    pageTitle: '',
    currentPage: 1,
    totalPages: 1
  };
  _setTitle = function(documentTitle, pageTitle) {
    var title, titleSep;
    titleSep = ' * ';
    title = myLocalized.appTitle;
    WPService.pageTitle = pageTitle;
    return document.querySelector('title').innerHTML = documentTitle + titleSep + title;
  };
  _setArchivePage = function(posts, page, headers) {
    WPService.posts = posts;
    WPService.currentPage = page;
    return WPService.totalPages = headers('X-WP-TotalPages');
  };
  WPService.getAllCategories = function() {
    if (WPService.categories.length) {
      return;
    }
    return $http.get('wp-json/taxonomies/category/terms').then(function(res) {
      return WPService.categories = res.data;
    });
  };
  WPService.getPosts = function(page) {
    return $http.get('wp-json/posts/?page=' + page).then(function(res) {
      page = parseInt(page);
      if (isNaN(page) || page > res.headers('X-WP-TotalPages')) {
        return _setTitle('Page Not Found', 'Page Not Found');
      } else {
        if (page > 1) {
          _setTitle('Posts on Page ' + page, 'Posts on Page ' + page + ':');
        } else {
          _setTitle('Home', 'Latest Posts:');
        }
        return _setArchivePage(res.data, page, res.headers);
      }
    });
  };
  WPService.getPostsInCategory = function(category, page) {
    var documentTitle, pageTitle, request;
    page = isNaN(page) ? 1 : parseInt(page);
    pageTitle = 'Posts in ' + category.name;
    documentTitle = 'Category: ' + category.name;
    if (page > 1) {
      pageTitle += ' Page ' + page;
      documentTitle += ', Page: ' + page;
    }
    _setTitle(documentTitle, pageTitle + ':');
    request = 'wp-json/posts/?filter[category_name]=' + category.name;
    if (page) {
      request += '&page=' + page;
    }
    return $http.get(request).then(function(res) {
      return _setArchivePage(res.data, page, res.headers);
    });
  };
  WPService.getSearchResults = function(s) {
    return $http.get('wp-json/posts/?filter[s]=' + s + '&filter[posts_per_page]=-1').then(function(res) {
      _setTitle('Search Results for ' + s, 'Search Results:');
      WPService.filter = {
        s: s
      };
      return _setArchivePage(res.data, 1, res.headers);
    });
  };
  return WPService;
};

app.factory('WPService', ['$http', WPService]);
