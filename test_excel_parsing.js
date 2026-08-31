import * as XLSX from 'xlsx';
import { ASSET_TEMPLATE } from './src/constants/masterData.js';
import { matchAssetId, extractNumber } from './test_parser_lib.js';

function parseWorkbook(workbook) {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) return { mapped: [], totalRows: 0 };

  const mappedMap = {};

  // Check for tabular header row (look in first 5 rows)
  let headerRowIdx = -1;
  let nameColIdx = -1;
  let amountColIdx = -1;
  let customNameColIdx = -1;

  for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    let foundName = -1;
    let foundAmount = -1;
    let foundCustom = -1;

    row.forEach((cell, cIdx) => {
      const txt = String(cell).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (txt.includes('asset') || txt.includes('holding') || txt.includes('scheme') || txt.includes('fund') || txt.includes('name') || txt.includes('instrument')) {
        if (txt.includes('custom') || txt.includes('yourfund') || txt.includes('actual') || txt.includes('bank')) {
          foundCustom = cIdx;
        } else if (foundName === -1) {
          foundName = cIdx;
        }
      }
      if (txt.includes('amount') || txt.includes('value') || txt.includes('invested') || txt.includes('balance') || txt.includes('current')) {
        if (foundAmount === -1 && !txt.includes('sip') && !txt.includes('monthly')) {
          foundAmount = cIdx;
        }
      }
    });

    if (foundName !== -1 && foundAmount !== -1) {
      headerRowIdx = r;
      nameColIdx = foundName;
      amountColIdx = foundAmount;
      customNameColIdx = foundCustom !== -1 ? foundCustom : foundName;
      break;
    }
  }

  // MODE A: Standard Tabular Mode (100% precise row-by-row mapping)
  if (headerRowIdx !== -1 && nameColIdx !== -1 && amountColIdx !== -1) {
    console.log(`[Parser] Detected Tabular Mode: Header at Row ${headerRowIdx}, NameCol=${nameColIdx}, AmountCol=${amountColIdx}`);
    for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!Array.isArray(row) || row.length === 0) continue;

      const cellName = String(row[nameColIdx] || '').trim();
      const cellCustom = customNameColIdx !== -1 ? String(row[customNameColIdx] || '').trim() : '';
      const cellAmount = extractNumber(row[amountColIdx]);

      // If name cell is empty, check other text cells in the row
      let matchedId = matchAssetId(cellName);
      if (!matchedId && cellCustom) {
        matchedId = matchAssetId(cellCustom);
      }
      if (!matchedId) {
        for (let c = 0; c < row.length; c++) {
          if (c !== amountColIdx) {
            matchedId = matchAssetId(String(row[c]));
            if (matchedId) break;
          }
        }
      }

      if (matchedId && cellAmount > 0) {
        const template = ASSET_TEMPLATE.find(t => t.id === matchedId);
        const displayName = cellCustom || cellName || template.name;
        if (!mappedMap[matchedId]) {
          mappedMap[matchedId] = {
            id: matchedId,
            name: displayName,
            category: template.cat,
            amount: cellAmount,
            rowNumber: r + 1
          };
        } else {
          mappedMap[matchedId].amount += cellAmount;
          if (displayName && displayName !== mappedMap[matchedId].name) {
            mappedMap[matchedId].name = `${mappedMap[matchedId].name} / ${displayName}`;
          }
        }
      }
    }
  } else {
    // MODE B: Freeform / Multi-Column Dashboard Mode (scan entire sheet with cell-lock to prevent double-counting)
    console.log(`[Parser] Detected Freeform / Multi-Column Dashboard Mode`);
    rawRows.forEach((row, rIdx) => {
      if (!Array.isArray(row) || row.length === 0) return;

      const usedCols = new Set();

      for (let c = 0; c < row.length; c++) {
        if (usedCols.has(c)) continue;
        const cellValue = String(row[c] || '').trim();
        if (!cellValue) continue;

        const matchedId = matchAssetId(cellValue);
        if (matchedId) {
          // Look for adjacent numeric amount
          let foundAmount = 0;
          let amountCol = -1;

          for (let k = c + 1; k < Math.min(row.length, c + 5); k++) {
            if (usedCols.has(k)) continue;
            const num = extractNumber(row[k]);
            if (num > 0) {
              foundAmount = num;
              amountCol = k;
              break;
            }
          }

          if (foundAmount > 0 && amountCol !== -1) {
            usedCols.add(c);
            usedCols.add(amountCol);

            const template = ASSET_TEMPLATE.find(t => t.id === matchedId);
            if (!mappedMap[matchedId]) {
              mappedMap[matchedId] = {
                id: matchedId,
                name: template.name,
                category: template.cat,
                amount: foundAmount,
                rowNumber: rIdx + 1
              };
            } else {
              mappedMap[matchedId].amount += foundAmount;
            }
          }
        }
      }
    });
  }

  const mapped = Object.values(mappedMap);
  return { mapped, totalRows: rawRows.length };
}

import * as fs from 'fs';

// Test against GRDE_Master_Google_Sheets_Template.xlsx
const fileBuf = fs.readFileSync('c:/Users/Admin/Desktop/learning/GRDE_Master_Google_Sheets_Template.xlsx');
const templateWb = XLSX.read(fileBuf, { type: 'buffer' });
const templateResult = parseWorkbook(templateWb);
console.log("\n=== TEMPLATE PARSING RESULTS ===");
console.log(`Recognized: ${templateResult.mapped.length} / 18 assets`);
console.log("Total Amount:", templateResult.mapped.reduce((s, a) => s + a.amount, 0));
templateResult.mapped.forEach(m => {
  console.log(`- [${m.category}] ${m.id} (${m.name}): ₹${m.amount.toLocaleString('en-IN')}`);
});
