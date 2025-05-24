document.addEventListener('DOMContentLoaded', function () {
  let itemCount = 0;
  let myChart = null;

  const chartTitleInput = document.getElementById('chartTitle');
  const copyBtn = document.getElementById('copyBtn');
  const xLabelsInput = document.getElementById('xLabels');
  const xAxisLabelInput = document.getElementById('xLabel');
  const yAxisLabelInput = document.getElementById('yLabel');
  const chartTypeSelect = document.getElementById('chartType');
  const addItemBtn = document.getElementById('addItemBtn');
  const drawChartBtn = document.getElementById('drawChartBtn');
  const clearChartBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadFormat = document.getElementById('downloadFormat');
  const chartCanvas = document.getElementById('myChart');
  const itemsContainer = document.getElementById('itemsSection');

  const colorMap = {
    '紅色': '#FF0000',
    '黃色': '#FFFF00',
    '藍色': '#0000FF',
    '綠色': '#008000',
    '橘色': '#FFA500',
    '粉紅色': '#FFC0CB',
    '紫色': '#800080',
    '棕色': '#A52A2A',
    '灰色': '#808080'
  };

  function createItemInputs(index) {
    const colors = Object.keys(colorMap);
    const colorOptions = colors.map(color => `<option value="${color}">${color}</option>`).join('');

    const div = document.createElement('div');
    div.classList.add('item-group');
    div.innerHTML = `
      <fieldset>
        <legend>項目 ${index}</legend>
        <label for="itemName${index}">名稱：</label>
        <input type="text" id="itemName${index}" aria-label="項目 ${index} 名稱" placeholder="例如：產品A">

        <label for="itemColor${index}">顏色：</label>
        <select id="itemColor${index}" aria-label="項目 ${index} 顏色">${colorOptions}</select>

        <label for="itemValues${index}">數值（請用逗號或換行分隔，數量需和 X 軸標籤相同）：</label>
        <textarea id="itemValues${index}" aria-label="項目 ${index} 數值輸入" rows="2" placeholder="例如：10, 20, 30"></textarea>
      </fieldset>
    `;
    return div;
  }

  addItemBtn.addEventListener('click', function () {
    if (itemCount >= 5) {
      alert('最多只能新增 5 個項目！');
      return;
    }
    itemCount++;
    const itemInputs = createItemInputs(itemCount);
    itemsContainer.appendChild(itemInputs);
    const nameInput = itemInputs.querySelector(`#itemName${itemCount}`);
    if (nameInput) nameInput.focus();
  });

  drawChartBtn.addEventListener('click', drawChart);

  function drawChart() {
    const rawLabels = xLabelsInput.value.trim();
    if (!rawLabels) return alert('請輸入 X 軸標籤');

    const labels = rawLabels.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!labels.length) return alert('X 軸標籤不能為空');

    const datasets = [];
    for (let i = 1; i <= itemCount; i++) {
      const name = document.getElementById(`itemName${i}`).value.trim();
      const colorName = document.getElementById(`itemColor${i}`).value;
      const color = colorMap[colorName] || '#000000';
      const rawValues = document.getElementById(`itemValues${i}`).value.trim();

      if (!name) return alert(`項目 ${i} 名稱未填`);
      if (!rawValues) return alert(`項目 ${i} 數值未填`);

      const values = rawValues.split(/[\n,]+/).map(v => parseFloat(v.trim()));
      if (values.length !== labels.length) return alert(`項目 ${i} 的數值數量 (${values.length}) 與 X 軸標籤數量 (${labels.length}) 不符`);
      if (values.some(v => isNaN(v))) return alert(`項目 ${i} 數值格式錯誤`);

      datasets.push({
        label: name,
        data: values,
        backgroundColor: color,
        borderColor: color,
        fill: chartTypeSelect.value === 'line' ? false : true,
        tension: chartTypeSelect.value === 'line' ? 0.3 : 0
      });
    }

    if (!datasets.length) return alert('請新增至少一個項目');

    const chartType = chartTypeSelect.value;
    const chartTitle = chartTitleInput.value;
    const xLabel = xAxisLabelInput.value;
    const yLabel = yAxisLabelInput.value;

    if (myChart) myChart.destroy();

    const chartCanvas = document.getElementById('myChart');
    chartCanvas.width = 600;   // 自訂寬度
    chartCanvas.height = 400;  // 自訂高度

    myChart = new Chart(chartCanvas, {
      type: chartType === 'horizontalBar' ? 'bar' : chartType,
      data: { labels, datasets },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        indexAxis: chartType === 'horizontalBar' ? 'y' : 'x',
        scales: {
          x: {
            title: { display: true, text: xLabel },
            beginAtZero: true,
            ticks: { font: { size: 20 } }
          },
          y: {
            title: { display: true, text: yLabel },
            beginAtZero: true,
            ticks: { font: { size: 20 } }
          }
        },
        plugins: {
          title: {
            display: !!chartTitle,
            text: chartTitle,
            font: { size: 28 }
          },
          legend: {
            display: true,
            position: 'top',
            labels: { font: { size: 20 } }
          }
        }
      }
    });
    document.getElementById('liveRegion').textContent = '圖表已繪製完成';
  }

  clearChartBtn.addEventListener('click', function () {
    if (myChart) {
      myChart.destroy();
      myChart = null;
    }
    chartTitleInput.value = '';
    xLabelsInput.value = '';
    xAxisLabelInput.value = '';
    yAxisLabelInput.value = '';
    chartTypeSelect.value = 'bar';
    itemsContainer.innerHTML = '';
    itemCount = 0;
    document.getElementById('liveRegion').textContent = '圖表已清除';
  });

downloadBtn.addEventListener('click', function () {
  const format = downloadFormat.value;
  if (format === 'jpg') {
    html2canvas(chartCanvas).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg');
      const link = document.createElement('a');
      link.download = 'chart.jpg';
      link.href = imgData;
      link.click();
    });
  } else if (format === 'csv') {
    const labels = xLabelsInput.value.trim().split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!labels.length) return alert('請輸入 X 軸標籤');

    const data = buildCSVData(labels);
    if (!data) return;

    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chart.csv';
    link.click();
  }
});

// 複製按鈕
copyBtn.addEventListener('click', function () {
  const labels = xLabelsInput.value.trim().split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  if (!labels.length) return alert('請輸入 X 軸標籤');

  const data = buildCSVData(labels);
  if (!data) return;

  navigator.clipboard.writeText(data)
    .then(() => alert('資料已複製到剪貼簿'))
    .catch(err => {
      console.error('Clipboard API 錯誤', err);
      alert('複製失敗，請確認瀏覽器支援 Clipboard API');
    });
});

function buildCSVData(labels) {
  let csvContent = '項目名稱,' + labels.join(',') + '\n';
  for (let i = 1; i <= itemCount; i++) {
    const name = document.getElementById(`itemName${i}`).value.trim();
    const rawValues = document.getElementById(`itemValues${i}`).value.trim();
    const values = rawValues.split(/[\n,]+/).map(v => v.trim());
    if (!name || values.length !== labels.length || values.some(v => isNaN(parseFloat(v)))) {
      alert(`項目 ${i} 的資料不完整或格式錯誤`);
      return null;
    }
    csvContent += name + ',' + values.join(',') + '\n';
  }
  return csvContent;
}

function downloadCSV(csvData, filename) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (navigator.msSaveBlob) {
    // For IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
});
