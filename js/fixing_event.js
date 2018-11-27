var totalFixing = (function ($el) {
  Event.create('fixing').listen('index', function (map, source, params) {
    totalFixing.refresh(map, source, params)
  })
  return {
    refresh(map, source, params) {
      if (!source) return
      $el.text(source.length)
    },
  }
})($('.total-fixing'))

var onlineFixing = (function ($el) {
  Event.create('fixing').listen('index', function (map, source, params) {
    onlineFixing.refresh(map, source, params)
  })
  return {
    refresh(map, source, params) {
      if (!source) return
      $el.text(utils.FilterFixingLists(source, 'entity_desc', '在线').length)
    },
  }
})($('.online-fixing'))

var offlineFixing = (function ($el) {
  Event.create('fixing').listen('index', function (map, source, params) {
    offlineFixing.refresh(map, source, params)
  })
  return {
    refresh(map, source, params) {
      if (!source) return
      $el.text(utils.FilterFixingLists(source, 'entity_desc', '离线').length)
    },
  }
})($('.offline-fixing'))


// 搜索
var fixingSearch = (function ($el) {
  Event.create('fixing').listen('index', function (map, source, params, fixing) {
    fixingSearch.refresh(map, source, params, fixing)
  })
  return {
    refresh(map, source, params, fixing) {
      $el.off('click').on('click', 'button', function (e) {
        fixing.query = $el.find('.nav-search').val()
        Event.create('fixing').trigger('GetTestFixingListForSearch', map, source, params, fixing)
      })
    }
  }
})($('.search-container'))

// 搜索
var GetTestFixingListForSearch = (function ($el) {
  Event.create('fixing').listen('GetTestFixingListForSearch', function (map, source, params, fixing) {
    GetTestFixingListForSearch.refresh(map, source, params, fixing)
  })
  return {
    refresh(map, source, params, fixing) {
      let userInfo = utils.GetLoaclStorageUserInfo('userinfo')
      console.log(fixing)
      FIXING_TEST_API.GetTestFixingListForSearch({ adminId: userInfo.AdminId, query: fixing.query }).then(res => {
        if (res.data.ret === 1001) {
          Event.create('fixing').trigger('index', map, res.data.data, params, fixing)
          Event.create('fixing').trigger('init', map, res.data.data, params, fixing)
        }
        if (res.data.ret === 1002) {
          $('#no-data-ModalCenter').find('.no-data-container').text(res.data.code)
          $('#no-data-ModalCenter').modal('show')
          Event.create('fixing').trigger('index', map, [], params, fixing)
          $('.fixing-container > tbody').empty()
        }

      })
    }
  }
})()

// 选择文件
var selectFile = (function ($el) {
  Event.create('fixing').listen('index', function (map, source, params, fixing) {
    selectFile.refresh(map, source, params, fixing)
  })
  return {
    refresh(map, source, params, fixing) {
      $el.off('change').on('change', function (e) {
        let persons = []  // 存储获取到的数据
        let files = e.target.files,
          fileName = files[0].name,
          fileSize = `大小：${(files[0].size / 1024).toFixed(0)}kb`
        fileReader = new FileReader()
        fileReader.onload = function (ev) {
          try {
            var data = ev.target.result,
              workbook = XLSX.read(data, {
                type: 'binary'
              }) // 以二进制流方式读取得到整份excel表格对象
            // persons = []; // 存储获取到的数据
          } catch (e) {
            console.log('文件类型不正确');
            return;
          }

          // 表格的表格范围，可用于判断表头是否数量是否正确
          var fromTo = '';
          // console.log(workbook)
          // 遍历每张表读取
          for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
              fromTo = workbook.Sheets[sheet]['!ref'];
              console.log(fromTo);
              for (var page in workbook.Sheets[sheet])
                switch (page) {
                  case '!margins':
                    break;
                  case '!ref':
                    break;
                  default:
                    persons.push(workbook.Sheets[sheet][page].v)
                    break;
                }
              // persons = persons.concat(XLSX.utils.sheet_to_csv(workbook.Sheets[sheet], ','));
              break; // 如果只取第一张表，就取消注释这行
            }
          }
          $('.file-name').text(fileName)
          $('.file-size').text(fileSize)
          $('.file-result').show()
          fixing.persons = persons
          Event.create('fixing').trigger('BatchAddTestFixing', map, source, params, fixing)
        }
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(files[0]);
      });
    }
  }
})($('.select-file'))


// 添加测试新设备
var BatchAddTestFixing = (function ($el) {
  Event.create('fixing').listen('BatchAddTestFixing', function (map, source, params, fixing) {
    BatchAddTestFixing.refresh(map, source, params, fixing)
  })
  return {
    refresh(map, source, params, fixing) {
      $el.off('click').on('click', function () {
        let userInfo = utils.GetLoaclStorageUserInfo('userinfo')
        FIXING_TEST_API.BatchAddTestFixing({ adminId: userInfo.AdminId, batchId: '', fixingIds: fixing.persons.join(',') }).then(res => {
          if (res.data.ret === 1001) {
            $('#no-data-ModalCenter').find('.no-data-container').text(res.data.code)
            $('#no-data-ModalCenter').modal('show')
            fixing.query = ''
            Event.create('fixing').trigger('GetTestFixingListForSearch', map, source, params, fixing)
          }
        })
      })
    }
  }
})($('.update-file'))

var fixingListsTab = (function ($el) {
  Event.create('fixing').listen('init', function (map, source, params, fixing) {
    fixingListsTab.refresh(map, source, params, fixing)

  })
  return {
    refresh(map, source, params, fixing) {
      $el.off('click').on('click', 'li', e => {
        $(e.currentTarget)
          .find('p:first-of-type')
          .removeClass('text-muted')
          .addClass('text-white')
        $(e.currentTarget)
          .siblings()
          .find('p:first-of-type')
          .removeClass('text-white')
          .addClass('text-muted')
        params.fixingListsTabIndex = $(e.currentTarget).index()
        Event.create('fixing').trigger('index', map, source, params, fixing)
      })
        .find('li')
        .eq(params.fixingListsTabIndex)
        .find('p:first-of-type')
        .removeClass('text-muted')
        .addClass('text-white')
    }
  }

})($('.header-right'))


// 鞋垫列表
var fixingLists = (function ($el) {
  Event.create('fixing').listen('index', function (map, source, params, fixing) {
    fixingLists.refresh(map, source, params, fixing)
    fixingLists.unBindEvent()
    fixingLists.bindIndexEvent(map, source, params, fixing)
  })

  return {
    unBindEvent() {
      $el.off('click')
    },
    bindIndexEvent(map, source, params) {
      $el.on('click', 'li', function (e) {
        // update item css
        $(e.currentTarget)
          .removeClass('text-muted')
          .addClass('text-white')
          .siblings()
          .removeClass('text-white')
          .addClass('text-muted')

      })

    },
    refresh(map, source, params, fixing) {
      if (!source) return
      let cache = []

      // 仅处理展示前10/6条数据
      let handleToCaches = source => {
        if ((source.length / params.pageSize) < params.currentPage) {
          // url
          params.currentPage = 0
          utils.SetUrlParams(params)
        }
        let currentIndex = params.currentPage * params.pageSize
        for (let index = currentIndex; index < currentIndex + params.pageSize; index++) {
          if (source[index]) cache.push(source[index])
        }
      }
      if (params.fixingListsTabIndex === 0) handleToCaches(source)
      if (params.fixingListsTabIndex === 1) handleToCaches(onlineArrays = utils.FilterFixingLists(source, 'entity_desc', '在线'))
      if (params.fixingListsTabIndex === 2) handleToCaches(offlineArrays = utils.FilterFixingLists(source, 'entity_desc', '离线'))
      // 处理 cache 数据
      $el.find('tbody').html(cache.map(item => {
        let img, activeTextColor = 'text-muted'
        // url fixingid css acitve
        if (params && params.fixingId === item.entity_name) activeTextColor = 'text-white'
        let $tmp = $(`
              <tr class="${activeTextColor} text-center hover">
                <th scope="row" class="pt-4 pb-4 pl-4">${item.entity_name}</th>
                <td class="pt-4 pb-4">${utils.handleTimestampToDateTime(item.latest_location.loc_time)}</td>
                <td class="pt-4 pb-4">${item.entity_desc}</td>
                <td class="pt-4 pb-4">
                <button type="button" class="btn btn-primary border-radius-small" onclick="Event.create('fixing').trigger('instructionsDialog', null, { entity_name: ${item.entity_name}}, { fixingId: ${item.entity_name}, type: 'init', currentTime: utils.handleTimestampToDate(new Date()) })">
                  <img src="/assets/contro_instruction.png" width="13" height="20" />
                  指令
                </button></td>
              </tr>
            `)
        return $tmp
      }))

    }
  }
})($('.fixing-container'))

// 鞋垫列表分页
var fixingListsPagination = (function ($el) {
  Event.create('fixing').listen('index', function (map, source, params, fixing) {
    fixingListsPagination.refresh(map, source, params, fixing)
  })

  return {
    refresh(map, source, params, fixing) {
      if (!source) source = []
      let cache = null
      // 根据 tabIndex 选择分组
      let hadnleToCache = source => {
        cache = Object.assign([], source)
        if ((source.length / params.pageSize) + 1 < params.currentPage) {
          params.currentPage = 0
        }
      }
      if (params.fixingListsTabIndex === 0) hadnleToCache(source)
      if (params.fixingListsTabIndex === 1) hadnleToCache(utils.FilterFixingLists(source, 'entity_desc', '在线'))
      if (params.fixingListsTabIndex === 2) hadnleToCache(utils.FilterFixingLists(source, 'entity_desc', '离线'))
      $el.jqPaginator({
        totalCounts: cache.length ? cache.length : 1,
        pageSize: params.pageSize,
        visiblePages: 7,
        currentPage: params.currentPage + 1,
        prev: '<li class="prev pt-1 pb-1 pl-2 pr-2 bg-33385e ml-1 mr-1 text-white"><a href="javascript:;">&lt;</a></li>',
        next: '<li class="next pt-1 pb-1 pl-2 pr-2 bg-33385e ml-1 mr-1 text-white"><a href="javascript:;">	&gt;</a></li>',
        page: '<li class="page pt-1 pb-1 pl-2 pr-2 bg-33385e ml-1 mr-1 text-white"><a href="javascript:;">{{page}}</a></li>',
        onPageChange: function (num, type) {
          if (type === 'init') return
          params.currentPage = num - 1
          Event.create('fixing').trigger('index', map, source, params, fixing)
        }
      })
    }
  }
})($('#pagination'))


// 鞋垫指令
// var fixingInstructions = (function ($el) {
//   Event.create('fixing').listen('AdminGetInstructionsList', function (map, item, fixing) {
//     fixingInstructions.refresh(map, item, fixing)
//   })

//   return {
//     refresh(map, item, fixing) {

//       if (fixing.type === 'init') {
//         fixing.currentTime = utils.handleTimestampToDate(fixing.currentTime)
//         $el.find('.instructions-datepicker').datepicker('update', fixing.currentTime);
//       }

//       // loacl 获取数据
//       userInfo = utils.GetLoaclStorageUserInfo('userinfo')
//       FIXING_API.AdminGetInstructions({ adminId: userInfo.AdminId, fixingId: item.entity_name, time: fixing.currentTime }).then(res => {
//         if (res.data.ret == 1001) {
//           let instructionsContent = res.data.data.reverse().map(item => {
//             return `<tr class="">
//                 <td class="border">${item.shijian}</td>
//                 <td class="border text-center">${item.leixing}</td>
//                 <td class="border breakAll">${item.content}</td>
//               </tr>`
//           }).join('')
//           $el.find('.instructions-container > .instructions-table > tbody').html(instructionsContent)
//           $el.modal('show')
//         }
//         if (res.data.ret === 1002) {
//           $el.find('.instructions-container').text(res.data.code)
//           $el.modal('show')
//         }
//       })
//     }
//   }
// })($('#instructions-list-ModalCenter'))


// 指令日期选择器
// var fixingInstructionsDatepicker = (function ($el) {
//   Event.create('fixing').listen('AdminGetInstructionsList', function (map, item, fixing) {
//     fixingInstructionsDatepicker.refresh(map, item, fixing)
//   })

//   return {
//     refresh(map, item, fixing) {
//       $el.off('changeDate').one('changeDate', function (e) {
//         fixing.currentTime = utils.handleTimestampToDate($el.datepicker('getDate'))
//         $el.datepicker('update', fixing.currentTime)
//         fixing.type = 'update'
//         Event.create('fixing').trigger('AdminGetInstructionsList', map, item, fixing)
//       })
//     }
//   }
// })($('.instructions-datepicker'))

// instructions-list-20181126-ModalCenter
var instructionsDialog = (function ($el) {
  Event.create('fixing').listen('instructionsDialog', function (map, item, fixing) {
    instructionsDialog.refresh(map, item, fixing)
  })

  return {
    refresh(map, item, fixing) {
      Event.create('fixing').trigger('AdminGetInstructionsList', map, item, fixing)
      Event.create('fixing').trigger('AdminGetInstructions', map, item, fixing)
    }
  }
})()

var AdminGetInstructions = (function($el) {
  Event.create('fixing').listen('AdminGetInstructions', function (map, item, fixing) {
    AdminGetInstructions.refresh(map, item, fixing)
  })
  
  return {
    refresh(map, item, fixing) {
      // let titleHHTML = map.getInfoWindow().getTitle(),
      //   titleNode = document.createRange().createContextualFragment(titleHHTML)
      // fixing.fixingId = titleNode.textContent
      if (fixing.type === 'init') {
        let currentTime = $el.find('.instructions-datepicker').attr('value')
        console.log(currentTime)
        if (currentTime) fixing.currentTime = currentTime
      }
      console.log(fixing)
      // loacl 获取数据
      $el.find('.instructions-datepicker').datepicker('update', fixing.currentTime)
      let userInfo = utils.GetLoaclStorageUserInfo('userinfo')
      FIXING_API.AdminGetInstructions({ adminId: userInfo.AdminId, fixingId: fixing.fixingId, time: fixing.currentTime }).then(res => {
        if (res.data.ret === 1001) {
          // 1 设备 2 平台
          let instructionsContent = res.data.data.reverse().map(item => {
            let leixingText = item.leixing === '1' ? '设备' : '平台'
            return $(`<tr class="">
                <td class="" width="120">${item.shijian}</td>
                <td class="" width="100">${leixingText}</td>
                <td class="breakAll">${item.content}</td>
              </tr>`)
          })
          $el.find('#AdminGetInstructions .tbody').mCustomScrollbar()
          .find('.mCustomScrollBox > .mCSB_container').empty().append(instructionsContent)
          $el.find('#AdminGetInstructions .tbody').mCustomScrollbar('scrollTo', 'top')
          $el.modal('show')
        }
        if (res.data.ret === 1002) {
          $el.find('#AdminGetInstructions  .tbody').mCustomScrollbar()
          .find('.mCustomScrollBox > .mCSB_container').empty().append(`<tr>
            <td colspan="3" class="text-center pt-2 pb-2">${res.data.code}</td>
          </tr>`)
          $el.modal('show')
        }
      })
    }
  }

})($('#instructions-list-20181126-ModalCenter'))


var AdminGetInstructionsList = (function($el) {
  Event.create('fixing').listen('AdminGetInstructionsList', function (map, fixing) {
    AdminGetInstructionsList.refresh(map, fixing)
  })
  
  return {
    refresh(map, fixing) {
      let userInfo = utils.GetLoaclStorageUserInfo('userinfo')
      FIXING_API.AdminGetInstructionsList({ adminId: userInfo.AdminId }).then(res => {
        if (res.data.ret === 1001) {
          let instructionsContent = res.data.data.map((item, index) => {
            return $(`<tr class="" data-id="${item.Id}" data-instructions="${item.Instructions}" data-type="${item.type}">
                <td class="pl-4">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios${item.Id}" value="${item.Instructions}">
                  <label class="form-check-label" for="exampleRadios${item.Id}">
                    ${item.Content}
                  </label>
                </div>
              </td>
              </tr>`)
          })
          $el.find('#AdminGetInstructionsList .tbody').mCustomScrollbar()
          .find('.mCustomScrollBox > .mCSB_container').empty().append(instructionsContent)
        }
        if (res.data.ret === 1002) {
        
        }
      })
    }
  }

})($('#instructions-list-20181126-ModalCenter'))


// 指令日期选择器
var fixingInstructionsDatepicker = (function ($el) {
  Event.create('fixing').listen('instructionsDialog', function (map, item, fixing) {
    fixingInstructionsDatepicker.refresh(map, item, fixing)
  })

  return {
    refresh(map, item, fixing) {
      $el.off('changeDate').on('changeDate', function (e) {
        fixing.currentTime = utils.handleTimestampToDate($el.datepicker('getDate'))
        $el.datepicker('update')
        fixing.type = 'update'
        Event.create('fixing').trigger('AdminGetInstructions', map, item, fixing)
      })
    }
  }
})($('.instructions-datepicker'))

// 
var SendInstruction = (function ($el) {
  Event.create('fixing').listen('instructionsDialog', function (map, item, fixing) {
    SendInstruction.refresh(map, item, fixing)
  })

  return {
    refresh(map, item, fixing) {
      $el.off('click').on('click', function (e) {
        let userInfo = utils.GetLoaclStorageUserInfo('userinfo')
        let instruction = $('#InstructionsTextarea').val()
        // let InstructionsRadio = $('input:radio:checked').val()
        // let instruction = InstructionsTextarea ? InstructionsTextarea : InstructionsRadio
        FIXING_API.SendInstruction({ adminId: userInfo.AdminId, fixingId: fixing.fixingId, instruction }).then(res => {
          if (res.data.ret === 1001 ) {
            $('#no-data-ModalCenter').find('.no-data-container').text(res.data.code)
            $('#no-data-ModalCenter').modal('show')
            Event.create('fixing').trigger('AdminGetInstructions', map, item, fixing)
          }
          if (res.data.ret === 1002) {
            $('#no-data-ModalCenter').find('.no-data-container').text(res.data.code)
            $('#no-data-ModalCenter').modal('show')
          }
        })
      })
    }
  }
})($('#SendInstruction-button'))

var AdminGetInstructionsListChecks = (function ($el) {
  Event.create('fixing').listen('instructionsDialog', function (map, item, fixing) {
    AdminGetInstructionsListChecks.refresh(map, item, fixing)
  })

  return {
    refresh(map, item, fixing) {
      $el.off('click').on('click', 'input.form-check-input', function (e) {
        $('#InstructionsTextarea').val($(this).val())
      })
    }
  }
})($('#AdminGetInstructionsList'))

var restartButton = (function ($el) {
  Event.create('fixing').listen('instructionsDialog', function (map, item, fixing) {
    restartButton.refresh(map, item, fixing)
  })

  return {
    refresh(map, item, fixing) {
      $el.off('click').on('click', function (e) {
        Event.create('fixing').trigger('AdminGetInstructions', map, item, fixing)
      })
    }
  }
})($('.restart-button'))

