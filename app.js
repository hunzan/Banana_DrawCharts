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

  // 綁定事件才會觸發開啟視窗，不要放在全域就呼叫 click()
document.getElementById('csvButton').addEventListener('click', () => {
  document.getElementById('csvInput').click();
})
document.getElementById('csvInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const content = event.target.result.trim();
    const lines = content.split(/\r?\n/);

    if (lines.length < 2) {
      alert('CSV格式錯誤，資料行不足');
      return;
    }

    // 解析標題列（第一列）
    const headers = lines[0].split(',');
    if (headers.length < 2) {
      alert('CSV格式錯誤，欄位數不足');
      return;
    }

    // 填入X軸標籤，去除第一欄（項目名稱）
    const xLabels = headers.slice(2).join('\n');
    xLabelsInput.value = xLabels;

    // 清空現有項目區
    itemsContainer.innerHTML = '';
    itemCount = 0;

    // 從第二列開始處理各項目資料
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');

      if (cols.length < 3) {
        alert(`第 ${i+1} 行欄位數不足（需含名稱、顏色、數值）`);
        return;
      }

      itemCount++;
      const itemDiv = createItemInputs(itemCount);
      itemsContainer.appendChild(itemDiv);

      // 填入項目名稱
      const nameInput = document.getElementById(`itemName${itemCount}`);
      if (nameInput) nameInput.value = cols[0];

      // 填入顏色
      const colorInput = document.getElementById(`itemColor${itemCount}`);
      if (colorInput) {
        const colorValue = cols[1].trim();
        colorInput.value = colorValue;
      }

        // 填入數值（從第3欄開始）
        const valuesInput = document.getElementById(`itemValues${itemCount}`);
        if (valuesInput) {
          const values = cols.slice(2).join(', ');
          valuesInput.value = values;
        }
      }
    };

    reader.readAsText(file); // ← 這一行移進 onload 裡面結尾外面，這才正確
  });

  function getLabels() {
  return xLabelsInput.value.trim().split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
}

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
    div.setAttribute('data-index', index); // 用於辨識要刪哪一組

    div.innerHTML = `
      <fieldset>
        <legend>項目 ${index}</legend>
        <label for="itemName${index}">名稱：</label>
        <input type="text" id="itemName${index}" aria-label="項目 ${index} 名稱" placeholder="例如：產品A">
  
        <label for="itemColor${index}">顏色：</label>
        <select id="itemColor${index}" aria-label="項目 ${index} 顏色">${colorOptions}</select>
  
        <label for="itemValues${index}">數值（請用逗號或換行分隔，數量需和 X 軸標籤相同）：</label>
        <textarea id="itemValues${index}" aria-label="項目 ${index} 數值輸入" rows="2" placeholder="例如：10, 20, 30"></textarea>
  
        <button type="button" class="remove-item-btn" aria-label="刪除項目 ${index}">❌ 刪除此項</button>
      </fieldset>
    `;
    return div;
  }

  addItemBtn.addEventListener('click', function () {
  if (itemCount >= 7) {
    alert('最多只能新增 7 個項目！');
    return;
  }
  itemCount++;
  const itemInputs = createItemInputs(itemCount);
  itemsContainer.appendChild(itemInputs);
  const nameInput = itemInputs.querySelector(`#itemName${itemCount}`);
  if (nameInput) nameInput.focus();
});

  itemsContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('remove-item-btn')) {
    const itemGroup = e.target.closest('.item-group');
    if (itemGroup) {
      itemGroup.remove();
      itemCount--; // 讓 itemCount 維持在正確數量（注意：這樣不會重編 index）
      updateItemLegends(); // 重新編號顯示
    }
  }
});

  function updateItemLegends() {
    const allGroups = itemsContainer.querySelectorAll('.item-group');
    allGroups.forEach((group, idx) => {
      const legend = group.querySelector('legend');
      if (legend) legend.textContent = `項目 ${idx + 1}`;
    });
  }

  drawChartBtn.addEventListener('click', drawChart);

  function drawChart() {
    const rawLabels = xLabelsInput.value.trim();
    if (!rawLabels) return alert('請輸入 X 軸標籤');

    const labels = rawLabels.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    if (!labels.length) return alert('X 軸標籤不能為空');

    const chartType = chartTypeSelect.value;
    const chartTitle = chartTitleInput.value;
    const xLabel = xAxisLabelInput.value;
    const yLabel = yAxisLabelInput.value;

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

      // 決定 dataset 的型別（混合圖要個別指定 type）
      const dataset = {
        label: name,
        data: values,
        backgroundColor: chartType === 'line' || chartType === 'area' ? hexToRGBA(color, 0.3) : color,
        borderColor: color,
        tension: chartType === 'line' || chartType === 'area' ? 0.3 : 0,
        fill: chartType === 'area'
      };

      if (chartType === 'mixed') {
        dataset.type = i % 2 === 0 ? 'bar' : 'line';
      }

      datasets.push(dataset);
    }

    if (!datasets.length) return alert('請新增至少一個項目');

    if (myChart) myChart.destroy();

    const chartCanvas = document.getElementById('myChart');
    chartCanvas.width = 600;
    chartCanvas.height = 400;

    const realType = chartType === 'area' ? 'line'
                      : chartType === 'horizontalBar' ? 'bar'
                      : chartType === 'mixed' ? 'bar' // 主要 type 為 bar，dataset 內再各別指定
                      : chartType;

    const options = {
      responsive: false,
      maintainAspectRatio: false,
      indexAxis: chartType === 'horizontalBar' ? 'y' : 'x',
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
    };

    // 雷達圖不需要 indexAxis 和 scales
    if (realType !== 'radar') {
      options.scales = {
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
      };
    }

    myChart = new Chart(chartCanvas, {
      type: realType,
      data: { labels, datasets },
      options
    });

    document.getElementById('liveRegion').textContent = '圖表已繪製完成';
  }

  // 補：透明色用
  function hexToRGBA(hex, alpha = 0.3) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    const labels = getLabels();
    const format = downloadFormat.value;
    if (format === 'png') {
      html2canvas(chartCanvas).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'chart.png';
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
  copyBtn.addEventListener('click', async function () {
    const canvas = document.getElementById('myChart');
    if (!canvas) return alert('找不到圖表');

    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('產生圖片失敗');

      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      alert('PNG 圖已複製到剪貼簿');
    } catch (err) {
      console.error('Clipboard API 錯誤', err);
      alert('複製失敗，請確認瀏覽器支援 Clipboard API 並允許權限');
    }
  });

  function buildCSVData(labels) {
    let csvContent = '項目名稱,顏色,' + labels.join(',') + '\n';  // 多加「顏色」

    for (let i = 1; i <= itemCount; i++) {
      const name = document.getElementById(`itemName${i}`).value.trim();
      const color = document.getElementById(`itemColor${i}`).value.trim();  // 抓顏色
      const rawValues = document.getElementById(`itemValues${i}`).value.trim();
      const values = rawValues.split(/[\n,]+/).map(v => v.trim());

      if (!name || !color || values.length !== labels.length || values.some(v => isNaN(parseFloat(v)))) {
        alert(`項目 ${i} 的資料不完整或格式錯誤`);
        return null;
      }

      csvContent += name + ',' + color + ',' + values.join(',') + '\n';  // 加上顏色
    }

    return csvContent;
  }

  const exportBtn = document.getElementById('exportCSVButton');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const labelsRaw = document.getElementById('xLabels').value.trim();
      const labels = labelsRaw.split(/[\n,]+/).map(s => s.trim()).filter(s => s);

      const csvData = buildCSVData(labels);
      if (csvData) {
        downloadCSV(csvData, '資料.csv');
      }
    });
  } else {
    console.warn('找不到 exportCSVButton，略過匯出 CSV 綁定');
  }

  // 監聽 csvInput 的檔案變化事件
  document.getElementById('csvInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      parseAndLoadCSV(content);
    };
    reader.readAsText(file, 'utf-8');
  });

  // 解析 CSV，填入欄位，並更新圖表
  function parseAndLoadCSV(content) {
    const lines = content.trim().split('\n').map(line => line.split(',').map(cell => cell.trim()));
    if (lines.length < 2) {
      alert('CSV 資料不足，無法載入。');
      return;
    }

    // 第一行是 x 標籤（去掉 "項目名稱" 和 "顏色"）
    const xLabels = lines[0].slice(2);
    document.getElementById('xLabels').value = xLabels.join('\n');

    // 清除原本資料欄位（假設 itemContainer 包裹輸入欄）
    const container = document.getElementById('itemContainer');
    container.innerHTML = '';

    for (let i = 1; i < lines.length; i++) {
      const [name, color, ...values] = lines[i];
      const itemIndex = i;

      const nameInput = document.createElement('input');
      nameInput.id = `itemName${itemIndex}`;
      nameInput.value = name;
      nameInput.placeholder = `項目名稱 ${itemIndex}`;

      const colorInput = document.createElement('input');
      colorInput.id = `itemColor${itemIndex}`;
      colorInput.type = 'color';
      colorInput.value = color || '#000000';  // fallback 一個黑色

      const valueInput = document.createElement('textarea');
      valueInput.id = `itemValues${itemIndex}`;
      valueInput.value = values.join('\n');
      valueInput.placeholder = `項目數值 ${itemIndex}`;

      const div = document.createElement('div');
      div.appendChild(nameInput);
      div.appendChild(colorInput);
      div.appendChild(valueInput);

      container.appendChild(div);
    }

    itemCount = lines.length - 1; // 更新項目數量
    updateChart(); // 重繪圖表
  }

  // 讀取 xLabels 與 item 資料，並更新 Chart.js
  function updateChart() {
    const labelsRaw = document.getElementById('xLabels').value.trim();
    const labels = labelsRaw.split(/[\n,]+/).map(s => s.trim()).filter(s => s);

    const datasets = [];
    for (let i = 1; i <= itemCount; i++) {
      const name = document.getElementById(`itemName${i}`).value.trim();
      const rawValues = document.getElementById(`itemValues${i}`).value.trim();
      const color = document.getElementById(`itemColor${i}`).value.trim(); // 讀取顏色 ✅

      const values = rawValues.split(/[\n,]+/).map(v => parseFloat(v));

      if (name && values.length === labels.length && !values.some(isNaN)) {
        datasets.push({
          label: name,
          data: values,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: color + '44', // 適合折線圖 hover 時出現淡色背景
          pointBackgroundColor: color,
          pointBorderColor: color,
          fill: false,
        });
      }
    }

    if (chart) {
      chart.data.labels = labels;
      chart.data.datasets = datasets;
      chart.update();
    } else {
      console.warn('Chart.js 物件尚未初始化');
    }
  }

  // 產生隨機顏色的輔助函式
  function getRandomColor() {
    const r = Math.floor(Math.random() * 200) + 30;
    const g = Math.floor(Math.random() * 200) + 30;
    const b = Math.floor(Math.random() * 200) + 30;
    return `rgb(${r}, ${g}, ${b})`;
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
  })

  window.addEventListener('DOMContentLoaded', () => {
    const csvHelpBtn = document.getElementById('csvHelpBtn');
    if (csvHelpBtn) {
      csvHelpBtn.addEventListener('click', () => {
        window.open('csv_help.html', '_blank', 'width=600,height=400,resizable=yes');
      });
    }
  });
