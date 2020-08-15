Page({
  data: {
    selectedStartDate:'',
    selectedStartDateFormat:'',
    selectedEndDate:'',
    selectedEndDateFormat:'',
    datePicker:{
      isShow:false,
      animationData:{},
      animationInfo:{}
    },
    dateData:{},
    dateData1:{},
    pageType:'combine',
    currentID:"",
    isLoading:true,
    lang:'',
    title:'',
    initData:{},
    trendstatus:1,
    chartType:[
      {name:'日趋势',type:'day',isOn:true},
      {name:'月趋势',type:'month',isOn:false},
    ],
    changeData:{},
    dayData:[],
    monthData:[],
    currentChartData:{},
    timeType:{
      isMonth:true,
      typeFont:"按月选择"
    },
    dateType:'start',
    isDelete:false,
    selectedDate:{
      monthDate:'',
      startDate:'',
      endDate:'',
    },
    permissionsData:{},
    waterMark:{},
    currentBrand:''
  },
  onLoad(query) {
    var $this = this;
    $this.hideDatePicker();
    var currentID = parseInt(query.id);
    var today = $this.getToday();
    var todayMonth = today.month<10?('0'+today.month): (""+today.month);
    var todayDay = today.day<10?("0"+today.day):(""+today.day);
    var selectedStartDate = "";
    var selectedEndDate = "";
    var selectedStartDateFormat = query.date;
    var selectedEndDateFormat = query.date;
    var selectedDate = $this.data.selectedDate;
    var dateType = $this.data.dateType;
    var timeType = $this.data.timeType;
    var dateData = {};
    var dateData1 = {};
    var chartType = $this.data.chartType;
    var trendstatus = 1;
    var waterMark = {};
    var currentBrand = "";
    if(currentID == 16&&query.pageType == "combine"){
      currentBrand = query.brand;
    }
    chartType.forEach(function(item,index){
      if(item.type == 'day'){
        item.isOn = true;
      }else{
        item.isOn = false;
      }
    });
    if(query.pageType == "combine"){
      selectedDate.monthDate = query.date;
      selectedDate.startDate = today.year+'-'+todayMonth+'-'+todayDay;
      selectedStartDate = selectedEndDate = query.date.split("-")[0]+"年"+parseInt(query.date.split("-")[1])+"月";
      var monthDate= {
        year: parseInt(query.date.split("-")[0]),
        month: parseInt(query.date.split("-")[1])
      }
      dateData = $this.initDate(monthDate);
      dateData1 = $this.initDate1(today);
    }else{
      selectedDate.startDate = selectedDate.endDate = query.date;
      selectedStartDate = selectedEndDate = query.date.split("-")[0]+"年"+parseInt(query.date.split("-")[1])+"月"+parseInt(query.date.split("-")[2])+"日";
      dateType= "end";
      timeType.isMonth = false;
      timeType.typeFont = "按日选择";
      var monthDate={
        year: parseInt(query.date.split("-")[0]),
        month:parseInt(query.date.split("-")[1])
      }
      var dayDate={
        year: parseInt(query.date.split("-")[0]),
        month:parseInt(query.date.split("-")[1]),
        day:parseInt(query.date.split("-")[2])
      }
      dateData = $this.initDate(monthDate);
      dateData1 = $this.initDate1(dayDate);
    }
    var permissionsData = {};
    dd.getStorage({
      key: 'permissionsData',
      success: function(res) {
        permissionsData = res.data;
        console.log(permissionsData,"permissionsData");
        dd.getStorage({
          key: 'waterMark',
          success: function(res) {
            waterMark = res.data;
            console.log(waterMark,"waterMark");
            $this.setData({
              currentBrand,
              waterMark,
              selectedDate,
              dateData,
              dateData1,
              dateType,
              timeType,
              currentID,
              lang:query.lang,
              pageType:query.pageType,
              selectedStartDate,
              selectedEndDate,
              selectedStartDateFormat,
              selectedEndDateFormat,
              permissionsData,
              chartType,
              trendstatus
            },function(){
              $this.getInitData();
            });
          },
          fail: function(res){
            console.log(res,"res02");
          }
        });
      },
      fail: function(res){
        console.log(res,"res03");
      }
    });
  },
  onUnload() {
    console.log(3333);
    // 页面被关闭
  },
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
  // 切换时间选择类型
  changeTimeType:function(){
    var $this = this;
    var timeType = $this.data.timeType;
    timeType.isMonth = !timeType.isMonth;
    var dateType = "start";
    if(timeType.isMonth){
      timeType.typeFont = "按月选择";
    }else{
      timeType.typeFont = "按日选择";
    }
    $this.setData({
      timeType,
      dateType
    });
  },
  selectedDate:function(e){
    var $this = this;
    var type = e.currentTarget.dataset.type;
    var isMonth = $this.data.timeType.isMonth;
    var dateData = $this.data.dateData;
    var dateData1 = $this.data.dateData1;
    var selectedDate = $this.data.selectedDate;
    var today = $this.getToday();
    if(isMonth){
      if(selectedDate.monthDate == ""){
        selectedDate.monthDate = dateData.year+'-'+dateData.month;
      }else{
        var dateObj = {};
        dateObj.year = parseInt(selectedDate.monthDate.split('-')[0]);
        dateObj.month = parseInt(selectedDate.monthDate.split('-')[1]);
        dateData = $this.initDate(dateObj);
        dateData1 = $this.initDate(today);
      }
    }else{
      if(type=="start"){
        if(selectedDate.startDate == ""){
          selectedDate.startDate = dateData1.year+'-'+dateData1.month+'-'+dateData1.day;
        }else{
          var dateObj = {};
          dateObj.year = parseInt(selectedDate.startDate.split('-')[0]);
          dateObj.month = parseInt(selectedDate.startDate.split('-')[1]);
          dateObj.day = parseInt(selectedDate.startDate.split('-')[2]);
          dateData = $this.initDate(dateObj);
          dateData1 = $this.initDate(dateObj);
        }
      }else{
        if(selectedDate.endDate == ""){
          selectedDate.endDate = dateData1.year+'-'+dateData1.month+'-'+dateData1.day;
        }else{
          var dateObj = {};
          dateObj.year = parseInt(selectedDate.endDate.split('-')[0]);
          dateObj.month = parseInt(selectedDate.endDate.split('-')[1]);
          dateObj.day = parseInt(selectedDate.endDate.split('-')[2]);
          dateData = $this.initDate(dateObj);
          dateData1 = $this.initDate(dateObj);
        }
      }
    }
    $this.setData({
      isDelete:false,
      dateType:type,
      selectedDate,
      dateData,
      dateData1
    });
  },
  deleteDate:function(){
    var $this = this;
    var timeType = $this.data.timeType;
    var selectedDate = $this.data.selectedDate;
    var today = $this.getToday();
    var dateData = $this.initDate(today);
    var dateData1 = $this.initDate1(today);
    if(timeType.isMonth){
      selectedDate.monthDate = '';
    }else{
      selectedDate.startDate = '';
      selectedDate.endDate = '';
    }
    
    $this.setData({
      isDelete:true,
      selectedDate,
      dateType:'',
      dateData,
      dateData1,
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
    var isMonth = $this.data.timeType.isMonth;
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
    selectedDate.monthDate = dateData.year+'-'+dateData.month;
    $this.setData({
      dateData,
      selectedDate
    });
  },
  // 日历变更时的监听事件
  datePickerChange1:function(e){
    var $this = this;
    var dateData1 = $this.data.dateData1;
    var isMonth = $this.data.timeType.isMonth;
    var dateType = $this.data.dateType;
    var selectedDate = $this.data.selectedDate;
    var today = $this.getToday();
    today.year = ""+today.year;
    today.month = today.month<10?"0"+today.month:""+today.month;
    today.day = today.day<10?"0"+today.day:""+today.day;
    var months = ["01","02","03","04","05","06","07","08","09","10","11","12"];
    var currentDay = [];
    dateData1.value = e.detail.value;
    currentDay = $this.getCurrentMonthDays(parseInt(dateData1.years[dateData1.value[0]]),parseInt(dateData1.months[dateData1.value[1]]));
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
    if(dateData1.value[0]==dateData1.years.length-1){
      if(dateData1.value[1]>parseInt(today.month)-1){
        dateData1.value[1] = parseInt(today.month)-1;
      }
      if(dateData1.value[1]==parseInt(today.month)-1&& dateData1.value[2]>parseInt(today.day)-1){
        dateData1.value[2] = parseInt(today.day)-1;
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
    if(dateData1.value[0]==dateData1.years.length-1&&dateData1.value[1]==dateData1.months.length-1){
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
      dateData1.days = newDays;
    }else{
      dateData1.days = days;
    }
    if(dateData1.value[2]>dateData1.days.length-1){
      dateData1.value[2] = dateData1.days.length-1;
    }
    dateData1.year = dateData1.years[dateData1.value[0]];
    dateData1.month = dateData1.months[dateData1.value[1]];
    dateData1.day = dateData1.days[dateData1.value[2]];
    if(dateType == 'start'){
      selectedDate.startDate = dateData1.year+'-'+dateData1.month+'-'+dateData1.day;
    }else{
      selectedDate.endDate = dateData1.year+'-'+dateData1.month+'-'+dateData1.day;
    }
    $this.setData({
      dateData1,
      selectedDate
    });
  },
  // 保存更改的日期，并获取新日期下的数据
  getCurrentDateData:function(){
    var $this = this;
    var dateData = $this.data.dateData;
    var dateData1 = $this.data.dateData1;
    var selectedDate = $this.data.selectedDate;
    var timeType = $this.data.timeType;
    var selectedStartDateFormat = "";
    var selectedEndDateFormat = "";
    var selectedStartDate = ""
    var selectedEndDate = "";
    var isEmpty = false;
    if(timeType.isMonth){
      selectedStartDateFormat = selectedEndDateFormat = selectedDate.monthDate;
      selectedStartDate = selectedEndDate = selectedDate.monthDate.split('-')[0]+"年"+parseInt(selectedDate.monthDate.split('-')[1])+"月";
      if(selectedStartDateFormat == ""){
        isEmpty = true;
      }
    }else{
      selectedStartDateFormat = selectedDate.startDate;
      selectedEndDateFormat = selectedDate.endDate;
      selectedStartDate = selectedDate.startDate.split('-')[0]+"年"+parseInt(selectedDate.startDate.split('-')[1])+"月"+parseInt(selectedDate.startDate.split('-')[2])+"日";
      selectedEndDate = selectedDate.endDate.split('-')[0]+"年"+parseInt(selectedDate.endDate.split('-')[1])+"月"+parseInt(selectedDate.endDate.split('-')[2])+"日";
      if(selectedStartDateFormat == ""||selectedEndDateFormat==""){
        isEmpty = true;
      }
    }
    if(isEmpty){
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
      selectedStartDate,
      selectedEndDate
    });
    $this.getSearchData();
  },
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
    var id = $this.data.currentID;
    var a = $this.data.selectedStartDateFormat;
    var b = $this.data.selectedEndDateFormat;
    var datePercent = $this.getDatePercent();
    var time = "";
    var time1 = "";
    var time2 = "";
    var brand = $this.data.currentBrand;
    if(a!=b){
      var dateObj = $this.compareDate(a,b);
      time1 = dateObj.startDate;
      time2 = dateObj.endDate;
    }else{
      if(a.split('-').length ==2){
        time = a;
      }else{
        time1 = a;
      }
    }
    var url = "";
    if($this.data.lang == 'cn'){
      url = 'https://www.xuankuangchina.com/Newapi/chinasearch';
    }else{
      url = 'https://www.xuankuangchina.com/Newapi/ensearch';
    }
    var isLoading = $this.data.isLoading;
    dd.showLoading({
      content: '数据加载中...',
    });
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id: id,
        time: time,
        time1:time1,
        time2:time2,
        trendstatus: $this.data.trendstatus,
        brand:brand
      },
      success: function(res) {
        console.log(res,9999);
        var initData = res.data.data;
        initData.teamName = initData.groupname.split("-")[0];
        initData.userName = initData.groupname.split("-")[1];
        dd.setNavigationBar({
          title: initData.teamName,
        });
        initData.currentData =[];
        if($this.data.lang == "cn"){
          if(initData.status == 1){// 有组员
            initData.userData = initData.user;
          }
          if(initData.group1.length>0){
          initData.group1.forEach(function(item,index){
            item.teamName = item.name.split("-")[0];
            if($this.data.pageType == "team"&&id==16){
              item.teamName = item.brand+'推广';
            }
            item.userName = item.name.split("-")[1];
            item.number = parseInt(item.number);
            if(item.mnumber==2000&&(item.uid==12||item.uid==13)){
              var percent = 50;
              percent = (item.number/item.totalnumber)*100;
              item.totalNum = item.totalnumber;
              item.percentFont = parseInt(percent)+"%";
              item.percentRange = parseInt(percent)+'%';
              item.datePercent = '0%';
              item.percent = parseInt(percent)+'%';
            }else{
              var percent = parseInt(item.number)/parseInt(item.mnumber)*100;
              item.percentFont = parseInt(percent)+"%";
              if(percent>100){
                percent = 100
              }
              if(percent<datePercent){
                item.percentRange = datePercent+'%';
              }else if(percent>datePercent){
                item.percentRange = percent+'%';
              }else{
                item.percentRange = datePercent+'%';
              }
              item.datePercent = datePercent+'%';
              item.percent = parseInt(percent)+'%';
            }
            initData.currentData.push(item);
          });
          }
        }else{
          if(initData.status == 3){
            initData.userData = initData.user;
          }else if(initData.status == 1){
            initData.user.forEach(function(item,index){
              if(index == 0){
                item.isOn = true;
                initData.userData = item.son;
              }else{
                item.isOn = false;
              }
            });
          }
          if(initData.jindustatus == 1){
            if(initData.numbering.length>0){
            var obj = initData.numbering[0];
            var percent = parseInt(obj.number)/obj.mnumber*100;
            obj.percentFont = parseInt(percent)+"%";
            obj.teamName = obj.name.split("-")[0];
            obj.userName = obj.name.split("-")[1];
            if(percent>100){
              percent = 100;
            }
            if(percent<datePercent){
              obj.percentRange = datePercent+'%';
            }else if(percent>datePercent){
              obj.percentRange = percent+'%';
            }else{
              obj.percentRange = datePercent+'%';
            }
            obj.datePercent = datePercent+'%';
            obj.percent = parseInt(percent)+'%';
            initData.currentData.push(obj);
            }
          }
        }
        var currentChartData = {}; 
        var dayData = {};
        var monthData = {};
        
        if($this.data.pageType == "combine"&&id==16){
          if(initData.chanumber){
            initData.chanumber = initData.brandchanumber;
          }
          if(initData.lastdata){
            initData.lastdata = initData.brandlastdata;
          }
          if(initData.lastmonthdata){
            initData.lastmonthdata = initData.brandlastmonthdata;
          }
          if(initData.monthnumber){
            initData.monthnumber = initData.brandmonthnumber;
          }
          if(initData.nowmonthdata){
            initData.nowmonthdata = initData.brandnowmonthdata;
          }
          initData.currentData =[];
          if(initData.brandgroup1.length>0){
          initData.brandgroup1.forEach(function(item,index){
            initData.teamName = item.brand+'推广';
            item.teamName = item.brand+'推广';
            item.userName = item.name.split("-")[1];
            var percent = parseInt(item.number)/item.mnumber*100;
            item.percentFont = parseInt(percent)+"%";
            if(percent>100){
              percent = 100;
            }
            if(percent<datePercent){
              item.percentRange = datePercent+'%';
            }else if(percent>datePercent){
              item.percentRange = percent+'%';
            }else{
              item.percentRange = datePercent+'%';
            }
            item.datePercent = datePercent+'%';
            item.percent = parseInt(percent)+'%';
            initData.currentData.push(item);
          });
          }
          initData.brandfooter.forEach(function(item,index){
            if(item[0].brand == $this.data.currentBrand){
              dayData = [item];
            }
          });
          initData.brandmonthfooter.forEach(function(item,index){
            if(item[0].brand == $this.data.currentBrand){
              monthData = [item];
            }
          });
        }else{
          dayData = [initData.footer];
          monthData = [initData.monthfooter];
        }
        if($this.data.trendstatus == 1){
          currentChartData = $this.getAreaChart(dayData);
        }else{
          currentChartData = $this.getAreaChart(monthData);
        }
        isLoading = false;
        $this.setData({
          dayData,
          monthData,
          currentChartData,
          isLoading,
          initData
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
        itemTooltip.group = item.type.split("-")[0];
        itemTooltip.name = item.type.split("-")[1];
        itemTooltip.id = parseInt(item.type.split("-")[2]);
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
    $this.setData({
      currentAreaTooltip,
      chartCurrentDate
    });
    $this.getCurrentDate(chartCurrentDate);
  },
  // 获取图表点击后当前数据的日期
  getCurrentDate:function(data){
    var $this = this;
    var url = '';
    var trendstatus= $this.data.trendstatus;
    var id = $this.data.currentID;
    var currentDate = data;
    $this.setData({
      changeData:{}
    });
    if(trendstatus == 1){
      url = 'https://www.xuankuangchina.com/Newapi/daytrend';
    }else{
      url='https://www.xuankuangchina.com/Newapi/monthtrend';
    }
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id: id,
        time: currentDate,
        brand:$this.data.currentBrand
      },
      success: function(res) {
        var changeData = res.data.data;
        console.log(changeData,"changeData");
        if(trendstatus == 1){
          if($this.data.currentBrand!=''){
            changeData.daynumber = changeData.branddaynumber;
            changeData.weeknumber = changeData.brandweeknumber;
            changeData.chanumber = changeData.brandchanumber;
            changeData.nowdata = changeData.brandnowdata;
            changeData.lastdata = changeData.brandlastdata;
            changeData.lastmonthdata = changeData.brandlastmonthdata;
            changeData.lasttimedata = changeData.brandlasttimedata;
            changeData.lastweekdata = changeData.brandlastweekdata;
            changeData.nowmonthdata = changeData.brandnowmonthdata;
            changeData.nowweekdata = changeData.brandnowweekdata;
            changeData.nowdata = changeData.brandnowdata;
          }
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
          if($this.data.currentBrand!=''){
            changeData.chanumber = changeData.brandchanumber;
            changeData.lasttimedata = changeData.brandlasttimedata;
            changeData.nowmonthdata = changeData.brandnowmonthdata;
          }
          changeData.changeMonthNum = Math.abs(changeData.chanumber);
          if(changeData.chanumber>0){
            changeData.changeMonthFont = "上升";
            changeData.monthSort = "asc";
          }else if(changeData.chanumber==0){
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
          itemSeries.type = item[0].groupname+"-"+item[0].id;
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
          }else if(index ==5){
            itemSeries.color = "#a281dd";
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
    return dataArea;
  },
  // 获取初始化数据
  getInitData:function(){
    var $this = this;
    var id = $this.data.currentID;
    var isLoading = $this.data.isLoading;
    var time = $this.data.selectedStartDateFormat;
    var currentBrand = $this.data.currentBrand;
    var datePercent = $this.getDatePercent();
    var url = '';
    if($this.data.lang == 'cn'){
      url = 'https://www.xuankuangchina.com/Newapi/chinason';
    }else{
      url = 'https://www.xuankuangchina.com/Newapi/enson';
    }
    dd.showLoading({
      content: '数据加载中...',
    });
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id: id,
        time: time,
        brand:currentBrand,
        trendstatus: $this.data.trendstatus
      },
      success: function(res) {
        console.log(res,"res04");
        var initData = res.data.data;
        initData.teamName = initData.groupname.split("-")[0];
        initData.userName = initData.groupname.split("-")[1];
        initData.currentData =[];
        dd.setNavigationBar({
          title: initData.teamName,
        });
        if($this.data.lang == "cn"){
          if(initData.status == 1){// 有组员
            initData.userData = initData.user;
          }
          initData.group1.forEach(function(item,index){
            item.teamName = item.name.split("-")[0];
            item.userName = item.name.split("-")[1];
            if($this.data.pageType == "team"&&id==16){
              item.teamName = item.brand+'推广';
            }
            item.number = parseInt(item.number);
            if(item.mnumber==2000&&(item.uid==12||item.uid==13)){
              var percent = 50;
              percent = (item.number/item.totalnumber)*100;
              item.totalNum = item.totalnumber;
              item.percentFont = parseInt(percent)+"%";
              item.percentRange = parseInt(percent)+'%';
              item.datePercent = '0%';
              item.percent = parseInt(percent)+'%';
            }else{
              var percent = parseInt(item.number)/parseInt(item.mnumber)*100;
              item.percentFont = parseInt(percent)+"%";
              if(percent>100){
                percent = 100
              }
              if(percent<datePercent){
                item.percentRange = datePercent+'%';
              }else if(percent>datePercent){
                item.percentRange = percent+'%';
              }else{
                item.percentRange = datePercent+'%';
              }
              item.datePercent = datePercent+'%';
              item.percent = parseInt(percent)+'%';
            }
            initData.currentData.push(item);
          });
        }else{
          if(initData.status == 3){
            initData.userData = initData.user;
          }else if(initData.status == 1){
            initData.user.forEach(function(item,index){
              if(index == 0){
                item.isOn = true;
                initData.userData = item.son;
              }else{
                item.isOn = false;
              }
            });
          }
          if(initData.jindustatus == 1){
            var obj = initData.numbering[0];
            var percent = parseInt(obj.number)/obj.mnumber*100;
            obj.percentFont = parseInt(percent)+"%";
            obj.teamName = obj.name.split("-")[0];
            obj.userName = obj.name.split("-")[1];
            if(percent>100){
              percent = 100;
            }
            if(percent<datePercent){
              obj.percentRange = datePercent+'%';
            }else if(percent>datePercent){
              obj.percentRange = percent+'%';
            }else{
              obj.percentRange = datePercent+'%';
            }
            obj.datePercent = datePercent+'%';
            obj.percent = parseInt(percent)+'%';
            initData.currentData.push(obj);
          }
        }
        var currentChartData = {}; 
        var dayData = {};
        var monthData = {};
        if($this.data.pageType == "combine"&&id==16){
          if(initData.chanumber){
            initData.chanumber = initData.brandchanumber;
          }
          if(initData.lastdata){
            initData.lastdata = initData.brandlastdata;
          }
          if(initData.lastmonthdata){
            initData.lastmonthdata = initData.brandlastmonthdata;
          }
          if(initData.monthnumber){
            initData.monthnumber = initData.brandmonthnumber;
          }
          if(initData.nowmonthdata){
            initData.nowmonthdata = initData.brandnowmonthdata;
          }
          initData.currentData =[];
          initData.brandgroup1.forEach(function(item,index){
            initData.teamName = item.brand+'推广';
            item.teamName = item.brand+'推广';
            item.userName = item.name.split("-")[1];
            var percent = parseInt(item.number)/item.mnumber*100;
            item.percentFont = parseInt(percent)+"%";
            if(percent>100){
              percent = 100;
            }
            if(percent<datePercent){
              item.percentRange = datePercent+'%';
            }else if(percent>datePercent){
              item.percentRange = percent+'%';
            }else{
              item.percentRange = datePercent+'%';
            }
            item.datePercent = datePercent+'%';
            item.percent = parseInt(percent)+'%';
            initData.currentData.push(item);
          });
          initData.brandfooter.forEach(function(item,index){
            if(item[0].brand == $this.data.currentBrand){
              dayData = [item];
            }
          });
          initData.brandmonthfooter.forEach(function(item,index){
            if(item[0].brand == $this.data.currentBrand){
              monthData = [item];
            }
          });
        }else{
          dayData = [initData.footer];
          monthData = [initData.monthfooter];
        }
        if($this.data.trendstatus == 1){
          currentChartData = $this.getAreaChart(dayData);
        }else{
          currentChartData = $this.getAreaChart(monthData);
        }
        isLoading = false;
        $this.setData({
          dayData,
          monthData,
          currentChartData,
          isLoading,
          initData
        },function(){
          dd.hideLoading();
        });
        
      },
    });
  },
  // 品牌选项卡点击事件
  getBrandMember:function(e){
    var $this = this;
    var name = e.currentTarget.dataset.name;
    var initData = $this.data.initData;
    initData.user.forEach(function(item,index){
      if(name == item.name){
        item.isOn = true;
        initData.userData = item.son;
      }else{
        item.isOn = false;
      }
    });
    $this.setData({
      initData
    });
  },
  // 跳转到个人成绩页面
  goToPersonDetail:function(e){
    var $this = this;
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var teamID = parseInt(e.currentTarget.dataset.team);
    dd.navigateTo({
      url: '../personDetail/personDetail?id='+id+'&name=' + name+'&teamID=' + teamID
    });
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
  // 获取目标日期已过百分比
  getDatePercent:function(){
    var $this = this;
    var currentDate = $this.data.selectedEndDateFormat;
    var today = $this.getToday();
    var year = parseInt(currentDate.split('-')[0]);
    var month = parseInt(currentDate.split('-')[1]);
    var days = $this.getCurrentMonthDays(year,month);
    var datePercent = 0;
    if(today.year==year&&today.month==month){
      datePercent = parseInt((today.day/days)*100);
    }else{
      datePercent = 100;
    }
    return datePercent;
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
  // 判断选择日期是不是今天
  isToday:function(str){
    var d = new Date(str);
    var todayDate = new Date();
    if(d.setHours(0,0,0,0) == todayDate.setHours(0,0,0,0)){
      return true;
    }else{
      return false;
    }
  },
  // 判断选择日期是不是昨天
  isYesterday:function(str){
    var d = new Date(str);
    var today = new Date();
    var yesterdayDate = today.getTime() - 24* 60 * 60 * 1000;
    yesterdayDate = new Date(yesterdayDate);
    if(d.setHours(0,0,0,0) == yesterdayDate.setHours(0,0,0,0)){
      return true;
    }else{
      return false;
    }
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
});
