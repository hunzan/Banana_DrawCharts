# 🍌 Banana_DrawCharts

「**蕉圖表**」是一款輕量級、鍵盤友善的圖表產生器。使用者只需輸入標籤與數值，即可繪製多種類型的圖表。專案由林阿猴（定向行動訓練師）與金蕉共同開發，特別針對視障使用者設計，並支援螢幕閱讀器（如 NVDA）。

---

## 開發者  
Lîm Akâu（林阿猴） & KimTsio（金蕉）

---

## ✨ 功能特色

- ✅ 基於 Flask 的網頁應用，前後端結合  
- ✅ 完全鍵盤操作友善，適合視障者使用  
- ✅ 支援 11 種圖表類型：
  - 📊 直條圖（bar chart）
  - 📋 橫條圖（horizontal bar chart）
  - 🧱 堆疊直條圖（stacked bar chart）
  - 🧱 堆疊橫條圖（stacked horizontal bar chart）
  - 📉 折線圖（line chart）
  - 🏞️ 區域圖（area chart）
  - 🕸️ 雷達圖（radar chart）
  - 🔀 混合圖（line + bar chart）
  - 🍩 甜甜圈圖（doughnut chart）
  - 🥧 圓餅圖（pie chart）
  - 🧭 極區圖（polar area chart）
- ✅ 圖表可下載為 PNG 圖檔與 CSV 檔案  
- ✅ 支援 CSV 檔案上傳，自動載入子項目（X 軸）  
- ✅ 繪製與清除圖表時提供語音提示回饋（支援 NVDA）  

---

## 🧑‍🏫 使用方式

1. 啟動 Flask 伺服器，開啟瀏覽器並前往 `http://localhost:5000`  
2. 使用鍵盤（或滑鼠）輸入：
   - 圖表名稱、X 軸標籤（多筆以逗號或換行分隔）  
   - 多組資料項目（最多七項）  
   - Y 軸單位（可空白，適用於非數軸圖表）  
3. 選擇圖表類型，按下【繪製圖表】  
4. 可按【複製圖表】或【另存新檔】下載 PNG / CSV  

---

## ♿ 輔助功能支援

本專案特別考慮視障使用者需求：

- 🗣️ NVDA 可朗讀主要標題、操作按鈕與提示訊息  
- ⌨️ 首次按 Tab 鍵時，自動聚焦在【本工具使用說明】按鈕  
- 🔊 繪製與清除圖表時，會自動語音播報操作狀態  

---

## 📁 專案結構

```bash
Banana_DrawCharts/
├── app.py 
├── requirements.txt   
├── README.md 
├── static/  
│   ├── style.css
│   ├── app.js
│   ├── bananachart.ico
│   └── libs/ 
│       ├── chart.min.js
│       └── html2canvas.min.js
├── templates/
│   ├── index.html
│   └── csv_help.html  
```
🟢 如何開啟
若您使用 GitHub Pages（舊版純前端）：

👉 前往 Banana_DrawCharts 線上版
https://hunzan.github.io/Banana_DrawCharts/

若為本機使用（Flask 版本）：

克隆或下載本專案

安裝需求套件：

pip install -r requirements.txt
啟動 Flask 伺服器：
python app.py

開啟瀏覽器並前往 http://localhost:5000 開始使用

📜 版權與使用條款
本專案為免費軟體，僅供學術、教育與非營利用途。
禁止任何形式的商業利用。

© 2025 Lîm Akâu & KimTsio