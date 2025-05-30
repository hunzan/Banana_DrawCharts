  const tactileChartContainer = document.getElementById('tactileChartContainer');
  const pattern = patternomaly.draw(patternName, color);

  const colorMap = {
    '紅色': {
      color: '#FF0000',
      pattern: 'diagonal-right-left',
      patternLabel: '右斜線'
    },
    '黃色': {
      color: '#FFFF00',
      pattern: 'diagonal-left-right',
      patternLabel: '左斜線'
    },
    '藍色': {
      color: '#0000FF',
      pattern: 'zigzag-horizontal',
      patternLabel: '水平鋸齒'
    },
    '綠色': {
      color: '#008000',
      pattern: 'zigzag-vertical',
      patternLabel: '垂直鋸齒'
    },
    '橘色': {
      color: '#FFA500',
      pattern: 'dot',
      patternLabel: '點點'
    },
    '粉紅色': {
      color: '#FFC0CB',
      pattern: 'diamond',
      patternLabel: '菱形'
    },
    '紫色': {
      color: '#800080',
      pattern: 'triangle',
      patternLabel: '三角形'
    },
    '棕色': {
      color: '#A52A2A',
      pattern: 'square',
      patternLabel: '方塊'
    },
    '灰色': {
      color: '#808080',
      pattern: 'line-vertical',
      patternLabel: '直線'
    }
  };
    const patternLabels = {
    'diagonal-right-left': '右斜線',
    'diagonal-left-right': '左斜線',
    'zigzag-horizontal': '橫向鋸齒',
    'zigzag-vertical': '直向鋸齒',
    'dot': '點點',
    'diamond': '菱形',
    'triangle': '三角形',
    'square': '方形',
    'line-vertical': '直線'
  };