// Excel exporter: builds a Data Input_KPI-style sheet plus a Summary sheet
// and embeds the live chart as a PNG image. Uses ExcelJS (loaded via CDN).

window.exportExcel = async function(state, results) {
  if (!window.ExcelJS) {
    alert("ExcelJS failed to load. Check your internet connection.");
    return;
  }
  const wb = new ExcelJS.Workbook();
  wb.creator = 'KPI M&E Tool';
  wb.created = new Date();

  // ---------- Sheet 1: Summary ----------
  const sumSheet = wb.addWorksheet('Summary');
  const meta = state.meta || {};
  sumSheet.columns = [
    { header: 'Field', key: 'field', width: 36 },
    { header: 'Value', key: 'value', width: 50 },
  ];
  sumSheet.addRows([
    { field: 'Utility / Service Provider',         value: meta.utility || '' },
    { field: 'Municipality',                       value: meta.municipality || '' },
    { field: 'Province / District',                value: meta.province || '' },
    { field: 'Service Area Type (urban/rural)',    value: meta.areaType || 'urban' },
    { field: 'Performance Evaluation Year',        value: meta.year || '' },
    { field: 'Submitted by',                       value: meta.submittedBy || '' },
    { field: 'Submission date',                    value: new Date().toISOString().slice(0,10) },
    { field: '', value: '' },
    { field: 'Category A average (Service Level & Quality, %)', value: results.catAAvg },
    { field: 'Category B average (O&M Efficiency, %)',          value: results.catBAvg },
    { field: 'Career-Path Classification',                       value: results.zone?.name || '' },
  ]);
  sumSheet.getRow(1).font = { bold: true };
  sumSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };

  // ---------- Sheet 2: Data Input_KPI (mirrors xlsm headers, but per docx) ----------
  const ds = wb.addWorksheet('Data Input_KPI');
  ds.columns = [
    { header: 'KPI No.',         key: 'kpiNo',   width: 8 },
    { header: 'Key Performance Indicator', key: 'kpiName', width: 32 },
    { header: 'Subset',          key: 'subId',   width: 8 },
    { header: 'Subset Name',     key: 'subName', width: 32 },
    { header: 'Question / Statement', key: 'q',  width: 60 },
    { header: 'Unit',            key: 'unit',    width: 10 },
    { header: 'Data',            key: 'data',    width: 14 },
    { header: 'Subset Score (%)',key: 'sScore',  width: 14 },
    { header: 'Subset Weight',   key: 'sWeight', width: 12 },
    { header: 'KPI Score (%)',   key: 'kpiScore',width: 12 },
  ];
  ds.getRow(1).font = { bold: true };
  ds.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };

  const sectionRow = (title, color) => {
    const r = ds.addRow({ kpiNo: title });
    ds.mergeCells(`A${r.number}:J${r.number}`);
    r.font = { bold: true };
    r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
  };

  sectionRow('CATEGORY A: LEVEL AND QUALITY OF WATER SUPPLY SERVICE', 'FFFFE699');

  const writeKpi = (kpi, kpiResult) => {
    const kpiVals = state.kpiVals?.[kpi.id] || {};
    let firstRowOfKpi = true;
    for (const sub of kpi.subsets) {
      const subRes = kpiResult.subsets.find(s => s.id === sub.id);
      let firstRowOfSub = true;
      for (const inp of sub.inputs) {
        const dataVal = kpiVals[sub.id]?.[inp.id] ?? '';
        const row = ds.addRow({
          kpiNo:    firstRowOfKpi ? kpi.id : '',
          kpiName:  firstRowOfKpi ? kpi.name : '',
          subId:    firstRowOfSub ? sub.id : '',
          subName:  firstRowOfSub ? sub.name : '',
          q:        inp.label,
          unit:     inp.unit || '',
          data:     dataVal,
          sScore:   firstRowOfSub ? subRes?.score ?? '' : '',
          sWeight:  firstRowOfSub ? sub.weight : '',
          kpiScore: firstRowOfKpi ? kpiResult.score : '',
        });
        if (firstRowOfKpi) {
          row.font = { bold: true };
        }
        firstRowOfKpi = false;
        firstRowOfSub = false;
      }
    }
  };

  for (const kpi of window.KPI_CONFIG) {
    if (kpi.category !== 'A') continue;
    const kpiResult = results.kpis.find(k => k.id === kpi.id);
    writeKpi(kpi, kpiResult);
  }
  // Cat A average
  const aAvgRow = ds.addRow({ kpiNo:'', kpiName:'Category A Average (%)', kpiScore: results.catAAvg });
  aAvgRow.font = { bold: true };
  aAvgRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };

  sectionRow('CATEGORY B: OPERATIONAL AND MANAGEMENT EFFICIENCY', 'FFC6EFCE');

  let currentSubcat = null;
  for (const kpi of window.KPI_CONFIG) {
    if (kpi.category !== 'B') continue;
    if (kpi.subcat && kpi.subcat !== currentSubcat) {
      currentSubcat = kpi.subcat;
      sectionRow(`Subcategory: ${currentSubcat}`, 'FFE2EFDA');
    }
    const kpiResult = results.kpis.find(k => k.id === kpi.id);
    writeKpi(kpi, kpiResult);
  }
  const bAvgRow = ds.addRow({ kpiNo:'', kpiName:'Category B Average (%)', kpiScore: results.catBAvg });
  bAvgRow.font = { bold: true };
  bAvgRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };

  ds.eachRow({ includeEmpty: false }, (row) => {
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        top:    { style:'thin', color:{argb:'FFBFBFBF'} },
        left:   { style:'thin', color:{argb:'FFBFBFBF'} },
        bottom: { style:'thin', color:{argb:'FFBFBFBF'} },
        right:  { style:'thin', color:{argb:'FFBFBFBF'} },
      };
    });
  });

  // ---------- Sheet 3: Career Path Chart (image) ----------
  const chartSheet = wb.addWorksheet('Career Path Chart');
  chartSheet.getCell('A1').value = 'Service Provider Career Path';
  chartSheet.getCell('A1').font = { bold: true, size: 14 };
  chartSheet.getCell('A2').value = `Cat A (Service): ${results.catAAvg}%   Cat B (O&M): ${results.catBAvg}%   Position: ${results.zone?.name || '-'}`;

  const dataUrl = window.getChartImageDataUrl?.();
  if (dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const imageId = wb.addImage({ base64, extension: 'png' });
    chartSheet.addImage(imageId, {
      tl: { col: 0, row: 4 },
      ext: { width: 800, height: 500 }
    });
  } else {
    chartSheet.getCell('A4').value = '(Chart image unavailable - render it in the browser first)';
  }

  // ---------- Save ----------
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const utility = (state.meta?.utility || 'utility').replace(/[^\w\-]+/g,'_');
  const year = state.meta?.year || new Date().getFullYear();
  const fname = `KPI_Report_${utility}_${year}.xlsx`;
  window.downloadBlob(blob, fname);
};

window.exportChartPNG = function(state) {
  const url = window.getChartImageDataUrl?.();
  if (!url) { alert('Chart not rendered yet'); return; }
  fetch(url).then(r => r.blob()).then(blob => {
    const utility = (state.meta?.utility || 'utility').replace(/[^\w\-]+/g,'_');
    const year = state.meta?.year || new Date().getFullYear();
    window.downloadBlob(blob, `CareerPath_${utility}_${year}.png`);
  });
};

window.exportJSON = function(state, results) {
  const payload = { meta: state.meta, inputs: state.kpiVals, results,
                    exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const utility = (state.meta?.utility || 'utility').replace(/[^\w\-]+/g,'_');
  const year = state.meta?.year || new Date().getFullYear();
  window.downloadBlob(blob, `KPI_Data_${utility}_${year}.json`);
};
