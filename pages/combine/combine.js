Page({
  data: {
    selectedDate:'',
    selectedDateFormat:'',
    datePicker:{
      isShow:false,
      animationData:{},
      animationInfo:{}
    },
    dateData:{},
    currentID:"",
    lang:'',
    pageType:'combine',
    isLoading:true,
    initData:{},
    trendstatus:1,
    chartType:[
      {name:'日趋势',type:'day',isOn:true},
      {name:'月趋势',type:'month',isOn:false},
    ],
    dayData:[],
    monthData:[],
    chartCurrentTeamID:0,
    currentAreaTooltip:[],
    chartCurrentDate:'',
    changeData:{},
    isCombine:true,
    currentChartData:{},
    permissionsData:{},
    waterMark:{},
    currentBrand:''
  },
  onLoad(query) {
    var $this = this;
    $this.hideDatePicker();
    var lang = query.lang;
    if(lang=='cn'){
      dd.setNavigationBar({
        title: '组合目标',
      });
    }else{
      dd.setNavigationBar({
        title: '组合成绩',
      });
    }
    var currentID = parseInt(query.id);
    var selectedDate = query.date.split("-")[0]+"年"+parseInt(query.date.split("-")[1])+"月";
    var selectedDateFormat= query.date;
    var currentDate = {
      year: parseInt(query.date.split("-")[0]),
      month: parseInt(query.date.split("-")[1])
    }
    var dateData = $this.initDate(currentDate);
    var permissionsData = {};
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
        console.log(permissionsData,'permissionsData');
        dd.getStorage({
          key: 'waterMark',
          success: function(res) {
            waterMark = res.data;
            console.log(waterMark,'waterMark');
            $this.setData({
              waterMark,
              dateData,
              currentID,
              selectedDate,
              selectedDateFormat,
              permissionsData,
              lang,
              chartType,
              trendstatus
            },function(){
              $this.getInitData();
            });
          },
          fail: function(res){
            console.log(res,'res01');
          }
        });
      },
      fail: function(res){
        console.log(res,'res02');
      }
    });
  },
  initDate:function(currentDate){
    var $this = this;
    const years = [];
    const months = [];
    var today=  $this.getToday();
    var todayYear = ""+today.year;
    var todayMonth = today.month<10?('0'+today.month): (""+today.month);
    var currentMonth = currentDate.month<10?('0'+currentDate.month): (""+currentDate.month);
    // var currentDay = currentDate.day<10?("0"+currentDate.day):(""+currentDate.day);
    var year = "" + currentDate.year;
    var month = currentMonth;
    // var day = currentDay;
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
  // 点击图表类型事件（日趋势/月趋势）
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
        if(itemTooltip.id==16){
          itemTooltip.brand = itemTooltip.group.slice(0,2);
        }else{
          itemTooltip.brand = "";
        }
        if(itemTooltip.id ==id){
          itemTooltip.isOn = true;
        }else{
          itemTooltip.isOn = false;
        }
        if(itemTooltip.id ==1||itemTooltip.id ==2){
          itemTooltip.isCombine = true;
        }else{
          itemTooltip.isCombine = false;
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
    var lang = $this.data.lang;
    var isCombine = $this.data.isCombine;
    var trendstatus= $this.data.trendstatus;
    var id = $this.data.chartCurrentTeamID;
    var currentDate = data;
    if(trendstatus == 1){
      if(isCombine){// 组合日趋势
        if(lang=="en"){// 英文组合日趋势
          url = 'https://www.xuankuangchina.com/Newapi/engrouptrend';
        }else{// 中文组合日趋势
          url = 'https://www.xuankuangchina.com/Newapi/chinagrouptrend';
        }
      }else{
        url = 'https://www.xuankuangchina.com/Newapi/daytrend';
      }
    }else{
      if(isCombine){// 组合月趋势
        if(lang=="en"){// 英文组合月趋势
          url = 'https://www.xuankuangchina.com/Newapi/enmonthtrend';
        }else{// 中文组合月趋势
          url = 'https://www.xuankuangchina.com/Newapi/chinamonthtrend';
        }
      }else{
        url = 'https://www.xuankuangchina.com/Newapi/monthtrend';
      }
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
        console.log(res,'res03');
        var changeData = res.data.data;
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
  // 切换图表小组中当前选中小组点击事件
  subGoupChartClick:function(e){
    var $this = this;
    var id = parseInt(e.currentTarget.dataset.id);
    var isCombine = e.currentTarget.dataset.type;
    var currentAreaTooltip = $this.data.currentAreaTooltip;
    var trendstatus = $this.data.trendstatus;
    var currentBrand = e.currentTarget.dataset.brand;
    currentAreaTooltip.forEach(function(item,index){
      if(id==16){
        if(item.brand == currentBrand){
          item.isOn = true;
        }else{
          item.isOn = false;
        }
      }else{
        if(item.id==id){
          item.isOn = true;
        }else{
          item.isOn = false;
        }
      }
    });
    $this.setData({
      isCombine,
      currentAreaTooltip,
      chartCurrentTeamID:id,
      currentBrand
    });
    $this.getCurrentDate($this.data.chartCurrentDate);
  },
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
          if(item[0].uid == 16){
            itemSeries.type = item[0].brand+"推广-"+item[0].groupname.split('-')[1]+"-"+item[0].uid;
          }else{
            itemSeries.type = item[0].groupname+"-"+item[0].uid;
          }
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
    var currentDate = $this.data.selectedDateFormat;
    var lang = $this.data.lang;
    var isLoading = $this.data.isLoading;
    var datePercent = $this.getDatePercent();
    var url ='';
    if(lang == 'cn'){
      url = 'https://www.xuankuangchina.com/Newapi/chinagroupinfo';
    }else{
      url = 'https://www.xuankuangchina.com/Newapi/engroupinfo';
    }
    dd.showLoading({
      content: '数据加载中...',
    });
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id:$this.data.permissionsData.id,
        level:$this.data.permissionsData.level,
        gid: id,
        time: currentDate,
        trendstatus: $this.data.trendstatus
      },
      success: function(res) {
        console.log(res,'res04');
        var initData = res.data.data;
        initData.teamName = initData.groupname.split("-")[0];
        initData.userName = initData.groupname.split("-")[1];
        initData.grouplist.forEach(function(item,index){
          item.userName = item.name.split("-")[1];
          if(item.uid==16){
            item.groupName = item.name.split("-")[2]+'推广';
          }else{
            item.groupName = item.name.split("-")[0];
          }
          if(lang == "cn"){
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
          }
        });
        var dayData = [];
        var monthData = [];
        initData.groupfooter.forEach(function(item,index){
          item.uid = initData.gid;
        });
        initData.groupmonthfooter.forEach(function(item,index){
          item.uid = initData.gid;
        });
        dayData.push(initData.groupfooter);
        monthData.push(initData.groupmonthfooter);
        initData.teamfooter.forEach(function(item,index){
          dayData.push(item.son);
        });
        initData.teammonthfooter.forEach(function(item,index){
          monthData.push(item.son);
        });
        var chartCurrentTeamID = "";
        chartCurrentTeamID = dayData[0][0].uid;
        isLoading = false;
        var currentChartData = {};
        dayData.forEach(function(item,index){
          if(item.uid == 16){
            var groupName = item.groupname.split("-")[2]+"推广-"+item.groupname.split("-")[1];
            item.groupname = groupName;
          }
        });
        monthData.forEach(function(item,index){
          if(item.uid == 16){
            var groupName = item.groupname.split("-")[2]+"推广-"+item.groupname.split("-")[1];
            item.groupname = groupName;
          }
        });
        if($this.data.trendstatus == 1){
          currentChartData = $this.getAreaChart(dayData);
        }else{
          currentChartData = $this.getAreaChart(monthData);
        }
        $this.setData({
          chartCurrentTeamID,
          initData,
          dayData,
          monthData,
          currentChartData,
          isLoading
        },function(){
          dd.hideLoading();
        });
      },
    });
  },
  changeDate:function(){
    var $this = this;
    var currentDate = $this.data.date.currentDate;
    dd.datePicker({
      format: 'yyyy-MM',
      currentDate: currentDate,
      success: (res) => {
        var date = {}
        if(res.date){
          date.currentDate = res.date;
          date.dateFont = date.currentDate.split("-")[0] + "年" + parseInt(date.currentDate.split("-")[1]) + "月"
          $this.setData({
            date,
            isClick:false
          });
          $this.getInitData();
        }
      },
    });
  },
  // 跳转到小组
  goToSubGroup:function(e){
    var $this = this;
    var id = e.currentTarget.dataset.id;
    var date = $this.data.selectedDateFormat;
    if(id == 16){
      var brand = e.currentTarget.dataset.brand;
      dd.navigateTo({
        url: '../subGroup/subGroup?id='+id+'&date=' + date + '&pageType=' + $this.data.pageType+'&lang='+$this.data.lang+'&brand='+brand
      });
    }else{
      dd.navigateTo({
        url: '../subGroup/subGroup?id='+id+'&date=' + date + '&pageType=' + $this.data.pageType+'&lang='+$this.data.lang
      });
    }
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
    if(dateData.value[0]==dateData.years.length-1){
      if(dateData.value[1]>parseInt(today.month)-1){
        dateData.value[1] = parseInt(today.month)-1;
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
    dateData.year = dateData.years[dateData.value[0]];
    dateData.month = dateData.months[dateData.value[1]];
    $this.setData({
      dateData,
    });
  },
  // 保存更改的日期，并获取新日期下的数据
  getCurrentDateData:function(){
    var $this = this;
    var dateData = $this.data.dateData;
    var selectedDate = dateData.year + "年" + dateData.month + "月";
    var selectedDateFormat= dateData.year + "-" + dateData.month;
    $this.hideDatePicker();
    $this.setData({
      selectedDate,
      selectedDateFormat
    });
    $this.getInitData();
  },
  // 获取目标日期已过百分比
  getDatePercent:function(){
    var $this = this;
    var currentDate = $this.data.selectedDateFormat;
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
  // 获取当月总天数
  getCurrentMonthDays:function(year,month){
    var d = new Date(year,month,0);
    return d.getDate();
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
