Page({
  data:{
    isFixedMenu:false,
    isTeamFixed:false,
    pageType:'team',
    modules:{},
    scrollTop:0,
    chartType:[
      {name:'日趋势',type:'day',isOn:true},
      {name:'月趋势',type:'month',isOn:false},
    ],
    trendstatus:1,
    isLoading:true,
    selectedDateFormat:"",
    teamData:[],
    initData:{},
    dateData:{},
    dayData:[],
    monthData:[],
    chartCurrentTeamID:0,
    currentAreaTooltip:[],
    chartCurrentDate:'',
    currentGroupID:0,
    changeData:{},
    datePicker:{
      isShow:false,
      animationData:{},
      animationInfo:{}
    },
    ddChartArea:{},
    isCombine:true,
    currentChartData:{},
    permissionsData:{},
    waterMark:{},
    scrollLeft:0
  },
  onLoad(query) {
    // 页面加载
    var $this = this;
    $this.hideDatePicker();
    var today = $this.getToday();
    var todayMonth = today.month<10?('0'+today.month): (""+today.month);
    var todayDay = today.day<10?("0"+today.day):(""+today.day);
    var selectedDateFormat= today.year + "-" + todayMonth + "-" + todayDay;
    var dateData = $this.initDate(today);
    var permissionsData ={};
    var waterMark = {};
    var chartType = $this.data.chartType;
    var trendstatus = 1;
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
        console.log(permissionsData);
        dd.getStorage({
          key: 'waterMark',
          success: function(res) {
            waterMark = res.data;
            console.log(waterMark);
            $this.setData({
              waterMark,
              permissionsData,
              dateData,
              selectedDateFormat,
              chartType,
              trendstatus
            },function(){
              $this.getInitData();
            });
          },
          fail: function(res){
            console.log(res);
          }
        });
      },
      fail: function(res){
        console.log(res);
      }
    });    
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
  // 获取当月总天数
  getCurrentMonthDays:function(year,month){
    var d = new Date(year,month,0);
    return d.getDate();
  },
  // 日历变更时的监听事件
  datePickerChange:function(e){
    var $this = this;
    var dateData = $this.data.dateData;
    dateData.value = e.detail.value;
    var today = $this.getToday();
    today.year = ""+today.year;
    today.month = today.month<10?"0"+today.month:""+today.month;
    today.day = today.day<10?"0"+today.day:""+today.day;
    var months = ["01","02","03","04","05","06","07","08","09","10","11","12"]
    var currentDay = $this.getCurrentMonthDays(parseInt(dateData.years[dateData.value[0]]),parseInt(dateData.months[dateData.value[1]]));
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
    $this.setData({
      dateData,
    });
  },
  // 保存更改的日期，并获取新日期下的数据
  getCurrentDateData:function(){
    var $this = this;
    var dateData = $this.data.dateData;
    var selectedDateFormat = dateData.year + "-" + dateData.month + "-" + dateData.day;
    if(selectedDateFormat==""){
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
      selectedDateFormat
    });
    $this.getInitData();
  },
  // 获取初始化数据
  getInitData:function(){
    var $this = this;
    var isLoading = $this.data.isLoading;
    var trendstatus = $this.data.trendstatus;
    var url = "https://www.xuankuangchina.com/Newapi/getscoreapi";
    dd.showLoading({
      content: '数据加载中...',
    });
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id:$this.data.permissionsData.id,
        level:$this.data.permissionsData.level,
        time: $this.data.selectedDateFormat,
        trendstatus:trendstatus
      },
      success: function(res) {
        var initData = res.data.data;
        var teamData = initData.group;
        console.log(initData,"initData01");
        console.log(teamData,"teamData");
        teamData.forEach(function(item,index){
          if(index == 0){
            item.isOn = true;
          }else{
            item.isOn = false;
          }
        });
        initData.data.forEach(function(item,index){
          item.data.forEach(function(items,indexs){
            items.groupName = items.name.split("-")[0];
            items.userName = items.name.split("-")[1];
          });
          if(item.id == 2){
            item.data.forEach(function(items,indexs){
              if(items.nowdata>items.lastmonthdata){
                items.font = ">";
              }else if(items.nowdata<items.lastmonthdata){
                items.font = "<";
              }else{
                items.font = "=";
              }
            });
          }
          if(item.id==2||item.id==3||item.id==4||item.id==5||item.id==7){
            item.data.forEach(function(items,indexs){
              items.isSonShow = false;
            });
          }
          if(item.id==3||item.id==4||item.id==7){
            item.data.forEach(function(items,indexs){
              if(items.user){
                items.hasSon = true;
              }else{
                item.hasSon = false;
              }
            });
            item.top5Chart = $this.getColumnChart([item.top5]);
          }
          if(item.id==5){
            item.data.forEach(function(items,indexs){
              if(items.brandinfo){
                items.hasSon = true;
              }else{
                item.hasSon = false;
              }
            });
          }
          if(item.id == 1||item.id==2||item.id==3){
            item.data.forEach(function(items,indexs){
              items.lang = "cn";
            });
          }else{
            item.data.forEach(function(items,indexs){
              items.lang = "en";
            });
          }
        });
        initData.footer.forEach(function(item,index){
          item.font1 = item.groupname.slice(0,2);
          item.font2 = item.groupname.slice(2);
          if(index==0){
            item.isOn = true;
          }else{
            item.isOn = false;
          }
          if(item.id == 2){
            item.footer = [item.footer];
            item.monthtrend = [item.monthtrend];
          }
        });
        var currentChartData = {}; 
        var dayData = {};
        var monthData = {};
        var chartCurrentTeamID = "";
        dayData = initData.footer[0].footer;
        monthData = initData.footer[0].monthtrend;
        chartCurrentTeamID = initData.footer[0].footer[0][0].uid;
        if($this.data.trendstatus == 1){
          currentChartData = $this.getAreaChart(dayData);
        }else{
          currentChartData = $this.getAreaChart(monthData);
        }
        isLoading = false;
        console.log(initData);
        $this.setData({
          teamData,
          initData,
          dayData,
          monthData,
          chartCurrentTeamID,
          isLoading,
          currentChartData,
          currentGroupID:initData.footer[0].id
        });
        dd.hideLoading();
        $this.getModuleInfo();
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
    var id = $this.data.chartCurrentTeamID;
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
  // 切换图表小组中当前选中小组点击事件
  subGoupChartClick:function(e){
    var $this = this;
    var id = parseInt(e.currentTarget.dataset.id);
    var currentAreaTooltip = $this.data.currentAreaTooltip;
    var trendstatus = $this.data.trendstatus;
    currentAreaTooltip.forEach(function(item,index){
      if(item.id==id){
        item.isOn = true;
      }else{
        item.isOn = false;
      }
    });
    $this.setData({
      currentAreaTooltip,
      chartCurrentTeamID:id
    });
    $this.getCurrentDate($this.data.chartCurrentDate);
  },
  // 条形图表数据整理
  getColumnChart:function(data){
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
    }
    dataArea.coord = {
      transposed: true,
    };
    if(data.length>0){
      data.forEach(function(item,index){
        if(item.length>0){
          var itemSeries = {};
          itemSeries.type = item[0].name;
          itemSeries.data = [];
          item.forEach(function(item1,index1){
            if(index == 0){
              dataArea.categories.push(item1.uname+"\n"+item1.name.split("-")[0]);
            }
            itemSeries.data.push(parseInt(item1.number));
          });
          dataArea.series.push(itemSeries);
        }
      });
    }
    return dataArea;
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
          itemSeries.type = item[0].name+"-"+item[0].uid;
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
    return dataArea;
  },
  // 获取图表点击后当前数据的日期
  getCurrentDate:function(data){
    var $this = this;
    var url = '';
    var trendstatus= $this.data.trendstatus;
    var id = $this.data.chartCurrentTeamID;
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
      },
      success: function(res) {
        var changeData = res.data.data;
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
  // 切换图表组别
  clickTeamChart:function(e){
    var $this = this;
    var id = parseInt(e.currentTarget.dataset.id);
    var initData = $this.data.initData;
    var trendstatus = $this.data.trendstatus;
    var chartCurrentTeamID = "";
    var dayData= {};
    var monthData={};
    var currentChartData = {}; 
    initData.footer.forEach(function(item,index){
      if(item.id == id){
        item.isOn = true;
        chartCurrentTeamID = item.footer[0][0].uid;
        dayData = item.footer;
        monthData = item.monthtrend;
      }else{
        item.isOn = false;
      }
      if($this.data.trendstatus == 1){
        currentChartData = $this.getAreaChart(dayData);
      }else{
        currentChartData = $this.getAreaChart(monthData);
      }
    });
    currentChartData.tooltip.def_item.key = $this.data.chartCurrentDate;
    $this.setData({
      dayData,
      monthData,
      currentChartData,
      chartCurrentTeamID,
      initData,
      currentGroupID:id
    });
  },
  // 显示/隐藏品牌、组员内容的点击事件
  showSon:function(e){
    var $this = this;
    var gid = parseInt(e.currentTarget.dataset.gid);
    var id = parseInt(e.currentTarget.dataset.id);
    var initData = $this.data.initData;
    initData.data.forEach(function(item,index){
      if(item.id==gid){
        item.data.forEach(function(items,indexs){
          if(items.id==id){
            items.isSonShow = !items.isSonShow;
          }
        });
      }
    });
    $this.setData({
      initData
    });
    $this.getModuleInfo();
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
    .select('#date').boundingClientRect()
    .select('#fixedScroll').boundingClientRect()
    .select("#team-1").boundingClientRect()
    .select("#team-2").boundingClientRect()
    .select("#team-3").boundingClientRect()
    .select("#team-4").boundingClientRect()
    .select("#team-5").boundingClientRect()
    .select("#team-7").boundingClientRect()
    .select("#scroll-1").boundingClientRect()
    .select("#scroll-2").boundingClientRect()
    .select("#scroll-3").boundingClientRect()
    .select("#scroll-4").boundingClientRect()
    .select("#scroll-5").boundingClientRect()
    .select("#scroll-7").boundingClientRect().exec((rect)=>{
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
      modules.moduleTop.module1 = 0;
      modules.moduleTop.module2 = 0;
      modules.moduleTop.module3 = modules.moduleInfo.module1.height;
      modules.moduleTop.module4 = modules.moduleInfo.module1.height+modules.moduleInfo.module3.height;
      if(!modules.moduleInfo.module5){
        modules.moduleInfo.module5 = {};
        modules.moduleInfo.module5.height = 0;
      }
      if(!modules.moduleInfo.module6){
        modules.moduleInfo.module6 = {};
        modules.moduleInfo.module6.height = 0;
      }
      if(!modules.moduleInfo.module7){
        modules.moduleInfo.module7 = {};
        modules.moduleInfo.module7.height = 0;
      }
      if(!modules.moduleInfo.module8){
        modules.moduleInfo.module8 = {};
        modules.moduleInfo.module8.height = 0;
      }
      if(!modules.moduleInfo.module9){
        modules.moduleInfo.module9 = {};
        modules.moduleInfo.module9.height = 0;
      }
      if(!modules.moduleInfo.module10){
        modules.moduleInfo.module10 = {};
        modules.moduleInfo.module10.height = 0;
      }
      if(!modules.moduleInfo.module11){
        modules.moduleInfo.module11 = {};
        modules.moduleInfo.module11.left = 0;
      }
      if(!modules.moduleInfo.module12){
        modules.moduleInfo.module12 = {};
        modules.moduleInfo.module12.left = 0;
      }
      if(!modules.moduleInfo.module13){
        modules.moduleInfo.module13 = {};
        modules.moduleInfo.module13.left = 0;
      }
      if(!modules.moduleInfo.module14){
        modules.moduleInfo.module14 = {};
        modules.moduleInfo.module14.left = 0;
      }
      if(!modules.moduleInfo.module15){
        modules.moduleInfo.module15 = {};
        modules.moduleInfo.module15.left = 0;
      }
      if(!modules.moduleInfo.module16){
        modules.moduleInfo.module16 = {};
        modules.moduleInfo.module16.left = 0;
      }
      modules.moduleTop.module5 = modules.moduleTop.module4+modules.moduleInfo.module4.height;
      modules.moduleTop.module6 = modules.moduleTop.module5+modules.moduleInfo.module5.height;
      modules.moduleTop.module7 = modules.moduleTop.module6+modules.moduleInfo.module6.height;
      modules.moduleTop.module8 = modules.moduleTop.module7+modules.moduleInfo.module7.height;
      modules.moduleTop.module9 = modules.moduleTop.module8+modules.moduleInfo.module8.height;
      modules.moduleTop.module10 = modules.moduleTop.module9+modules.moduleInfo.module9.height;
      $this.setData({
        modules
      });
    });
  },
  // 监听页面滚动事件
  onPageScroll(e) {
    var scrollTop = e.scrollTop;
    var $this = this;
    var isFixedMenu = false;
    var isTeamFixed = false;
    var modules = $this.data.modules;
    var teamData = $this.data.teamData;
    var scrollLeft = 0;
    if(scrollTop > 0){
      isFixedMenu = true;
    }else{
      isFixedMenu = false;
    }
    if(isFixedMenu){
      if(scrollTop > modules.moduleTop.module4-modules.moduleInfo.module2.height){
        isTeamFixed = true;
      }else{
        isTeamFixed = false;
      }
      teamData.forEach(function(item,index){
        if(modules.moduleInfo.module5 &&modules.moduleInfo.module5.height >0 && scrollTop > modules.moduleTop.module5-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height-10){
          if(item.id == 1){
            scrollLeft = 0;
            item.isOn = true;
          }else{
            item.isOn = false;
          }
        }
        if(modules.moduleInfo.module6 &&modules.moduleInfo.module6.height >0 && scrollTop > modules.moduleTop.module6-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height-10){
          if(item.id == 2){
            scrollLeft = modules.moduleInfo.module12.left-modules.moduleInfo.module11.left;
            item.isOn = true;
          }else{
            item.isOn = false;
          }
        }
        if(modules.moduleInfo.module7 &&modules.moduleInfo.module7.height >0 && scrollTop > modules.moduleTop.module7-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height-10){
          if(item.id == 3){
            scrollLeft = modules.moduleInfo.module13.left-modules.moduleInfo.module11.left;
            item.isOn = true;
          }else{
            item.isOn = false;
          }
        }
        if(modules.moduleInfo.module8 &&modules.moduleInfo.module8.height >0 && scrollTop > modules.moduleTop.module8-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height-10){
          if(item.id == 4){
            scrollLeft = modules.moduleInfo.module14.left-modules.moduleInfo.module11.left;
            item.isOn = true;
          }else{
            item.isOn = false;
          }
        }
        if(modules.moduleInfo.module9 &&modules.moduleInfo.module9.height >0 && scrollTop > modules.moduleTop.module9-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height-10){
          if(item.id == 5){
            scrollLeft = modules.moduleInfo.module15.left-modules.moduleInfo.module11.left;
            item.isOn = true;
          }else{
            item.isOn = false;
          }
        }
        if(modules.moduleInfo.module10 &&modules.moduleInfo.module10.height >0 && scrollTop > modules.moduleTop.module10-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height-10){
          if(item.id == 7){
            scrollLeft = modules.moduleInfo.module16.left-modules.moduleInfo.module11.left;
            item.isOn = true;
          }else{
            item.isOn = false;
          }
        }
      });
      $this.setData({
        isTeamFixed,
        teamData,
      });
    }
    $this.setData({
      scrollLeft,
      isFixedMenu,
      scrollTop
    });
  },
  // 分组点击跳转到页面相应位置事件
  scrollToPage:function(e){
    var $this = this;
    var id = parseInt(e.currentTarget.dataset.id);
    $this.getModuleInfo();
    var teamData = $this.data.teamData;
    teamData.forEach(function(item,index){
      if(item.id == id && !item.isOn){
        item.isOn = true;
      }else{
        item.isOn = false;
      }
    });
    var isFixedMenu = true;
    var isTeamFixed = true;
    $this.setData({
      teamData,
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
        scrollTop: modules.moduleTop.module5-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height
      });
    }else if(id == 2){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module6-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height
      });
    }else if(id == 3){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module7-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height
      });
    }else if(id == 4){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module8-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height
      });
    }else if(id == 5){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module9-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height
      });
    }else if(id == 7){
      dd.pageScrollTo({
        scrollTop: modules.moduleTop.module10-modules.moduleInfo.module4.height-modules.moduleInfo.module2.height
      });
    }
  },
  // 
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  // 跳转到详情页
  goToSubGroup:function(e){
    var $this = this;
    var id = e.currentTarget.dataset.id;
    var lang = e.currentTarget.dataset.lang;
    var date = $this.data.selectedDateFormat;
    dd.navigateTo({
      url:'../subGroup/subGroup?id='+id+'&date=' + date + '&pageType=' + $this.data.pageType+'&lang='+lang
    });
  },
  // 跳转到个人成绩页面
  goToMember:function(e){
    var $this = this;
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    dd.navigateTo({
      url: '../personDetail/personDetail?id='+id+'&name=' + name
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
  // 跳转到首页
  goToGourp:function(e){
    dd.navigateTo({
      url: '../index/index'
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