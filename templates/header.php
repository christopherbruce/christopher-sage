<header class="banner" ng-controller="headerController">
  <div class="container">
    <a class="brand" href="<?= esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
    <nav class="nav-primary">
      <ul ng-if="mainMenu">
        <li ng-repeat="item in mainMenu">
          <a href="{{item.url}}" ng-bind-html="item.title"></a>
          <ul ng-if="item.children">
            <li ng-repeat="childitem in item.children">
              <a href="{{childitem.url}}" ng-bind-html="childitem.title"></a>
              <ul ng-if="childitem.children">
                <li ng-repeat="childchilditem in childitem.children">
                  <a href="{{childchilditem.url}}" ng-bind-html="childchilditem.title"></a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</header>
