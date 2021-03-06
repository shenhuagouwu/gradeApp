import F2 from '@antv/my-f2';
import methods from '../mixins/methods';
import util from '../util';

function render(chart, props, width, height) {
  if(!chart) {
    return;
  }
  const { categories, series, xAxis, yAxis, tooltip, legend } = props;

  chart.clear();

  let data = [];
  if(series.length === 1) {
    data = series[0].data.map((item, i) => {
      return {
        key: categories[i],
        value: item,
        type: series[0].type,
      }
    });
  }
  else if(series.length > 1) {
    series.forEach(kind => {
      data = data.concat(kind.data.map((item, i) => {
        return {
          key: categories[i],
          value: item,
          type: kind.type,
        };
      }));
    });
  }
  chart.source(data);

  if(xAxis) {
    if(xAxis.htAlign) {
      xAxis.label = util.label;
    }
    // chart.scale('key', util.scale(xAxis));
    chart.scale('key', {
      range: [0, 1],
      tickCount: 6,
    });
    // chart.axis('key', util.axis(xAxis));
    chart.axis('key',{
      label: function label(text,index,total) {
        const dateFont = text;
        const num = (dateFont.split("-")).length-1;
        var newDate = '';
        const cfg = {
          textAlign: 'center',
        };
        if(num == 1){
          newDate = dateFont.slice(2).replace(/-/g,'/');
        }else{
          var _date = new Date(dateFont);
          // getDay() 返回表示星期的某一天
          var nums = _date.getDay(_date),week;
          switch (nums) {
            case 0:
              week = "周日";
              break;
            case 1:
              week = "周一";
              break;
            case 2:
              week = "周二"
              break;
            case 3:
              week = "周三"
              break;
            case 4:
              week = "周四"
              break;
            case 5:
              week = "周五"
              break;
            case 6:
              week = "周六"
              break;
            default:
              break;
          };
          newDate = dateFont.slice(5).replace(/-/g,'/')+'\n'+week;
        }
        cfg.text = newDate;
        return cfg;
      }
    });
  }
  if(yAxis) {
    chart.axis('value', {
      label: function label(text) {
        var number = '';
        if(text.indexOf('.') == -1){
          number = text;
        }else{
          var a = Math.floor(parseFloat(text) * 100) / 100;
          if(a.toString().indexOf('.00') == -1){
            number = a;
          }else{
            number = parseInt(a);
          }
        }
        const cfg = {};
        cfg.text = number;
        return cfg;
      }
    });
    // chart.scale('value', util.scale(yAxis));
    chart.scale('value', {
      min:0,
      tickCount: 5,
    });
    // chart.axis('value', util.axis(yAxis));
  }
  if(tooltip){
    chart.tooltip({
      showTitle: true,
      showCrosshairs: true,
      showItemMarker: false,
      crosshairsStyle: {
        stroke: '#7B74FD',
        lineWidth: 1
      },
      background: {
        fill: '#FFF'
      },
      onChange(e) {
        if (props.onTooltipChange) {
          props.onTooltipChange(e)
        }
      }
    });
    setTimeout(()=>{
      if(tooltip.def_item){
        var item = tooltip.def_item;
        var point = chart.getPosition(item);
        chart.showTooltip(point);
      }
    },500)
  }else{
    chart.tooltip(false)
  }
  chart.legend(false);
  const style = {};
  series.forEach(kind => {
    style[kind.type] = kind.style;
  });
  const color = {};
  series.forEach(kind => {
    color[kind.type] = kind.color;
  });

  if(series.length === 1) {
    chart.line().size(1).position('key*value').color('type', type => {
      return color[type];
    }).shape('type', type => {
      return style[type] || 'line';
    });
    if(series[0].point) {
      chart.point().position('key*value').style(series[0].point);
    }
  }
  else if(series.length > 1) {
    chart.line().size(1).position('key*value').color('type', type => {
      return color[type];
    }).shape('type', type => {
      return style[type] || 'line';
    });
    let pointType = [];
    let pointStyle;
    series.forEach(kind => {
      if(kind.point) {
        pointType.push(kind.type);
        pointStyle = kind.point;
      }
    });
    if(pointType.length) {
      chart.point().position('key*value').color('type', type => {
        return color[type];
      }).size('type', v => {
        if(pointType.indexOf(v) === -1) {
          return 0;
        }
      }).style(pointStyle);
    }
  }

  chart.changeSize(width, height);
}

function strLen(str) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
      len++;
    } else {
      len += 2;
    }
  }
  return len;
}
F2.Util.measureText = function (text, font) {
  let fontSize = 12;
  if (font) {
    fontSize = parseInt(font.split(' ')[3], 10);
  }
  fontSize /= 2;
  return {
    width: strLen(text) * fontSize,
  };
};

Component({
  mixins: [methods],
  props: {
    categories: [],
    series: [],
    xAxis: {
      tickCount: 3,
    },
    yAxis: {
      tickCount: 3,
    },
    tooltip: false,
    legend: false,
  },
  didMount() {
    my.call('getStartupParams', {}, (result) => {
      util.tracert('line', result.appId, result.url);
    });

    const id = `am-mc-line-${this.$id}`;
    const ctx = this.ctx = my.createCanvasContext(id);
    const canvas = this.canvas = new F2.Renderer(ctx);

    const pixelRatio = this.pixelRatio = my.getSystemInfoSync().pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);

    my.createSelectorQuery()
      .select(`#${id}`)
      .boundingClientRect()
      .exec(res => {
        if(!res || !res.length || !res[0]) {
          return;
        }
        const { width, height } = res[0];

        this.setData({
          width: width * pixelRatio,
          height: height * pixelRatio,
        }, () => {
          const { padding, appendPadding } = this.props;

          this.chart = new F2.Chart({
            el: canvas,
            width,
            height,
            padding,
            appendPadding,
          });

          render(this.chart, this.props, width, height);
        });
      });
  },
  didUpdate() {
    const id = `am-mc-line-${this.$id}`;
    const pixelRatio = this.pixelRatio;

    my.createSelectorQuery()
      .select(`#${id}`)
      .boundingClientRect()
      .exec(res => {
        if(!res || !res.length || !res[0]) {
          return;
        }
        const { width, height } = res[0];
        if(this.data.width !== width * pixelRatio || this.data.height !== height * pixelRatio) {
          this.ctx.scale(pixelRatio, pixelRatio);
        }

        this.setData({
          width: width * pixelRatio,
          height: height * pixelRatio,
        }, () => {
          render(this.chart, this.props, width, height);
        });
      });
  },
});
