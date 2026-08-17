import * as XLSX from 'xlsx';
import { ASSET_TEMPLATE } from '../constants/masterData';

// Comprehensive keyword dictionary covering fund names, broker abbreviations, and ticker symbols
const ASSET_KEYWORDS = {
  g_gold: [
    'gold', 'goldbees', 'gold bees', 'gldm', 'sovereign', 'sgb', 'nippon gold', 'hdfc gold', 'icici gold', 'sbi gold', 'physical gold'
  ],
  g_silver: [
    'silver', 'silverbees', 'silver bees', 'tatsilv', 'tata silver', 'nippon silver', 'hdfc silver'
  ],
  
  r_mind: [
    'mindspace', 'mind space', 'office reit a'
  ],
  r_krt: [
    'krt', 'brookfield', 'embassy', 'office reit b', 'office reit'
  ],
  r_nexus: [
    'nexus', 'retail reit', 'mall reit'
  ],
  r_dc: [
    'data centre', 'data center', 'dc reit', 'datacentre'
  ],
  r_indi: [
    'indigrid', 'power invit', 'transmission', 'indi grid'
  ],
  r_irb: [
    'irb', 'irbinv', 'highways', 'road invit', 'pginvit', 'toll'
  ],

  d_liq: [
    'jio', 'balckrock', 'blackrock', 'liquid', 'overnight', 'cash', 'emergency', 'savings', 'instant redemption'
  ],
  d_ult: [
    'ultra short', 'nipp ultra', 'low duration', 'money market', 'short duration'
  ],
  d_fd: [
    'fd', 'fd.1', 'fd.2', 'fixed deposit', 'term deposit', 'bank fd', 'corporate fd'
  ],
  d_pomis: [
    'pomis', 'post office', 'monthly income', 'senior citizen', 'scss'
  ],
  d_inc: [
    'wint', 'bond', 'bonds', 'target maturity', 'sdl', 'g-sec', 'gsec', 'debenture'
  ],
  d_nps: [
    'nps', 'tier 1', 'tier i', 'national pension', 'pran'
  ],

  e_mf: [
    'mutual fund', 'mf legacy', 'mf neo', 'mf: 16', 'flexi cap', 'large cap', 'mid cap', 'small cap',
    'ppf', 'ppfas', 'parag parikh', 'franklin', 'icici value', 'motilal', 'hdfc baf', 'hdfc smallcap',
    'aditya birla', 'adhitya', 'sbi large', 'quant', 'mirae large'
  ],
  e_etfin: [
    'nifty', 'nifty 50', 'niftybees', 'nifty bees', 'junior bees', 'juniorbees', 'midcap 150', 'sensex', 'etf (ind)', 'etf (ici)'
  ],
  e_etfus: [
    'mon100', 'mon 100', 'voo', 'schd', 's&p 500', 'sp500', 'nasdaq', 'etf (us)', 'etf(us)', 'international', 'global'
  ],
  e_hc: [
    'healthcare', 'health care', 'pharma', 'biotech', 'mirae health', 'medical'
  ]
};

export function matchAssetId(rawText = '') {
  const text = String(rawText).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  if (!text) return null;

  // 1. Direct ID match
  const direct = ASSET_TEMPLATE.find(a => a.id === text);
  if (direct) return direct.id;

  // 2. Keyword exact substring match (longest keywords first)
  for (const [id, keywords] of Object.entries(ASSET_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return id;
      }
    }
  }

  return null;
}

function extractNumber(val) {
  if (typeof val === 'number') return val > 0 ? val : 0;
  if (typeof val === 'string') {
    // Remove commas, currency symbols, and spaces
    const cleaned = val.replace(/,/g, '').replace(/₹|\$|€|£/g, '').trim();
    const num = parseFloat(cleaned);
    return !isNaN(num) && num > 0 ? num : 0;
  }
  return 0;
}

/**
 * Universal Parser: Handles both Standard Column Tables and Multi-Column Layout Sheets
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

        // Convert sheet to 2D array of raw cell values
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        const mappedMap = {};
        const unmapped = [];

        // Scan all rows and cells
        rows.forEach((row, rowIdx) => {
          if (!Array.isArray(row) || row.length === 0) return;

          for (let colIdx = 0; colIdx < row.length; colIdx++) {
            const cellValue = String(row[colIdx] || '').trim();
            if (!cellValue) continue;

            const matchedId = matchAssetId(cellValue);
            if (matchedId) {
              // Look in subsequent adjacent columns for the numeric amount
              let foundAmount = 0;
              for (let k = colIdx + 1; k < Math.min(row.length, colIdx + 4); k++) {
                const num = extractNumber(row[k]);
                // Ignore percentage indicators like 10, 15, 25, 50 if they represent headers
                if (num > 0) {
                  foundAmount = num;
                  break;
                }
              }

              if (foundAmount > 0) {
                const template = ASSET_TEMPLATE.find(t => t.id === matchedId);
                const existing = mappedMap[matchedId] || {
                  id: matchedId,
                  name: template.name,
                  originalNames: [],
                  category: template.cat,
                  amount: 0,
                  rowNumber: rowIdx + 1
                };

                existing.amount += foundAmount;
                if (!existing.originalNames.includes(cellValue)) {
                  existing.originalNames.push(cellValue);
                }
                mappedMap[matchedId] = existing;
              }
            }
          }
        });

        const mapped = Object.values(mappedMap).map(item => ({
          ...item,
          originalName: item.originalNames.join(' + ')
        }));

        resolve({ mapped, unmapped, totalRows: rows.length });
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
  const headers = ["Category (G/R/D/E)", "GRDE Sub-Asset", "Your Fund / Bank / Instrument Name", "Current Invested Amount (INR)", "Monthly SIP / Installment (INR)"];
  
  const rows = ASSET_TEMPLATE.map(a => [
    a.cat,
    a.name,
    `My ${a.name}`,
    "",
    ""
  ]);

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 18 },
    { wch: 28 },
    { wch: 36 },
    { wch: 30 },
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
