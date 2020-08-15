
Page({
  data: {
    pageType:"combine",
    isFixedMenu:false,
    isEnShow:false,
    isLoading:true,
    datePicker:{
      isShow:false,
      animationData:{},
      animationInfo:{}
    },
    selectedDate:'',
    selectedDateFormat:'',
    dateData:{},
    initData:{},
    permissionsData:{},
    canvasDom:{},
    waterMark:{}
  },
  onLoad() {
    var $this = this;
    $this.hideDatePicker();
    var today =  $this.getToday();
    var currentDate = {
      year: today.year,
      month: today.month
    }
    var dateData = $this.initDate(currentDate);
    var selectedDate = dateData.year + "年" + dateData.month + "月";
    var selectedDateFormat= dateData.year + "-" + dateData.month;
    var permissionsData = {};
    var canvasDom = {};
    let query = dd.createSelectorQuery();
    //console.log(query,"010101");
    dd.getStorage({
      key: 'permissionsData',
      success: function(res) {
        permissionsData = res.data;
        //console.log(permissionsData);
        query.select('#canvas').boundingClientRect().exec((rect) => {
          canvasDom = rect[0];
          $this.setData({
            dateData,
            selectedDate,
            permissionsData,
            selectedDateFormat,
            canvasDom
          },function(){
            $this.initCanvas();
          });
        });
      },
      fail: function(res){
        //console.log(res);
      }
    });
  },
  onShow(){
    //console.log(1111);
  },
  initDate:function(currentDate){
    var $this = this;
    const years = [];
    const months = [];
    // const days = [];
    var today=  $this.getToday();
    var todayYear = ""+today.year;
    var todayMonth = today.month<10?('0'+today.month): (""+today.month);
    // var yesterdayDay = yesterday.day<10?("0"+yesterday.day):(""+yesterday.day);
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
  // 获取初始化数据
  getInitData:function(){
    var $this = this;
    var isLoading = $this.data.isLoading;
    var datePercent = $this.getDatePercent();
    var waterMark = {};
    var url = "https://www.xuankuangchina.com/Newapi/getindexapi";
    dd.showLoading({
      content: '数据加载中...',
    });
    dd.httpRequest({
      url: url,
      method: 'POST',
      data: {
        id: $this.data.permissionsData.id,
        level:$this.data.permissionsData.level,
        time: $this.data.selectedDateFormat,
      },
      success: function(res) {
        console.log(res,"01");
        var initData = res.data.data;
        var a = 0;
        var b = 0;
        var c = 0;
        var d = 0;
        var e = 0;
        if(initData.chinacompare.length>0){
          initData.chinacompare.forEach(function(item,index){
            item.userName = item.name.split("-")[1];
          });
          var num1 = parseInt(initData.chinacompare[0].number);
          var num2 = parseInt(initData.chinacompare[1].number);
          initData.totalNum = num1+num2;
          if(num1 ==0&&num2==0){
            a = 50
          }else{
            a = num1/(num1+num2)*100;
          }
          if(num1>num2){
            initData.cnLf = true;
            initData.cnRt = false;
          }else if(num1<num2){
            initData.cnLf = false;
            initData.cnRt = true;
          }else{
            initData.cnLf = false;
            initData.cnRt = false;
          }
        }else{
          a = 50;
        }
        if(initData.encompare.length>0){
          initData.encompare.forEach(function(item,index){
            item.userName = item.name.split("-")[1];
          });
          var num1 = parseInt(initData.encompare[0].number);
          var num2 = parseInt(initData.encompare[1].number);
          if(num1 ==0&&num2==0){
            b = 50
          }else{
            b = num1/(num1+num2)*100;
          }
          if(num1>num2){
            initData.enLf = true;
            initData.enRt = false;
          }else if(num1<num2){
            initData.enLf = false;
            initData.enRt = true;
          }else{
            initData.enLf = false;
            initData.enRt = false;
          }
        }else{
          b = 50;
        }        
        if(initData.chinasnscompare.length>0){
          initData.chinasnscompare.forEach(function(item,index){
            item.groupName = item.name.split("-")[0];
            item.userName = item.name.split("-")[1];
          });
          var num1 = parseInt(initData.chinasnscompare[0].number);
          var num2 = parseInt(initData.chinasnscompare[1].number);
          initData.totalNum = num1+num2;
          if(num1>num2){
            initData.cnsnsLf = true;
            initData.cnsnsRt = false;
          }else if(num1<num2){
            initData.cnsnsLf = false;
            initData.cnsnsRt = true;
          }else{
            initData.cnsnsLf = false;
            initData.cnsnsRt = false;
          }
        }
        if(initData.enpushcompare.length>0){
          initData.enpushcompare.forEach(function(item,index){
            item.groupName = item.name.split("-")[0];
            item.userName = item.name.split("-")[1];
          });
          var num1 = parseInt(initData.enpushcompare[0].number);
          var num2 = parseInt(initData.enpushcompare[1].number);
          initData.totalNum = num1+num2;
          if(num1>num2){
            initData.enpushLf = true;
            initData.enpushRt = false;
          }else if(num1<num2){
            initData.enpushLf = false;
            initData.enpushRt = true;
          }else{
            initData.enpushLf = false;
            initData.enpushRt = false;
          }
        }
        if(initData.ensnscompare.length>0){
          initData.ensnscompare.forEach(function(item,index){
            item.groupName = item.name.split("-")[0];
            item.userName = item.name.split("-")[1];
          });
          var num1 = parseInt(initData.ensnscompare[0].number);
          var num2 = parseInt(initData.ensnscompare[1].number);
          initData.totalNum = num1+num2;
          if(num1>num2){
            initData.ensnsLf = true;
            initData.ensnsRt = false;
          }else if(num1<num2){
            initData.ensnsLf = false;
            initData.ensnsRt = true;
          }else{
            initData.ensnsLf = false;
            initData.ensnsRt = false;
          }
        }
        initData.cnLfPercent = parseInt(a)+"%";
        initData.cnRtPercent = 100 - parseInt(a) + "%";
        initData.enLfPercent = parseInt(b)+"%";
        initData.enRtPercent = 100 - parseInt(b) + "%";      
        initData.chinagroup.forEach(function(item,index){
          item.son.forEach(function(items,idx){
            if(items.id==16){
              items.brand=items.name.split("-")[2];
              items.groupName = items.name.split("-")[2]+"推广";
              items.userName = items.name.split("-")[1];
            }else{
              items.groupName = items.name.split("-")[0];
              items.userName = items.name.split("-")[1];
            }
            if(items.mnumber==2000&&(items.id==12||items.id==13)){
              var percent = 50;
              if(items.id==13){
                percent = parseInt(initData.cnLfPercent.split('%')[0]);
              }else{
                percent = parseInt(initData.cnRtPercent.split('%')[0]);
              }
              items.percentFont = parseInt(percent)+"%";
              items.totalNum = initData.totalNum;
              items.percentRange = percent+'%';
              items.datePercent = '0%';
              items.percent = parseInt(percent)+'%';
            }else{
              items.number = parseInt(items.number);
              var percent = parseInt(items.number)/parseInt(items.mnumber)*100;
              items.percentFont = parseInt(percent)+"%";
              if(percent>100){
                percent = 100
              }
              if(percent<datePercent){
                items.percentRange = datePercent+'%';
              }else if(percent>datePercent){
                items.percentRange = percent+'%';
              }else{
                items.percentRange = datePercent+'%';
              }
              items.datePercent = datePercent+'%';
              items.percent = parseInt(percent)+'%';
            }
          });
        });
        initData.engroup.forEach(function(item,index){
          item.son.forEach(function(items,idx){
            if(items.name.indexOf("A") != -1){
                var anum = items.name.indexOf("A")+1;
                items.groupSort=parseInt(items.name.slice(anum,anum+1));
            }
            if(items.name.indexOf("C") != -1){
                var cnum = items.name.indexOf("C")+1;
                items.groupSort=parseInt(items.name.slice(cnum,cnum+1));
            }
            items.groupName = items.name.split("-")[0];
            items.userName = items.name.split("-")[1];
            items.number = parseInt(items.number);
          });
          $this.CustomSort(item.son);
        });
        initData.enothergroup.forEach(function(item,index){
          item.son.forEach(function(items,idx){
            items.groupName = items.name.split("-")[0];
            items.userName = items.name.split("-")[1];
            items.number = parseInt(items.number);
            var percent = parseInt(items.number)/parseInt(items.mnumber)*100;
            items.percentFont = parseInt(percent)+"%";
            if(percent>100){
              percent = 100
            }
            if(percent<datePercent){
              items.percentRange = datePercent+'%';
            }else if(percent>datePercent){
              items.percentRange = percent+'%';
            }else{
              items.percentRange = datePercent+'%';
            }
            items.datePercent = datePercent+'%';
            items.percent = parseInt(percent)+'%';
          });
        });
        isLoading = false;        
        var today =  $this.getToday();
        var todayYear = ""+today.year;
        var todayMonth = today.month<10?('0'+today.month): (""+today.month);
        var newdata = $this.data.selectedDate.substring(0, $this.data.selectedDate.length - 1)
        var currentYear = newdata.split("年")[0];
        var currentMonth = newdata.split("年")[1];
        var isEnShow=false;
        if(currentYear==todayYear&&todayMonth==currentMonth){
          isEnShow = false;
        }else{
          isEnShow = true;
        };
        dd.getStorage({
          key: 'waterMark',
          success: function(res) {
            waterMark = res.data;
            //console.log(waterMark);
            $this.setData({
              isLoading,
              initData,
              waterMark,
              isEnShow,
            },function(){
              dd.hideLoading();
            });
          },
          fail: function(res){
            //console.log(res);
          }
        });
      },
    });
  },
  //排序函数
  CustomSort:function(SortData){
      var SortD=SortData;
      var t='';
      var numlist=[];
      SortD.forEach(function(item){      
          if('groupSort' in item){
             numlist.push(item.groupSort);
          }else{
             item.groupSort=SortD.length;
             numlist.push(item.groupSort);
          }
      })
      for(var i=0;i<SortD.length;i++){
        for(var j=0;j<SortD.length;j++){
          if(SortD[i].groupSort<SortD[j].groupSort){
              t = SortD[i];
              SortD[i] = SortD[j];
              SortD[j] = t;
          }
        };
      };
      return SortData;
    },
  // 跳转到成绩中心页面
  goToTeam:function(e){
    dd.navigateTo({
      url: '../team/team'
    });
  },
  // 跳转到组合页面
  goToCombine:function(e){
    var $this = this;
    console.log(e,"e01")
    var id = e.currentTarget.dataset.id;
    var lang = e.currentTarget.dataset.lang;
    var time = $this.data.selectedDateFormat;
    var level = $this.data.permissionsData.level;
    if(id !=3){
      if(level==1){
        dd.navigateTo({
          url: '../combine/combine?id='+id+'&date=' + time+'&lang='+lang
        });
      }
    }
  },
  // 跳转到小组页面
  goToSubGroup:function(e){
    var $this = this;
    console.log(e,"e")
    var id = e.currentTarget.dataset.id;
    var date = $this.data.selectedDateFormat;
    var lang = e.currentTarget.dataset.lang;
    if(id == 16){
      var brand = e.currentTarget.dataset.brand;
      dd.navigateTo({
        url: '../subGroup/subGroup?id='+id+'&date=' + date + '&pageType=' + $this.data.pageType+'&lang='+lang+'&brand='+brand
      });
    }else{
      dd.navigateTo({
        url: '../subGroup/subGroup?id='+id+'&date=' + date + '&pageType=' + $this.data.pageType+'&lang='+lang
      });
    }
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
  // 监听页面滚动事件
  onPageScroll(e) {
    var $this = this;
    var isFixedMenu = false;
    if(e.scrollTop > 0){
      isFixedMenu = true;
    }else{
      isFixedMenu = false;
    }
    $this.setData({
      isFixedMenu
    });
  },
  // 日历变更时的监听事件
  datePickerChange:function(e){
    var $this = this;
    //console.log(e);
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
  initCanvas:function(){
    var $this = this;
    var name = $this.data.permissionsData.name;
    var canvasDom = $this.data.canvasDom;
    var ctx = dd.createCanvasContext('canvas');
    ctx.setGlobalAlpha(0.05);
    ctx.setFontSize(14);
    ctx.translate(canvasDom.width/2, canvasDom.height/2);
    ctx.rotate(-30 * Math.PI / 180);
    ctx.fillText(name,-canvasDom.width/4,0);
    ctx.draw();
    ctx.toTempFilePath({
      success(res) {
        //console.log(res);
        dd.setStorage({
          key: 'waterMark',
          data: {
            filePath: res.filePath,
          },
          success: function() {
            $this.getInitData();
          }
        });
      },
      fail:(err)=>{
        //console.log(err);
      }
    });
  },
});
