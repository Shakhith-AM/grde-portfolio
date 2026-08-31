import * as XLSX from 'xlsx';
import { ASSET_TEMPLATE } from '../constants/masterData';

// Prioritized keyword dictionary mapped to the 18 GRDE asset IDs
export const ASSET_KEYWORDS = {
  // G — Gold & Silver
  g_silver: ['silver', 'silverbees', 'silver bees', 'tatsilv', 'tata silver', 'nippon silver', 'hdfc silver'],
  g_gold:   ['gold', 'goldbees', 'gold bees', 'gldm', 'sovereign', 'sgb', 'nippon gold', 'hdfc gold', 'icici gold', 'sbi gold', 'physical gold'],

  // R — Real Estate / REITs & InvITs
  r_dc:     ['data centre', 'data center', 'dc reit', 'datacentre'],
  r_nexus:  ['nexus', 'retail reit', 'mall reit', 'nexus select'],
  r_krt:    ['krt', 'brookfield', 'embassy', 'office reit b', 'office reit (b)'],
  r_mind:   ['mindspace', 'mind space', 'office reit a', 'office reit (a)', 'office reit'],
  r_indi:   ['indigrid', 'power invit', 'transmission', 'indi grid', 'india grid'],
  r_irb:    ['irb', 'irbinv', 'highways', 'road invit', 'pginvit', 'toll'],

  // D — Debt & Fixed Income
  d_ult:    ['ultra short', 'nipp ultra', 'low duration', 'money market', 'short duration', 'short term'],
  d_liq:    ['jio', 'balckrock', 'blackrock', 'liquid', 'overnight', 'cash', 'emergency', 'savings', 'instant redemption'],
  d_pomis:  ['pomis', 'post office', 'monthly income', 'senior citizen', 'scss'],
  d_nps:    ['nps', 'tier 1', 'tier i', 'tier-1', 'tier-i', 'national pension', 'pran'],
  d_inc:    ['wint', 'bond', 'bonds', 'target maturity', 'sdl', 'g-sec', 'gsec', 'debenture', 'duration'],
  d_fd:     ['fd', 'fd.1', 'fd.2', 'fixed deposit', 'term deposit', 'bank fd', 'corporate fd'],

  // E — Equity Compounding Engine
  e_hc:     ['healthcare', 'health care', 'pharma', 'biotech', 'mirae health', 'medical', 'hospital'],
  e_etfus:  ['mon100', 'mon 100', 'voo', 'schd', 's&p 500', 'sp500', 'nasdaq', 'etf (us)', 'etf(us)', 'international', 'global', 'us etf'],
  e_etfin:  ['nifty', 'nifty 50', 'niftybees', 'nifty bees', 'junior bees', 'juniorbees', 'midcap 150', 'sensex', 'etf (ind)', 'etf (ici)', 'etf(ind)', 'etf(ici)', 'indian etf'],
  e_mf:     ['mutual fund', 'mf legacy', 'mf neo', 'mf: 16', 'flexi cap', 'large cap', 'mid cap', 'small cap',
             'ppf', 'ppfas', 'parag parikh', 'franklin', 'icici value', 'motilal', 'hdfc baf', 'hdfc smallcap',
             'aditya birla', 'adhitya', 'sbi large', 'quant', 'mirae large', 'active mf', 'active equity', 'indian mf']
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

        // Check for tabular header row (search first 6 rows)
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
 * Generates an Excel template (.xlsx) for user to populate monthly SIPs or holdings
 */
export function generateExcelTemplate() {
  const headers = [
    "Category (G/R/D/E)",
    "GRDE Asset Class",
    "Sub-Category",
    "Your Fund / Bank / Instrument Name",
    "Current Invested Value (INR)",
    "Monthly SIP / Installment (INR)"
  ];
  
  const rows = [
    ["G", "Gold ETFs", "Gold", "Nippon India Gold BeES / GLDM", "", ""],
    ["G", "Silver ETFs", "Silver", "Tata Silver ETF / SilverBeES", "", ""],
    ["R", "Mindspace REIT", "REITs · Office", "Mindspace Business Parks REIT", "", ""],
    ["R", "KRT REIT", "REITs · Office", "Brookfield India / KRT REIT", "", ""],
    ["R", "Nexus REIT", "REITs · Retail", "Nexus Select Trust REIT", "", ""],
    ["R", "Data Centre REITs", "REITs · Data Centre", "Data Centre REITs", "", ""],
    ["R", "IndiGrid InvIT", "InvITs · Power", "India Grid Trust (IndiGrid)", "", ""],
    ["R", "IRB InvIT", "InvITs · Roads", "IRB InvIT Fund", "", ""],
    ["D", "Liquid Funds", "Liquidity", "Jio BlackRock / ICICI Liquid Fund", "", ""],
    ["D", "Ultra Short Duration", "Liquidity", "Nippon India Ultra Short Duration", "", ""],
    ["D", "Fixed Deposits", "Capital Protection", "Bank Fixed Deposits (FD.1)", "", ""],
    ["D", "POMIS / Income", "Capital Protection", "Post Office Monthly Income Scheme", "", ""],
    ["D", "Bonds / Duration", "Income / Duration", "Wint Wealth Bonds / Target Maturity", "", ""],
    ["D", "NPS Tier I", "Pension", "National Pension System (Active Choice)", "", ""],
    ["E", "Indian Mutual Funds", "Active Indian Equity", "PPFAS / ICICI Value / Franklin / MO Midcap", "", ""],
    ["E", "Indian ETFs", "Passive Indian Equity", "Nifty 50 BeES / Junior BeES", "", ""],
    ["E", "US Equity ETFs", "Global / US Equity", "VOO (S&P 500) / MON100 (Nasdaq) / SCHD", "", ""],
    ["E", "Healthcare Sector", "Defensive Equity", "Mirae Asset Healthcare Fund", "", ""]
  ];

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 42 },
    { wch: 28 },
    { wch: 30 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "GRDE_Template");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `GRDE_Holdings_Template_v5.3.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
