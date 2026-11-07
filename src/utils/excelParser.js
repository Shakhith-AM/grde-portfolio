import * as XLSX from 'xlsx';
import { ASSET_TEMPLATE } from '../constants/masterData';

// Prioritized keyword dictionary mapped to October 2026 GRDE asset IDs
export const ASSET_KEYWORDS = {
  // G — Gold (G1–G3 Strategic)
  g_sgb:    ['sgb', 'sovereign gold', 'sovereign gold bond'],
  g_phys:   ['physical gold', 'gold coin', 'gold bar', 'bullion'],
  g_gold:   ['gold', 'goldbees', 'gold bees', 'gldm', 'nippon gold', 'hdfc gold', 'icici gold', 'sbi gold'],

  // R — Real Estate / REITs & InvITs
  r_dc_legacy: ['data centre', 'data center', 'dc reit', 'datacentre'],
  r_nexus:  ['nexus', 'retail reit', 'mall reit', 'nexus select'],
  r_krt:    ['krt', 'brookfield', 'embassy', 'office reit b', 'office reit (b)'],
  r_mind:   ['mindspace', 'mind space', 'office reit a', 'office reit (a)', 'office reit'],
  r_indi:   ['indigrid', 'power invit', 'transmission', 'indi grid', 'india grid'],
  r_irb:    ['irb', 'irbinv', 'highways', 'road invit', 'pginvit', 'toll'],

  // D — Debt & Defensive Assets (D1–D4)
  d_dyn:    ['dynamic bond', 'nippon dynamic', 'duration bond fund'],
  d_liq:    ['jio', 'balckrock', 'blackrock', 'liquid', 'overnight', 'cash', 'emergency', 'ultra short', 'nipp ultra', 'low duration', 'money market'],
  d_pomis:  ['pomis', 'post office', 'monthly income', 'senior citizen', 'scss', 'fd', 'fd.1', 'fd.2', 'fixed deposit', 'term deposit', 'bank fd'],
  d_inc:    ['wint', 'bond', 'bonds', 'target maturity', 'sdl', 'g-sec', 'gsec', 'debenture'],

  // E1 — Indian Equity (Passive, Active & Legacy/Transition)
  e1_p_hc:      ['healthcare etf', 'health etf', 'pharma etf', 'nifty healthcare'],
  e1_hc_legacy: ['mirae health', 'mirae asset health', 'healthcare fund'],
  e1_p_nn50:    ['next 50', 'nifty next 50', 'juniorbees', 'junior bees'],
  e1_p_n500:    ['nifty 500', '500 etf', 'mon500', 'total market'],
  e1_p_n50:     ['nifty 50', 'niftybees', 'nifty bees', 'sensex etf'],
  e1_a_hbaf:    ['hdfc balanced', 'hdfc baf', 'balanced advantage'],
  e1_a_hsmc:    ['hdfc small', 'hdfc smallcap', 'small cap'],
  e1_a_momc:    ['motilal', 'motilal oswal midcap', 'midcap fund'],
  e1_a_ppfas:   ['ppfas', 'parag parikh', 'flexicap', 'flexi cap'],
  e1_legacy_mf: ['icici value', 'franklin', 'aditya birla', 'adhitya', 'sbi large', 'quant', 'mirae large', 'mf legacy'],

  // E2 — US Equity (VOO, QQQM, SCHD, Momentum & MON100 Transition)
  e2_voo:       ['voo', 'vanguard s p', 's&p 500', 'sp500'],
  e2_qqqm:      ['qqqm', 'invesco nasdaq', 'nasdaq 100 growth'],
  e2_schd:      ['schd', 'schwab dividend', 'us dividend'],
  e2_mom:       ['invesco momentum', 'momentum etf', 'spmo', 'pdp'],
  e2_mon100:    ['mon100', 'mon 100', 'motilal nasdaq']
};

export function matchAssetId(rawText = '') {
  const text = String(rawText).toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;

  // 1. Direct ID match
  const direct = ASSET_TEMPLATE.find(a => a.id === text);
  if (direct) return direct.id;

  // 2. Direct template name match
  const nameMatch = ASSET_TEMPLATE.find(a => a.name.toLowerCase() === text);
  if (nameMatch) return nameMatch.id;

  // 3. Keyword match (specific sub-assets prioritized)
  for (const [id, keywords] of Object.entries(ASSET_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return id;
      }
    }
  }

  return null;
}

export function extractNumber(val) {
  if (typeof val === 'number') return isFinite(val) && val > 0 ? val : 0;
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '').replace(/₹|\$|€|£/g, '').trim();
    const num = parseFloat(cleaned);
    return isFinite(num) && num > 0 ? num : 0;
  }
  return 0;
}

/**
 * Universal Dual-Mode Parser:
 * - Mode A: Tabular structure detection (Official Template, CSVs, Google Sheets exports)
 * - Mode B: Multi-column Dashboard scanning with cell-lock to avoid double-counting or skipped items
 */
export async function parseExcelOrCsv(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (!rawRows || rawRows.length === 0) {
          resolve({ mapped: [], unmapped: [], totalRows: 0 });
          return;
        }

        const mappedMap = {};
        const unmapped = [];

        let headerRowIdx = -1;
        let nameColIdx = -1;
        let amountColIdx = -1;
        let customNameColIdx = -1;

        for (let r = 0; r < Math.min(rawRows.length, 6); r++) {
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

        // ── MODE A: Standard Tabular Mode (100% precision) ──
        if (headerRowIdx !== -1 && nameColIdx !== -1 && amountColIdx !== -1) {
          for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!Array.isArray(row) || row.length === 0) continue;

            const cellName = String(row[nameColIdx] || '').trim();
            const cellCustom = customNameColIdx !== -1 ? String(row[customNameColIdx] || '').trim() : '';
            const cellAmount = extractNumber(row[amountColIdx]);

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
              if (template) {
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
          }
        } else {
          // ── MODE B: Freeform Multi-Column Dashboard Mode ──
          rawRows.forEach((row, rIdx) => {
            if (!Array.isArray(row) || row.length === 0) return;

            const usedCols = new Set();

            for (let c = 0; c < row.length; c++) {
              if (usedCols.has(c)) continue;
              const cellValue = String(row[c] || '').trim();
              if (!cellValue) continue;

              const matchedId = matchAssetId(cellValue);
              if (matchedId) {
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
                  if (template) {
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
            }
          });
        }

        const mapped = Object.values(mappedMap);
        resolve({ mapped, unmapped, totalRows: rawRows.length });
      } catch (err) {
        console.error("Excel parse error:", err);
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates an Excel template (.xlsx) for the October 2026 Consolidated GRDE Architecture
 */
export function generateExcelTemplate() {
  const headers = [
    "Category (G/R/D/E)",
    "GRDE Sleeve Code",
    "Asset / Sleeve Name",
    "Your Fund / Bank / Instrument Name",
    "Strategic Target at ₹40L (INR)",
    "Current Invested Value (INR)"
  ];
  
  const rows = ASSET_TEMPLATE.map(a => [
    a.cat,
    a.sleeveCode || a.sub,
    a.name,
    a.desc,
    a.refTarget40L || 0,
    ""
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 36 },
    { wch: 48 },
    { wch: 24 },
    { wch: 26 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "GRDE_Oct2026_Holdings");
  XLSX.writeFile(wb, "GRDE_October_2026_Portfolio_Template.xlsx");
}
