// 首页
var index = (function () {
  //  获取loacl userinfo
  let userInfo = utils.GetLoaclStorageUserInfo('userinfo')
  // 未登录 跳转 登录页面
  if (!userInfo) login.redirect('login')
  // 已登录 设置菜单栏
  Event.create('header').trigger('loginSuccess', userInfo)
  Event.create('navigationMenu').trigger('loginSuccess')

  let params = {
    currentPage: 0,
    pageSize: 6,
    fixingListsTabIndex: 0
  }
  Event.create('fixing').trigger('GetTestFixingListForSearch', null, null, params, { query: '' })
  // Event.create('fixing').trigger('index', null, null, params, {})
})()