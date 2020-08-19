Page({
  data: {
    isFixedMenu:false,
    isTeamFixed:false,
    currentScrollTeamID:1,
    currentID:'',
    currentName:'',
    currentTeamID:'',
    modules:{},
    todayFont:'',
    selectedDateFont:'',
    selectedDateFormat:'',
    selectedStartDateFormat:'',
    selectedEndDateFormat:'',
    datePicker:{
      isShow:false,
      animationData:{},
      animationInfo:{}
    },
    datePicker1:{
      isShow:false,
      animationData:{},
      animationInfo:{}
    },
    dateData:{},
    dateData1:{},
    trendstatus:1,
    permissionsData:{},
    isLoading:true,
    chartType:[
      {name:'日趋势',type:'day',isOn:true},
      {name:'月趋势',type:'month',isOn:false},
    ],
    changeData:{},
    initData:{},
    dayData:[],
    monthData:[],
    currentChartData:{},
    dateType:'start',
    isDelete:false,
    selectedDate:{
      startDate:'',
      endDate:'',
    },
    isList:false,
    isEdit:false,
    isCanEdit:false,
    rankList:[],
    currentRankData:{},
    userList:[],
    isLeader:false,
    waterMark:{},
    scrollLeft:0,
    currentUserList:[],
    isSubShow:false,
    currentSubData:{},
    currentParentName:'',
    currentTeamName:'',
  },
  onLoad(query) {
    console.log(query);
    var $this = this;
    $this.hideDatePicker();
    var currentDay = $this.getToday();
    var month = currentDay.month<10?"0"+currentDay.month:currentDay.month;
    var day = currentDay.day<10?"0"+currentDay.day:currentDay.day;
    var selectedStartDateFormat = currentDay.year+'-'+month+'-'+day;
    var selectedEndDateFormat = currentDay.year+'-'+month+'-'+day;
    var selectedDate = $this.data.selectedDate;
    selectedDate.startDate = selectedDate.endDate = selectedStartDateFormat;
    var todayFont = currentDay.year + '年' +month+'月'+day+"日";
    var selectedDateFont = currentDay.year + '年' +month+'月';
    var selectedDateFormat = currentDay.year + '-' +month;
    var dateData = $this.initDate(currentDay);
    var dateData1 = $this.initDate1(currentDay);
    var permissionsData ={};
    var isList = false;
    var isLeader = false;
    var currentID = parseInt(query.id);
    var currentTeamID = parseInt(query.teamID);
    if(currentID == 65){
      currentTeamID = 14;
    }
    var currentName = query.name;
    var chartType = $this.data.chartType;
    var trendstatus = 1;
    var waterMark = {};
    chartType.forEach(function(item,index){
      if(item.type == 'day'){
        item.isOn = true;
      }else{
        item.isOn = false;
      }
    });
    dd.getStorage({
      key: 'permissionsData',
      success: function(res) {
        permissionsData = res.data;
        console.log(permissionsData,"permissionsData_per");
        dd.getStorage({
          key: 'waterMark',
          success: function(res) {
            waterMark = res.data;
            console.log(waterMark,"waterMark");
            $this.setData({
              permissionsData
            },function(){
              if(permissionsData.level == 1){
                isLeader = true;
                if(permissionsData.id==currentID){
                  isList = true;
                }else{
                  isList = false;
                }
              }else{
                isLeader = false;
                isList = false;
              }
              $this.setData({
                todayFont,
                selectedDateFont,
                selectedDateFormat,
                waterMark,
                currentTeamID,
                isList,
                isLeader,
                currentID,
                currentName,
                selectedStartDateFormat,
                selectedEndDateFormat,
                dateData,
                dateData1,
                selectedDate,
                chartType,
                trendstatus
              },function(){
                $this.getInitData();
              });
            });
          },
          fail: function(res){
            console.log(res,"per_res01");
          }
        });
      },
      fail: function(res){
        console.log(res,"per_res02");
      }
    });
  },
  // 组装数据
  getItemRank:function(a,b,c){
    var itemRank = {};
    itemRank.rankList = a;
    itemRank.rankList.forEach(function(item){
      item.teamName = item.name.split('-')[1];
      item.userName = item.name.split('-')[0];
      item.rankAbs = Math.abs(item.rankcha);
      if(item.rankcha>0){
        item.rankFont = "des";
      }else if(item.rankcha<0){
        item.rankFont = "asc";
      }else{
        item.rankFont = "equ";
      }
    });
    itemRank.ranking = b;
    itemRank.type = c+"榜单";
    return itemRank;
  },
  // 榜单类型切换
  changeRankType:function(e){
    var $this = this;
    var type = e.currentTarget.dataset.type;
    var rankingList = $this.data.rankingList;
    var currentRankData = {};
    rankingList.forEach(function(item,index){
      if(item.type == type){
        item.isOn = true;
        currentRankData.rankList = item.rankList;
        currentRankData.ranking = item.ranking;
      }else{
        item.isOn = false;
      }
    });
    $this.setData({
      rankingList,
      currentRankData
    });
  },
  // 榜单组别切换
  changeRankTeam:function(e){
    var $this = this;
    var id = e.currentTarget.dataset.id;
    var rankList = $this.data.userData.ranklist;
    var a = $this.data.selectedStartDateFormat;
    var b = $this.data.selectedEndDateFormat;
    var rankingList = [];
    var currentRankData = {};
    var currentRankList = {};
    var currentAreaData = {};
    var currentTeamID = "";
    rankList.forEach(function(item,index){
      if(item.id == id){
        item.isOn = true;
        currentRankList = item;
        currentTeamID = id;
        currentAreaData = $this.data.userData.trend[index];
      }else{
        item.isOn = false;
      }
    });
    if(a == b){
      var itemTeamDayRank = $this.getItemRank(currentRankList.daylist,currentRankList.dayrank,"组内日");
      var itemTeamMonthRank = $this.getItemRank(currentRankList.monthlist,currentRankList.monthrank,"组内月");
      var itemCompanyDayRank = $this.getItemRank(currentRankList.companyday,currentRankList.companyrank,"公司日");
      var itemCompanyMonthRank = $this.getItemRank(currentRankList.companymonth,currentRankList.companymonthrank,"公司月");
      if(itemTeamDayRank.rankList.length>0){
        rankingList.push(itemTeamDayRank);
      }
      if(itemTeamMonthRank.rankList.length>0){
        rankingList.push(itemTeamMonthRank);
      }
      if(itemCompanyDayRank.rankList.length>0){
        rankingList.push(itemCompanyDayRank);
      }
      if(itemCompanyMonthRank.rankList.length>0){
        rankingList.push(itemCompanyMonthRank);
      }
    }else{
      var itemTeamDayRank = $this.getItemRank(currentRankList.daylist,currentRankList.dayrank,"组内阶段");
      var itemCompanyDayRank = $this.getItemRank(currentRankList.monthlist,currentRankList.monthrank,"公司阶段");
      if(itemTeamDayRank.rankList.length>0){
        rankingList.push(itemTeamDayRank);
      }
      if(itemCompanyDayRank.rankList.length>0){
        rankingList.push(itemCompanyDayRank);
      }
      
    }
    rankingList.forEach(function(item,index){
      if(index == 0){
        item.isOn = true;
        currentRankData.rankList = item.rankList;
        currentRankData.ranking = item.ranking;
      }else{
        item.isOn = false;
      }
    });
    var currentChartData = {}; 
    var dayData = {};
    var monthData = {};
    dayData = [currentAreaData.daytrend];
    monthData = [currentAreaData.monthtrend];
    if($this.data.trendstatus == 1){
      currentChartData = $this.getAreaChart(dayData);
    }else{
      currentChartData = $this.getAreaChart(monthData);
    }
    $this.setData({
      currentTeamID,
      rankingList,
      'userData.ranklist':rankList,
      currentRankData,
      dayData,
      monthData,
      currentChartData,
    });
  },
  // 初始化日期控件
  initDate:function(currentDate){
    var $this = this;
    var today=  $this.getToday();
    var todayYear = ""+today.year;
    var todayMonth = today.month<10?('0'+today.month): (""+today.month);
    var todayDay = today.day<10?("0"+today.day):(""+today.day);
    var currentMonth = currentDate.month<10?('0'+currentDate.month): (""+currentDate.month);
    var currentDay = currentDate.day<10?("0"+currentDate.day):(""+currentDate.day);
    const years = [];
    const months = [];
    const days = [];
    var year = "" + currentDate.year;
    var month = currentMonth;
    var day = currentDay;
    for (let i = 2008; i <= today.year; i++) {
      years.push(""+i)
    }
    for (let i = 1; i <= 12; i++) {
      var k = i;
      if (0 <= i && i <= 9) {
        k = "0" + (i);
      } else {
        k = (""+i);
      }
      months.push(k)
    }
    var currentDayNum = $this.getCurrentMonthDays(parseInt(year),parseInt(month));
    for (let i = 1; i <= currentDayNum; i++) {
      var k = i;
      if (0 <= i && i <= 9) {
        k = "0" + (i);
      } else {
        k = (""+i);
      }
      days.push(k)
    }
    var dateData = {};
    dateData.years = years;
    dateData.months = months;
    dateData.days = days;
    dateData.year = year;
    dateData.month = month;
    dateData.day = day;
    dateData.value = [];
    dateData.todayValue = [];
    dateData.years.forEach(function(item,index){
      if(year == item){
        dateData.value.push(index);
      }
      if(todayYear == item){
        dateData.todayValue.push(index);
      }
    });
    dateData.months.forEach(function(item,index){
      if(month == item){
        dateData.value.push(index);
      }
      if(todayMonth == item){
        dateData.todayValue.push(index);
      }
    });
    var newMonths = [];
    dateData.months.forEach(function(item,index){
      if(index <= dateData.todayValue[1]){
        newMonths.push(item);
      }
    });
    dateData.months = newMonths;
    dateData.days.forEach(function(item,index){
      if(day == item){
        dateData.value.push(index);
      }
      if(todayDay == item){
        dateData.todayValue.push(index);
      }
    });
    var newDays = [];
    dateData.days.forEach(function(item,index){
      if(index <= dateData.todayValue[2]){
        newDays.push(item);
      }
    });
    dateData.days = newDays;
    return dateData;
  },
  initDate1:function(currentDate){
    var $this = this;
    const years = [];
    const months = [];
    var today=  $this.getToday();
    var todayYear = ""+today.year;
    var todayMonth = today.month<10?('0'+today.month): (""+today.month);
    var currentMonth = currentDate.month<10?('0'+currentDate.month): (""+currentDate.month);
    var year = "" + currentDate.year;
    var month = currentMonth;
    for (let i = 2008; i <= today.year; i++) {
      years.push(""+i)
    }
    for (let i = 1; i <= 12; i++) {
      var k = i;
      if (0 <= i && i <= 9) {
        k = "0" + (i);
      } else {
        k = (""+i);
      }
      months.push(k)
    }
    // for (let i = 1; i <= 31; i++) {
    //   var k = i;
    //   if (0 <= i && i <= 9) {
    //     k = "0" + (i);
    //   } else {
    //     k = (""+i);
    //   }
    //   days.push(k)
    // }
    var dateData = {};
    dateData.years = years;
    dateData.months = months;
    // dateData.days = days;
    dateData.year = year;
    dateData.month = month;
    // dateData.day = day;
    dateData.value = [];
    dateData.todayValue = [];
    dateData.years.forEach(function(item,index){
      if(year == item){
        dateData.value.push(index);
      }
      if(todayYear == item){
        dateData.todayValue.push(index);
      }
    });
    dateData.months.forEach(function(item,index){
      if(month == item){
        dateData.value.push(index);
      }
      if(todayMonth == item){
        dateData.todayValue.push(index);
      }
    });
    var newMonths = [];
    dateData.months.forEach(function(item,index){
      if(index <= dateData.todayValue[1]){
        newMonths.push(item);
      }
    });
    dateData.months = newMonths;
    return dateData;
  },
  // 选择日期
  selectedDate:function(e){
    var $this = this;
    var type = e.currentTarget.dataset.type;
    var dateData = $this.data.dateData;
    var selectedDate = $this.data.selectedDate;
    if(type=="start"){
      if(selectedDate.startDate == ""){
        selectedDate.startDate = dateData.year+'-'+dateData.month+'-'+dateData.day;
      }else{
        var dateObj = {};
        dateObj.year = parseInt(selectedDate.startDate.split('-')[0]);
        dateObj.month = parseInt(selectedDate.startDate.split('-')[1]);
        dateObj.day = parseInt(selectedDate.startDate.split('-')[2]);
        dateData = $this.initDate(dateObj);
      }
    }else{
      if(selectedDate.endDate == ""){
        selectedDate.endDate = dateData.year+'-'+dateData.month+'-'+dateData.day;
      }else{
        var dateObj = {};
        dateObj.year = parseInt(selectedDate.endDate.split('-')[0]);
        dateObj.month = parseInt(selectedDate.endDate.split('-')[1]);
        dateObj.day = parseInt(selectedDate.endDate.split('-')[2]);
        dateData = $this.initDate(dateObj);
      }
    }
    $this.setData({
      isDelete:false,
      dateType:type,
      selectedDate,
      dateData
    });
  },
  // 删除已选日期
  deleteDate:function(){
    var $this = this;
    var selectedDate = $this.data.selectedDate;
    var today = $this.getToday();
    var dateData = $this.initDate(today);
    selectedDate.startDate = '';
    selectedDate.endDate = '';
    $this.setData({
      isDelete:true,
      selectedDate,
      dateType:'',
      dateData,
    });
  },
  // 返回成员列表页
  backList:function(){
    this.setData({
      scrollLeft:0,
      isList:true
    });
    this.getInitData();
  },
  // 编辑个人签名
  editUserFont:function(){
    var $this = this;
    var isCanEdit = $this.data.isCanEdit;
    if(isCanEdit){
       $this.setData({
        isEdit:true
      });
    }
  },
  // 取消编辑
  cancelEdit:function(){
    var $this = this;
    $this.setData({
      isEdit:false
    });
  },
  // 获取签名输入框的值
  getTextareaValue:function(e){
    this.setData({
      textareaValue: e.detail.value
    });
  },
  // 保存发布编辑个人签名
  saveEdit:function(){
    var $this = this;
    var isLoading = true;
    var permissionsData = $this.data.permissionsData;
    var content = $this.data.textareaValue;
    if(content==''){
      dd.alert({
        title: '提示',
        content: '签名不能为空',
        buttonText: '我知道了',
        success: () => {},
      });
      return false;
    }
    dd.httpRequest({
      url: 'https://www.xuankuangchina.com/Newapi/personinfo',
      method: 'POST',
      data: {
        openid: $this.data.currentID,
        content:content
      },
      dataType: 'json',
      success: function(res) {
        var newData = res.data;
        isLoading = false;
        if(newData.code==200){
          dd.showToast({
            content: '保存成功',
            duration: 3000,
            success: () => {},
          });
          $this.setData({
            'userData.userinfo.persontarget':content,
            isEdit:false
          });
        }else{
          dd.showToast({
            content: '保存失败',
            duration: 3000,
            success: () => {},
          });
        }
        dd.hideLoading();
      },
      fail:function(err){
        console.log(err,"err01");
      }
    });
  },
  // 获取当月总天数
  getCurrentMonthDays:function(year,month){
    var d = new Date(year,month,0);
    return d.getDate();
  },
  // 日历变更时的监听事件
  datePickerChange:function(e){
    var $this = this;
    var dateData = $this.data.dateData;
    var dateType = $this.data.dateType;
    var selectedDate = $this.data.selectedDate;
    var today = $this.getToday();
    today.year = ""+today.year;
    today.month = today.month<10?"0"+today.month:""+today.month;
    today.day = today.day<10?"0"+today.day:""+today.day;
    var months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    var currentDay = [];
    dateData.value = e.detail.value;
    currentDay = $this.getCurrentMonthDays(parseInt(dateData.years[dateData.value[0]]),parseInt(dateData.months[dateData.value[1]]));
    var days = [];
    for (let i = 1; i <= currentDay; i++) {
      var k = i;
      if (0 <= i && i <= 9) {
        k = "0" + (i);
      } else {
        k = (""+i);
      }
      days.push(k)
    }
    if(dateData.value[0]==dateData.years.length-1){
      if(dateData.value[1]>parseInt(today.month)-1){
        dateData.value[1] = parseInt(today.month)-1;
      }
      if(dateData.value[1]==parseInt(today.month)-1&& dateData.value[2]>parseInt(today.day)-1){
        dateData.value[2] = parseInt(today.day)-1;
      }
    }
    if(dateData.value[0]<dateData.years.length-1){
      dateData.months = months;
    }else{
      var maxIndex = 0;
      var newMonths = [];
      months.forEach(function(item,index){
        if(today.month == item){
          maxIndex = index;
        }
      });
      months.forEach(function(item,index){
        if(index<=maxIndex){
          newMonths.push(item);
        }
      });
      dateData.months = newMonths;
    }
    if(dateData.value[0]==dateData.years.length-1&&dateData.value[1]==dateData.months.length-1){
      var maxIndex = 0;
      var newDays = [];
      days.forEach(function(item,index){
        if(today.day == item){
          maxIndex = index;
        }
      });
      days.forEach(function(item,index){
        if(index<=maxIndex){
          newDays.push(item);
        }
      });
      dateData.days = newDays;
    }else{
      dateData.days = days;
    }
    if(dateData.value[2]>dateData.days.length-1){
      dateData.value[2] = dateData.days.length-1;
    }
    dateData.year = dateData.years[dateData.value[0]];
    dateData.month = dateData.months[dateData.value[1]];
    dateData.day = dateData.days[dateData.value[2]];
    if(dateType == 'start'){
      selectedDate.startDate = dateData.year+'-'+dateData.month+'-'+dateData.day;
    }else{
      selectedDate.endDate = dateData.year+'-'+dateData.month+'-'+dateData.day;
    }
    $this.setData({
      dateData,
      selectedDate
    });
  },
  // 保存更改的日期，并获取新日期下的数据
  getCurrentDateData:function(){
    var $this = this;
    var dateData = $this.data.dateData;
    var selectedDate = $this.data.selectedDate;
    var selectedStartDateFormat = "";
    var selectedEndDateFormat = "";
    selectedStartDateFormat = selectedDate.startDate;
    selectedEndDateFormat = selectedDate.endDate;
    if(selectedStartDateFormat==""||selectedEndDateFormat==""){
      dd.alert({
        title: '提示',
        content: '日期不能为空',
        buttonText: '我知道了',
        success: () => {},
      });
      return false;
    }
    $this.hideDatePicker();
    $this.setData({
      selectedStartDateFormat,
      selectedEndDateFormat,
    });
    $this.getSearchData();
  },
  // 日历变更时的监听事件
  datePickerChange1:function(e){
    var $this = this;
    console.log(e,"e01");
    var dateData1 = $this.data.dateData1;
    dateData1.value = e.detail.value;
    var today = $this.getToday();
    today.year = ""+today.year;
    today.month = today.month<10?"0"+today.month:""+today.month;
    today.day = today.day<10?"0"+today.day:""+today.day;
    var months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
    if(dateData1.value[0]==dateData1.years.length-1){
      if(dateData1.value[1]>parseInt(today.month)-1){
        dateData1.value[1] = parseInt(today.month)-1;
      }
    }
    if(dateData1.value[0]<dateData1.years.length-1){
      dateData1.months = months;
    }else{
      var maxIndex = 0;
      var newMonths = [];
      months.forEach(function(item,index){
        if(today.month == item){
          maxIndex = index;
        }
      });
      months.forEach(function(item,index){
        if(index<=maxIndex){
          newMonths.push(item);
        }
      });
      dateData1.months = newMonths;
    }
    dateData1.year = dateData1.years[dateData1.value[0]];
    dateData1.month = dateData1.months[dateData1.value[1]];
    $this.setData({
      dateData1,
    });
  },
  // 保存更改的日期，并获取新日期下的数据
  getCurrentDateData1:function(){
    var $this = this;
    var dateData1 = $this.data.dateData1;
    var selectedDateFont = dateData1.year + "年" + dateData1.month + "月";
    var selectedDateFormat= dateData1.year + "-" + dateData1.month;
    if(selectedDateFormat==""){
      dd.alert({
        title: '提示',
        content: '日期不能为空',
        buttonText: '我知道了',
        success: () => {},
      });
      return false;
    }
    $this.hideDatePicker1();
    $this.setData({
      selectedDateFont,
      selectedDateFormat
    });
    $this.getInitData();
  },
  // 比较两个日期大小，返回两个时间
  compareDate:function(a,b){
    var oDate1 = new Date(a);
    var oDate2 = new Date(b);
    var dateObj = {};
    if(oDate1.getTime() > oDate2.getTime()){
      dateObj.startDate = b;
      dateObj.endDate = a;
    }else{
      dateObj.startDate = a;
      dateObj.endDate = b;
    }
    return dateObj;
  },
  // 获取搜索结果
  getSearchData:function(){
    var $this = this;
    var permissionsData = $this.data.permissionsData;
    var a = $this.data.selectedStartDateFormat;
    var b = $this.data.selectedEndDateFormat;
    var id = $this.data.currentID;
    var isLoading = true;
    var time1 = "";
    var time2 = "";
    if(a!=b){
      var dateObj = $this.compareDate(a,b);
      time1 = dateObj.startDate;
      time2 = dateObj.endDate;
    }else{
      time1 = a;
    }
    var url = "https://www.xuankuangchina.com/Newapi/personsearch";
    dd.showLoading({
      content: '数据加载中...',
    });
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id: id,
        time1:time1,
        time2:time2,
        trendstatus: $this.data.trendstatus
      },
      success: function(res) {
        var userData = res.data.data;
        console.log(userData,"userData01");
        if(userData.userinfo.honor == '0,0,0,0'){
          userData.userinfo.isEmptyHonor = true;
        }else{
          userData.userinfo.isEmptyHonor = false;
        }
        userData.userinfo.teamName=userData.userinfo.termname.split('-')[0];
        userData.userinfo.combineName=userData.userinfo.termname.split('-')[1];
        userData.userinfo.honorList = userData.userinfo.honor.split(',');
        var rankingList = [];
        var currentRankData = {};
        var currentRankList = {};
        var currentTeamID = $this.data.currentTeamID;
        var currentChartData = {}; 
        var currentAreaData = {};
        var dayData = {};
        var monthData = {};
        if(userData.personstatus == 4){
          userData.ranklist.forEach(function(item,index){
            item.teamName = item.name.split('-')[0];
            item.userName = item.name.split('-')[1];
            if(item.id == currentTeamID){
              item.isOn = true;
              currentRankList = item;
              currentAreaData = userData.trend[index];
            }else{
              item.isOn = false;
            }
          });
          if(a==b){
            var itemTeamDayRank = $this.getItemRank(currentRankList.daylist,currentRankList.dayrank,"组内日");
            var itemTeamMonthRank = $this.getItemRank(currentRankList.monthlist,currentRankList.monthrank,"组内月");
            var itemCompanyDayRank = $this.getItemRank(currentRankList.companyday,currentRankList.companyrank,"公司日");
            var itemCompanyMonthRank = $this.getItemRank(currentRankList.companymonth,currentRankList.companymonthrank,"公司月");
            if(itemTeamDayRank.rankList.length>0){
              rankingList.push(itemTeamDayRank);
            }
            if(itemTeamMonthRank.rankList.length>0){
              rankingList.push(itemTeamMonthRank);
            }
            if(itemCompanyDayRank.rankList.length>0){
              rankingList.push(itemCompanyDayRank);
            }
            if(itemCompanyMonthRank.rankList.length>0){
              rankingList.push(itemCompanyMonthRank);
            }
          }else{
            var itemTeamDayRank = $this.getItemRank(currentRankList.daylist,currentRankList.dayrank,"组内阶段");
            var itemCompanyDayRank = $this.getItemRank(currentRankList.monthlist,currentRankList.monthrank,"公司阶段");
            if(itemTeamDayRank.rankList.length>0){
              rankingList.push(itemTeamDayRank);
            }
            if(itemCompanyDayRank.rankList.length>0){
              rankingList.push(itemCompanyDayRank);
            }
          }
          rankingList.forEach(function(item,index){
            if(index == 0){
              item.isOn = true;
              currentRankData.rankList = item.rankList;
              currentRankData.ranking = item.ranking;
            }else{
              item.isOn = false;
            }
          });
          dayData = [currentAreaData.daytrend];
          monthData = [currentAreaData.monthtrend];
          if($this.data.trendstatus == 1){
            currentChartData = $this.getAreaChart(dayData);
          }else{
            currentChartData = $this.getAreaChart(monthData);
          }
        }else{
          if(a==b){
            var itemTeamDayRank = $this.getItemRank(userData.daylist,userData.dayrank,"组内日");
            var itemTeamMonthRank = $this.getItemRank(userData.monthlist,userData.monthrank,"组内月");
            var itemCompanyDayRank = $this.getItemRank(userData.companyday,userData.companyrank,"公司日");
            var itemCompanyMonthRank = $this.getItemRank(userData.companymonth,userData.conpanymonthrank,"公司月");
            if(itemTeamDayRank.rankList.length>0){
              rankingList.push(itemTeamDayRank);
            }
            if(itemTeamMonthRank.rankList.length>0){
              rankingList.push(itemTeamMonthRank);
            }
            if(itemCompanyDayRank.rankList.length>0){
              rankingList.push(itemCompanyDayRank);
            }
            if(itemCompanyMonthRank.rankList.length>0){
              rankingList.push(itemCompanyMonthRank);
            }
          }else{
            var itemTeamDayRank = $this.getItemRank(userData.daylist,userData.dayrank,"组内阶段");
            var itemCompanyDayRank = $this.getItemRank(userData.monthlist,userData.monthrank,"公司阶段");
            if(itemTeamDayRank.rankList.length>0){
              rankingList.push(itemTeamDayRank);
            }
            if(itemCompanyDayRank.rankList.length>0){
              rankingList.push(itemCompanyDayRank);
            }
          }
          rankingList.forEach(function(item,index){
            if(index == 0){
              item.isOn = true;
              currentRankData.rankList = item.rankList;
              currentRankData.ranking = item.ranking;
            }else{
              item.isOn = false;
            }
          });
          dayData = [userData.daytrend];
          monthData = [userData.monthtrend];
          if($this.data.trendstatus == 1){
            currentChartData = $this.getAreaChart(dayData);
          }else{
            currentChartData = $this.getAreaChart(monthData);
          }
          console.log(rankingList,"rankingList01");
        }
        console.log(currentRankData.rankList[0],9999);
        isLoading = false;
        $this.setData({
          rankingList,
          userData,
          isLoading,
          currentRankData,
          currentChartData
        },function(){
          dd.hideLoading();
        });
      },
    });
  },
  // 切换趋势事件
  clickChartType:function(e){
    var $this = this;
    var type = e.currentTarget.dataset.type;
    var chartType = $this.data.chartType;
    var currentChartData = {};
    var trendstatus = 1;
    chartType.forEach(function(item,index){
      if(item.type == type){
        item.isOn = true;
      }else{
        item.isOn = false;
      }
    });
    if(type == 'day'){
      trendstatus = 1;
      currentChartData = $this.getAreaChart($this.data.dayData);
    } else{
      trendstatus = 2;
      currentChartData = $this.getAreaChart($this.data.monthData);
    }
    $this.setData({
      chartType,
      trendstatus,
      currentChartData
    });
  },
  _onTooltipChange(e) {
    var $this = this;
    let item = e.items[0]
    item.value = ''
    var id = $this.data.currentID;
    let index = this.data.currentChartData.categories.findIndex((xvalue) => {
      return xvalue === item.title
    })
    var currentAreaTooltip = [];
    var chartCurrentDate = item.title;
    this.data.currentChartData.series.forEach(function(item){
      var itemTooltip = {}
      if(index != -1){
        itemTooltip.name = item.type.split("-")[0];
        itemTooltip.id = parseInt(item.type.split("-")[1]);
        itemTooltip.uid = parseInt(item.type.split("-")[2]);
        if(itemTooltip.id ==id){
          itemTooltip.isOn = true;
        }else{
          itemTooltip.isOn = false;
        }
        itemTooltip.color = item.color;
        itemTooltip.value = item.data[index] || 0;
        currentAreaTooltip.push(itemTooltip);
      }
    });
    console.log(currentAreaTooltip,"currentAreaTooltip01");
    $this.setData({
      currentAreaTooltip,
      chartCurrentDate
    });
    $this.getCurrentDate(chartCurrentDate,currentAreaTooltip[0].id,currentAreaTooltip[0].uid);
  },
  // 获取图表点击后当前数据的日期
  getCurrentDate:function(data,id,uid){
    var $this = this;
    var url = '';
    var trendstatus= $this.data.trendstatus;
    var currentDate = data;
    $this.setData({
      changeData:{}
    });
    if(trendstatus == 1){
      url = 'https://www.xuankuangchina.com/Newapi/persontrend';
    }else{
      url='https://www.xuankuangchina.com/Newapi/personmonthtrend';
    }
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id: id,
        uid: uid,
        time: currentDate,
      },
      success: function(res) {
        var changeData = res.data.data;
        console.log(changeData,"changeData02");
        if(trendstatus == 1){
          changeData.changeDayNum = Math.abs(changeData.daynumber);
          changeData.changeWeekNum = Math.abs(changeData.weeknumber);
          changeData.changeMonthNum = Math.abs(changeData.chanumber);
          if(changeData.daynumber>0){
            changeData.changeDayFont = "上升";
            changeData.daySort = "asc";
          }else if(changeData.daynumber==0){
            changeData.changeDayFont = "持平";
            changeData.daySort = "equal";
          }else{
            changeData.changeDayFont = "下降";
            changeData.daySort = "des";
          }
          if(changeData.weeknumber>0){
            changeData.changeWeekFont = "上升";
            changeData.weekSort = "asc";
          }else if(changeData.weeknumber==0){
            changeData.changeWeekFont = "持平";
            changeData.weekSort = "equal";
          }else{
            changeData.changeWeekFont = "下降";
            changeData.weekSort = "des";
          }
          if(changeData.chanumber>0){
            changeData.changeMonthFont = "上升";
            changeData.monthSort = "asc";
          }else if(changeData.chanumber==0){
            changeData.changeMonthFont = "与上月持平";
            changeData.monthSort = "equal";
          }else{
            changeData.changeMonthFont = "下降";
            changeData.monthSort = "des";
          }
        }else{
          changeData.changeMonthNum = Math.abs(changeData.monthnumber);
          if(changeData.monthnumber>0){
            changeData.changeMonthFont = "上升";
            changeData.monthSort = "asc";
          }else if(changeData.monthnumber==0){
            changeData.changeMonthFont = "持平";
            changeData.monthSort = "equal";
          }else{
            changeData.changeMonthFont = "下降";
            changeData.monthSort = "des";
          }
        }
        $this.setData({
          changeData
        });
      },
    });
  },
  // 面积图表数据整理
  getAreaChart:function(data){
    var dataArea= {};
    dataArea.categories = [];
    dataArea.series = [];
    dataArea.xAxis={
      tickCount: 5
    }
    dataArea.yAxis={
      tickCount: 5
    }
    dataArea.legend ={
      position:"top",
      offsetY:5
    }
    dataArea.tooltip={
      showTitle: true,
      showCrosshairs:true,
      def_item:{
        key:"",
        value:""
      }
    }
    if(data.length>0){
      data.forEach(function(item,index){
        if(item.length>0){
          var itemSeries = {};
          itemSeries.type = item[0].name+"-"+item[0].id+'-'+item[0].uid;
          itemSeries.style = "smooth";
          if(index ==0){ // ["#00c191","#14bff0","#fe9b00","#2776fa","#f70000"]
            itemSeries.color = "#00c191";
          }else if(index ==1){
            itemSeries.color = "#14bff0";
          }else if(index ==2){
            itemSeries.color = "#fe9b00";
          }else if(index ==3){
            itemSeries.color = "#2776fa";
          }else if(index ==4){
            itemSeries.color = "#f70000";
          }
          itemSeries.data = [];
          item.forEach(function(item1,index1){
            if(index == 0){
              dataArea.categories.push(item1.addtime);
            }
            itemSeries.data.push(parseInt(item1.number));
          });
          dataArea.series.push(itemSeries);
        }
      });
    }
    console.log(dataArea,"dataArea01");
    return dataArea;
  },
  //选择组别
  selectedTeam:function(e){
    var $this = this;
    var tagName = e.currentTarget.dataset.name;
    var isSubShow = $this.data.isSubShow;
    var userList = $this.data.userList;
    var currentUserList = $this.data.currentUserList;
    var currentSubData = [];
    var currentParentName = "";
    var currentTeamName = "";
    if(tagName=="中文组"||tagName=="英文组"||tagName=="技术团队"||tagName=="其他"){
      isSubShow = true;
      userList.forEach(function(item,index){
        if(item.nameFont == tagName){
          item.isOn = true;
          currentSubData = item;
        }else{
          item.isOn = false;
          item.name = item.nameFont;
        }
      });
    }else{
      userList.forEach(function(item,index){
        item.name = item.nameFont;
        if(item.nameFont == tagName){
          item.isOn = true;
          currentUserList = item.dgroup;
          currentTeamName = tagName;
        }else{
          item.isOn = false;
        }
      });
    }
    
    $this.setData({
      currentParentName,
      currentTeamName,
      userList,
      isSubShow,
      currentSubData,
      currentUserList
    });
  },
  // 隐藏子组弹窗
  hideSubDialog:function(){
    this.setData({
      isSubShow:false
    });
  },
  // 子组别点击事件
  subTeamClick:function(e){
    var $this = this;
    var id = e.currentTarget.dataset.id;
    var currentUserList = [];
    var currentTeamName = "";
    var currentParentName = "";
    var currentSubData = $this.data.currentSubData;
    var userList = $this.data.userList;
    currentSubData.dgroup.forEach(function(item,index){
      if(item.id == id){
        currentUserList.push(item);
        currentTeamName = item.groupname;
      }
    });
    userList.forEach(function(item,index){
      if(item.nameFont == currentSubData.nameFont){
        item.name = currentTeamName;
        currentParentName = item.nameFont;
      }
    });
    $this.setData({
      currentParentName,
      currentTeamName,
      currentUserList,
      userList
    });
    $this.hideSubDialog();
  },
  // 获取初始化数据
  getInitData:function(){
    var $this = this;
    var url = "";
    var permissionsData = $this.data.permissionsData;
    var id = $this.data.currentID;
    var currentName = $this.data.currentName;
    var isList = $this.data.isList;
    var isCanEdit = false;
    var isLoading = true;
    var currentDate = "";
    var currentParentName = $this.data.currentParentName;
    var currentTeamName = $this.data.currentTeamName;
    if(isList){
      url = 'https://www.xuankuangchina.com/Newapi/maincenter';
      currentDate = $this.data.selectedDateFormat;
    }else{
      url = 'https://www.xuankuangchina.com/Newapi/userinfo';
      currentDate = $this.data.selectedStartDateFormat;
    }
    dd.showLoading({
      content: '数据加载中...',
    });
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id: id,
        name:currentName,
        trendstatus:$this.data.trendstatus,
        time:currentDate
      },
      dataType: 'json',
      success: function(res) { console.log(res,'res个人中心')
        if(isList){
          var userList = [];
          var allList = {};
          allList.dgroup = [];
          allList.name = "全部"
          res.data.data.forEach(function(item,index){
            item.dgroup.forEach(function(items,indexs){
              items.group.forEach(function(item1){
                item1.userName = item1.name.split('-')[1];
                item1.teamName = item1.name.split('-')[0];
                if(item1.user.length>0){
                  item1.user.forEach(function(item2){
                    item2.rankAbs = Math.abs(item2.rankcha);
                    if(item2.rankcha>0){
                      item2.rankFont = "des";
                    }else if(item2.rankcha<0){
                      item2.rankFont = "asc";
                    }else{
                      item2.rankFont = "equ";
                    }
                  });
                }
              });
              allList.dgroup.push(items);
            });
          });
                console.log(allList,"allList");
          userList.push(allList)
                console.log(userList,"userList");
          res.data.data.forEach(function(item,index){
            userList.push(item);
          });
          var currentUserList = [];
          if(currentTeamName==""){
            userList.forEach(function(item,index){
              item.nameFont = item.name;
              if(index==0){
                item.isOn = true;
                currentUserList = item.dgroup;
                console.log(currentUserList,"currentUserList01");
              }else{
                item.isOn = false;
              }
            });
          }else{
            if(currentParentName==""){
              userList.forEach(function(item,index){
                item.nameFont = item.name;
                if(item.nameFont == currentTeamName){
                  item.isOn = true;
                  currentUserList = item.dgroup;
                }else{
                  item.isOn = false;
                }
              });
            }else{
              userList.forEach(function(item,index){
                item.nameFont = item.name;
                if(item.nameFont == currentParentName){
                  item.isOn = true;
                  item.name = currentTeamName;
                  item.dgroup.forEach(function(items,indexs){
                    if(items.groupname == currentTeamName){
                      currentUserList.push(items);
                    }
                  });
                }else{
                  item.isOn = false;
                }
              });
            }
          }
          console.log(userList,"userList01");
          isLoading = false;
          $this.setData({
            currentUserList,
            userList,
            isLoading,
          },function(){
            dd.hideLoading();
            // $this.getModuleInfo();
          });
        }else{
          var userData = res.data.data;
          console.log(userData,"userData02");
          if(permissionsData.id == id){
            isCanEdit = true;
          }else{
            isCanEdit = false;
          }
          if(userData.userinfo.honor == '0,0,0,0'){
            userData.userinfo.isEmptyHonor = true;
          }else{
            userData.userinfo.isEmptyHonor = false;
          }
          userData.userinfo.teamName=userData.userinfo.termname.split('-')[0];
          userData.userinfo.combineName=userData.userinfo.termname.split('-')[1];
          userData.userinfo.honorList = userData.userinfo.honor.split(',');
          var rankingList = [];
          var currentRankData = {};
          var currentRankList = {};
          var currentAreaData = {};
          var currentTeamID = $this.data.currentTeamID;
          var currentChartData = {}; 
          var dayData = {};
          var monthData = {};
          if(userData.personstatus == 4){
            userData.ranklist.forEach(function(item,index){
              item.teamName = item.name.split('-')[0];
              item.userName = item.name.split('-')[1];
              if(item.id == currentTeamID){
                item.isOn = true;
                currentRankList = item;
                currentAreaData = userData.trend[index];
              }else{
                item.isOn = false;
              }
            });
            var itemTeamDayRank = $this.getItemRank(currentRankList.daylist,currentRankList.dayrank,"组内日");
            var itemTeamMonthRank = $this.getItemRank(currentRankList.monthlist,currentRankList.monthrank,"组内月");
            var itemCompanyDayRank = $this.getItemRank(currentRankList.companyday,currentRankList.companyrank,"公司日");
            var itemCompanyMonthRank = $this.getItemRank(currentRankList.companymonth,currentRankList.companymonthrank,"公司月");
            if(itemTeamDayRank.rankList.length>0){
              rankingList.push(itemTeamDayRank);
            }
            if(itemTeamMonthRank.rankList.length>0){
              rankingList.push(itemTeamMonthRank);
            }
            if(itemCompanyDayRank.rankList.length>0){
              rankingList.push(itemCompanyDayRank);
            }
            if(itemCompanyMonthRank.rankList.length>0){
              rankingList.push(itemCompanyMonthRank);
            }
            rankingList.forEach(function(item,index){
              if(index == 0){
                item.isOn = true;
                currentRankData.rankList = item.rankList;
                currentRankData.ranking = item.ranking;
              }else{
                item.isOn = false;
              }
            });
            dayData = [currentAreaData.daytrend];
            monthData = [currentAreaData.monthtrend];
            if($this.data.trendstatus == 1){
              currentChartData = $this.getAreaChart(dayData);
            }else{
              currentChartData = $this.getAreaChart(monthData);
            }
          }else{
            var itemTeamDayRank = $this.getItemRank(userData.daylist,userData.dayrank,"组内日");
            var itemTeamMonthRank = $this.getItemRank(userData.monthlist,userData.monthrank,"组内月");
            var itemCompanyDayRank = $this.getItemRank(userData.companyday,userData.companyrank,"公司日");
            var itemCompanyMonthRank = $this.getItemRank(userData.companymonth,userData.conpanymonthrank,"公司月");
            if(itemTeamDayRank.rankList.length>0){
              rankingList.push(itemTeamDayRank);
            }
            if(itemTeamMonthRank.rankList.length>0){
              rankingList.push(itemTeamMonthRank);
            }
            if(itemCompanyDayRank.rankList.length>0){
              rankingList.push(itemCompanyDayRank);
            }
            if(itemCompanyMonthRank.rankList.length>0){
              rankingList.push(itemCompanyMonthRank);
            }
            rankingList.forEach(function(item,index){
              if(index == 0){
                item.isOn = true;
                currentRankData.rankList = item.rankList;
                currentRankData.ranking = item.ranking;
              }else{
                item.isOn = false;
              }
            });
            dayData = [userData.daytrend];
            monthData = [userData.monthtrend];
            if($this.data.trendstatus == 1){
              currentChartData = $this.getAreaChart(dayData);
            }else{
              currentChartData = $this.getAreaChart(monthData);
            }
          }
          console.log(rankingList,"rankingList02");
          isLoading = false;
          $this.setData({
            rankingList,
            isCanEdit,
            userData,
            isLoading,
            currentRankData,
            dayData,
            monthData,
            currentChartData,
          },function(){
            dd.hideLoading();
          });
        }
      },
      fail:function(err){
        console.log(err);
      }
    });
  },
  // 获取每个模块的css属性信息
  getModuleInfo:function(){
    var $this = this;
    var modules = {
      moduleInfo:{},
      moduleTop:{}
    };
    let query = dd.createSelectorQuery();
    query.select('#fixedNav').boundingClientRect()
    .select("#fixedLink").boundingClientRect()
    .select('#fixedScroll').boundingClientRect()
    .select("#group-1").boundingClientRect()
    .select("#group-2").boundingClientRect()
    .select("#group-3").boundingClientRect()
    .select("#group-4").boundingClientRect()
    .select("#group-5").boundingClientRect()
    .select("#group-7").boundingClientRect()
    .select("#group-8").boundingClientRect()
    .select("#group-9").boundingClientRect()
    .select("#group-10").boundingClientRect()
    .select("#group-11").boundingClientRect()
    .select("#group-12").boundingClientRect()
    .select("#group-13").boundingClientRect()
    .select("#group-14").boundingClientRect()
    .select("#scroll-1").boundingClientRect()
    .select("#scroll-2").boundingClientRect()
    .select("#scroll-3").boundingClientRect()
    .select("#scroll-4").boundingClientRect()
    .select("#scroll-5").boundingClientRect()
    .select("#scroll-7").boundingClientRect()
    .select("#scroll-8").boundingClientRect()
    .select("#scroll-9").boundingClientRect()
    .select("#scroll-10").boundingClientRect()
    .select("#scroll-11").boundingClientRect()
    .select("#scroll-12").boundingClientRect()
    .select("#scroll-13").boundingClientRect()
    .select("#scroll-14").boundingClientRect().exec((rect)=>{
      modules.moduleInfo.module1 = rect[0];
      modules.moduleInfo.module2 = rect[1];
      modules.moduleInfo.module3 = rect[2];
      modules.moduleInfo.module4 = rect[3];
      modules.moduleInfo.module5 = rect[4];
      modules.moduleInfo.module6 = rect[5];
      modules.moduleInfo.module7 = rect[6];
      modules.moduleInfo.module8 = rect[7];
      modules.moduleInfo.module9 = rect[8];
      modules.moduleInfo.module10 = rect[9];
      modules.moduleInfo.module11 = rect[10];
      modules.moduleInfo.module12 = rect[11];
      modules.moduleInfo.module13 = rect[12];
      modules.moduleInfo.module14 = rect[13];
      modules.moduleInfo.module15 = rect[14];
      modules.moduleInfo.module16 = rect[15];
      modules.moduleInfo.module17 = rect[16];
      modules.moduleInfo.module18 = rect[17];
      modules.moduleInfo.module19 = rect[18];
      modules.moduleInfo.module20 = rect[19];
      modules.moduleInfo.module21 = rect[20];
      modules.moduleInfo.module22 = rect[21];
      modules.moduleInfo.module23 = rect[22];
      modules.moduleInfo.module24 = rect[23];
      modules.moduleInfo.module25 = rect[24];
      modules.moduleInfo.module26 = rect[25];
      modules.moduleInfo.module27 = rect[26];
      modules.moduleInfo.module28 = rect[27];
      modules.moduleInfo.module29 = rect[28];
      modules.moduleTop.module1 = 0;
      modules.moduleTop.module2 = 0;
      modules.moduleTop.module3 = modules.moduleInfo.module1.height;
      if(!modules.moduleInfo.module4){
        modules.moduleInfo.module4= {};
        modules.moduleInfo.module4.height = 0;
      }
      if(!modules.moduleInfo.module5){
        modules.moduleInfo.module5= {};
        modules.moduleInfo.module5.height = 0;
      }
      if(!modules.moduleInfo.module6){
        modules.moduleInfo.module6= {};
        modules.moduleInfo.module6.height = 0;
      }
      if(!modules.moduleInfo.module7){
        modules.moduleInfo.module7= {};
        modules.moduleInfo.module7.height = 0;
      }
      if(!modules.moduleInfo.module8){
        modules.moduleInfo.module8= {};
        modules.moduleInfo.module8.height = 0;
      }
      if(!modules.moduleInfo.module9){
        modules.moduleInfo.module9= {};
        modules.moduleInfo.module9.height = 0;
      }
      if(!modules.moduleInfo.module10){
        modules.moduleInfo.module10= {};
        modules.moduleInfo.module10.height = 0;
      }
      if(!modules.moduleInfo.module11){
        modules.moduleInfo.module11= {};
        modules.moduleInfo.module11.height = 0;
      }
      if(!modules.moduleInfo.module12){
        modules.moduleInfo.module12= {};
        modules.moduleInfo.module12.height = 0;
      }
      if(!modules.moduleInfo.module13){
        modules.moduleInfo.module13= {};
        modules.moduleInfo.module13.height = 0;
      }
      if(!modules.moduleInfo.module14){
        modules.moduleInfo.module14= {};
        modules.moduleInfo.module14.height = 0;
      }
      if(!modules.moduleInfo.module15){
        modules.moduleInfo.module15= {};
        modules.moduleInfo.module15.height = 0;
      }
      if(!modules.moduleInfo.module16){
        modules.moduleInfo.module16= {};
        modules.moduleInfo.module16.height = 0;
      }
      modules.moduleTop.module4 = modules.moduleInfo.module1.height+modules.moduleInfo.module3.height;
      modules.moduleTop.module5 = modules.moduleTop.module4+modules.moduleInfo.module4.height;
      modules.moduleTop.module6 = modules.moduleTop.module5+modules.moduleInfo.module5.height;
      modules.moduleTop.module7 = modules.moduleTop.module6+modules.moduleInfo.module6.height;
      modules.moduleTop.module8 = modules.moduleTop.module7+modules.moduleInfo.module7.height;
      modules.moduleTop.module9 = modules.moduleTop.module8+modules.moduleInfo.module8.height;
      modules.moduleTop.module10 = modules.moduleTop.module9+modules.moduleInfo.module9.height;
      modules.moduleTop.module11 = modules.moduleTop.module10+modules.moduleInfo.module10.height;
      modules.moduleTop.module12 = modules.moduleTop.module11+modules.moduleInfo.module11.height;
      modules.moduleTop.module13 = modules.moduleTop.module12+modules.moduleInfo.module12.height;
      modules.moduleTop.module14 = modules.moduleTop.module13+modules.moduleInfo.module13.height;
      modules.moduleTop.module15 = modules.moduleTop.module14+modules.moduleInfo.module14.height;
      modules.moduleTop.module16 = modules.moduleTop.module15+modules.moduleInfo.module15.height;
      $this.setData({
        modules
      });
      console.log(modules,"modules02");
    });
  },// 监听页面滚动事件
  onPageScroll(e) {
    var $this = this;
    var isAbs = false;
    var isFixedMenu = false;
    var isTeamFixed = false;
    var modules = $this.data.modules;
    var userList = $this.data.userList;
    var isList=$this.data.isList;
    var scrollTop = e.scrollTop;
    var currentScrollTeamID= "";
    var scrollLeft = 0;
    if(isList){
      if(scrollTop > 0){
        isAbs = true;
        //isFixedMenu = true;
      }else{
        isAbs = false;
        //isFixedMenu = false;
      }
      // if(scrollTop > modules.moduleTop.module4-modules.moduleInfo.module3.height){
      //   isTeamFixed = true;
      // }else{
      //   isTeamFixed = false;
      // }
      // if(isFixedMenu){
      //   userList.forEach(function(item,index){
      //     if(modules.moduleInfo.module4 && modules.moduleInfo.module4.height > 0 && scrollTop > modules.moduleTop.module4-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 1){
      //         scrollLeft = 0;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module5 && modules.moduleInfo.module5.height > 0 && scrollTop > modules.moduleTop.module5-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 2){
      //         scrollLeft = modules.moduleInfo.module18.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module6 && modules.moduleInfo.module6.height > 0 && scrollTop > modules.moduleTop.module6-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 3){
      //         scrollLeft = modules.moduleInfo.module19.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module7 && modules.moduleInfo.module7.height > 0 && scrollTop > modules.moduleTop.module7-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 4){
      //         scrollLeft = modules.moduleInfo.module20.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module8 && modules.moduleInfo.module8.height > 0 && scrollTop > modules.moduleTop.module8-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 5){
      //         scrollLeft = modules.moduleInfo.module21.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module9 && modules.moduleInfo.module9.height > 0 && scrollTop > modules.moduleTop.module9-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 7){
      //         scrollLeft = modules.moduleInfo.module22.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module10 && modules.moduleInfo.module10.height > 0 && scrollTop > modules.moduleTop.module10-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 8){
      //         scrollLeft = modules.moduleInfo.module23.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module11 && modules.moduleInfo.module11.height > 0 && scrollTop > modules.moduleTop.module11-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 9){
      //         scrollLeft = modules.moduleInfo.module24.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module12 && modules.moduleInfo.module12.height > 0 && scrollTop > modules.moduleTop.module12-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 10){
      //         scrollLeft = modules.moduleInfo.module25.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module13 && modules.moduleInfo.module13.height > 0 && scrollTop > modules.moduleTop.module13-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 11){
      //         scrollLeft = modules.moduleInfo.module26.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module14 && modules.moduleInfo.module14.height > 0 && scrollTop > modules.moduleTop.module14-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 12){
      //         scrollLeft = modules.moduleInfo.module27.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module15 && modules.moduleInfo.module15.height > 0 && scrollTop > modules.moduleTop.module15-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 13){
      //         scrollLeft = modules.moduleInfo.module28.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //     if(modules.moduleInfo.module16 && modules.moduleInfo.module16.height > 0 && scrollTop > modules.moduleTop.module16-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height-10){
      //       if(item.id == 14){
      //         scrollLeft = modules.moduleInfo.module29.left-modules.moduleInfo.module17.left;
      //         item.isOn = true;
      //       }else{
      //         item.isOn = false;
      //       }
      //     }
      //   });
      //   $this.setData({
      //     scrollLeft,
      //     userList,
      //   });
      // }
      $this.setData({
        isAbs,
        // isFixedMenu,
        // isTeamFixed,
        scrollTop
      });
    }
  },
  // 分组点击跳转到页面相应位置事件
  scrollToPage:function(e){
    var $this = this;
    var id = parseInt(e.currentTarget.dataset.id);
    $this.getModuleInfo();
    var userList = $this.data.userList;
    userList.forEach(function(item,index){
      if(item.id == id && !item.isOn){
        item.isOn = true;
      }else{
        item.isOn = false;
      }
    });
    var isFixedMenu = true;
    var isTeamFixed = true;
    $this.setData({
      userList,
      isFixedMenu,
      isTeamFixed
    });
    $this.scrollToDown(id);
  },
  scrollToDown:function(id){
    var $this = this;
    var modules = $this.data.modules;
    if(id == 1){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module4-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 2){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module5-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 3){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module6-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 4){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module7-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 5){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module8-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 7){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module9-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 8){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module10-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 9){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module11-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 10){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module12-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 11){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module13-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 12){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module14-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 13){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module15-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }else if(id == 14){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module16-modules.moduleInfo.module3.height-modules.moduleInfo.module2.height
      });
    }
  },
  // 跳转到成绩中心页面
  goToTeam:function(e){
    dd.navigateTo({
      url: '../team/team'
    });
  },
  // 跳转到任务目标页面
  goToGourp:function(e){
    dd.navigateTo({
      url: '../index/index'
    });
  },
  // 主管点组员跳转组员个人中心
  goToDetail:function(e){
    console.log(e,'主管点组员跳转组员个人中心')
    var $this = this;
    var id = parseInt(e.currentTarget.dataset.id);
    var currentTeamID = parseInt(e.currentTarget.dataset.team);
    var currentName = e.currentTarget.dataset.name
    var isList = false;
    var currentDay = $this.getToday();
    var month = currentDay.month<10?"0"+currentDay.month:currentDay.month;
    var day = currentDay.day<10?"0"+currentDay.day:currentDay.day;
    var selectedStartDateFormat = currentDay.year+'-'+month+'-'+day;
    var selectedEndDateFormat = currentDay.year+'-'+month+'-'+day;
    var selectedDate = $this.data.selectedDate;
    selectedDate.startDate = selectedDate.endDate = selectedStartDateFormat;
    var dateData = $this.initDate(currentDay);
    var chartType = $this.data.chartType;
    var trendstatus = 1;
    chartType.forEach(function(item,index){
      if(item.type == 'day'){
        item.isOn = true;
      }else{
        item.isOn = false;
      }
    });
    $this.setData({
      isList,
      currentID:id,
      chartType,
      trendstatus,
      selectedStartDateFormat,
      selectedEndDateFormat,
      selectedDate,
      dateData,
      currentTeamID,
      currentName
    },function(){
      dd.pageScrollTo({
        scrollTop: 0
      })
      $this.getInitData();
    });
  },
  // 获取今天得年月日
  getToday:function(){
    var $this = this;
    var todayDate = new Date();
    var todayYear = todayDate.getFullYear();
    var todayMonth = todayDate.getMonth()+1;
    var todayDay = todayDate.getDate();
    var today = {
      year:todayYear,
      month:todayMonth,
      day:todayDay
    };
    return today;
  },
  // 获取昨天的年月日
  getYesterday:function(){
    var $this = this;
    var today = new Date();
    var yesterdayDate = today.getTime() - 24* 60 * 60 * 1000;
    yesterdayDate = new Date(yesterdayDate);
    var yesterdayYear = yesterdayDate.getFullYear();
    var yesterdayMonth = yesterdayDate.getMonth()+1;
    var yesterdayDay = yesterdayDate.getDate();
    var yesterday = {
      year:yesterdayYear,
      month:yesterdayMonth,
      day:yesterdayDay
    };
    return yesterday;
  },
  // 展示时间选择器弹窗
  showDatePicker1:function(){
    console.log(1111);
    var $this = this;
    var datePicker1 = $this.data.datePicker1;
    datePicker1.isShow = true;
    $this.setData({
      datePicker1
    });
    // 创建动画实例
    var animation = dd.createAnimation({
      duration: 400,//动画的持续时间
      timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    $this.animation = animation; //将animation变量赋值给当前动画
    var time = setTimeout(function () {
      $this.fideIn1();
      $this.slideIn1();//调用动画--滑入
      clearTimeout(time);
      time = null;
    }, 100)
    console.log(4444);
  },
  // 隐藏时间选择器弹窗
  hideDatePicker1:function(){
    console.log(2222);
    var $this = this;
    var datePicker1 = $this.data.datePicker1;
    var animation = dd.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    $this.animation = animation
    $this.slideDown1();//调用动画--滑出
    $this.fideOut1();
    var time = setTimeout(function () {
      datePicker1.isShow = false;
      $this.setData({
        datePicker1
      });
      clearTimeout(time);
      time = null;
    }, 300)//先执行下滑动画，再隐藏模块
    console.log(3333);
  },
  // 展示时间选择器弹窗
  showDatePicker:function(){
    var $this = this;
    var datePicker = $this.data.datePicker;
    datePicker.isShow = true;
    $this.setData({
      datePicker
    });
    // 创建动画实例
    var animation = dd.createAnimation({
      duration: 400,//动画的持续时间
      timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    $this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      $this.fideIn();
      $this.slideIn();//调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },
  // 隐藏时间选择器弹窗
  hideDatePicker:function(){
    var $this = this;
    var datePicker = $this.data.datePicker;
    var animation = dd.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    $this.animation = animation
    $this.slideDown();//调用动画--滑出
    $this.fideOut();
    var time1 = setTimeout(function () {
      datePicker.isShow = false;
      $this.setData({
        datePicker
      });
      clearTimeout(time1);
      time1 = null;
    }, 300)//先执行下滑动画，再隐藏模块
  },
  // 动画 -- 渐入
  fideIn:function(){
    var $this = this;
    $this.animation.opacity(.5).step() // 在y轴偏移，然后用step()完成一个动画
    var datePicker = $this.data.datePicker;
    datePicker.animationInfo = $this.animation.export();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      datePicker
    })
  },
  // 动画 -- 渐出
  fideOut:function(){
    var $this = this;
    $this.animation.opacity(0).step() // 在y轴偏移，然后用step()完成一个动画
    var datePicker = $this.data.datePicker;
    datePicker.animationInfo = $this.animation.export();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      datePicker
    })
  },
   //动画 -- 滑入
  slideIn: function () {
    var $this = this;
    $this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    var datePicker = $this.data.datePicker;
    datePicker.animationData = $this.animation.export();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      datePicker
    })
  },
  //动画 -- 滑出
  slideDown: function () {
    var $this = this;
    $this.animation.translateY(300).step()
    var datePicker = $this.data.datePicker;
    datePicker.animationData = $this.animation.export();
    this.setData({
      datePicker
    })
  },
  // 动画 -- 渐入
  fideIn1:function(){
    var $this = this;
    $this.animation.opacity(.5).step() // 在y轴偏移，然后用step()完成一个动画
    var datePicker1 = $this.data.datePicker;
    datePicker1.animationInfo = $this.animation.export();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      datePicker1
    })
  },
  // 动画 -- 渐出
  fideOut1:function(){
    var $this = this;
    $this.animation.opacity(0).step() // 在y轴偏移，然后用step()完成一个动画
    var datePicker1 = $this.data.datePicker;
    datePicker1.animationInfo = $this.animation.export();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      datePicker1
    })
  },
   //动画 -- 滑入
  slideIn1: function () {
    var $this = this;
    $this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    var datePicker1 = $this.data.datePicker;
    datePicker1.animationData = $this.animation.export();
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      datePicker1
    })
  },
  //动画 -- 滑出
  slideDown1: function () {
    var $this = this;
    $this.animation.translateY(300).step()
    var datePicker1 = $this.data.datePicker;
    datePicker1.animationData = $this.animation.export();
    this.setData({
      datePicker1
    })
  },
});
