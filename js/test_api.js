

var FIXING_TEST_API = (function () {
  // 获取测试设备列表（搜索）
  function GetTestFixingListForSearch({ adminId, query }) {
    return axios.post('/GetTestFixingListForSearch', Qs.stringify({ adminId, query }))
  }
  // 批量添加测试新鞋垫
  function BatchAddTestFixing({ adminId, batchId, fixingIds }) {
    return axios.post('/BatchAddTestFixing', Qs.stringify({ adminId, batchId, fixingIds }))
  }
  return {
    GetTestFixingListForSearch,
    BatchAddTestFixing
  }
})()