import * as XLSX from 'xlsx';
import { ASSET_TEMPLATE } from '../constants/masterData';

// Keywords to automatically map imported asset names to GRDE internal IDs
const ASSET_KEYWORDS = {
  g_gold:   ['gold', 'sovereign', 'sgb', 'goldbees', 'gold etf', 'nippon gold', 'hdfc gold'],
  g_silver: ['silver', 'silverbees', 'silver etf'],
  
  r_mind:   ['mindspace', 'mind space', 'office reit a'],
  r_krt:    ['krt', 'brookfield', 'embassy', 'office reit b', 'office reit'],
  r_nexus:  ['nexus', 'retail reit', 'mall reit'],
  r_dc:     ['data centre', 'data center', 'dc reit'],
  r_indi:   ['indigrid', 'power invit', 'transmission'],
  r_irb:    ['irb', 'highways', 'road invit', 'pginvit'],

  d_liq:    ['liquid', 'overnight', 'cash', 'emergency', 'savings', 'instant'],
  d_ult:    ['ultra short', 'low duration', 'money market', 'short term'],
  d_fd:     ['fd', 'fixed deposit', 'term deposit', 'bank fd', 'corporate fd'],
  d_pomis:  ['pomis', 'post office', 'monthly income', 'senior citizen', 'scss'],
  d_inc:    ['bond', 'target maturity', 'sdl', 'g-sec', 'gsec', 'wint', 'debenture'],
  d_nps:    ['nps', 'tier 1', 'tier i', 'national pension', 'pran'],

  e_mf:     ['mutual fund', 'flexi cap', 'large cap', 'mid cap', 'small cap', 'parag parikh', 'mirae', 'quant', 'hdfc top 100', 'uti nsm', 'active mf'],
  e_etfin:  ['nifty', 'nifty 50', 'niftybees', 'juniorbees', 'midcap 150', 'sensex', 'index fund', 'etf india'],
  e_etfus:  ['us etf', 'sp500', 's&p 500', 'nasdaq', 'mon100', 'fang', 'international', 'global', 'msci'],
  e_hc:     ['healthcare', 'pharma', 'biotech', 'mirae healthcare', 'medical', 'hospital']
};

export function matchAssetId(rawName = '', rawCategory = '') {
  const text = `${rawName} ${rawCategory}`.toLowerCase().trim();
  
  // 1. Direct ID match
  const directMatch = ASSET_TEMPLATE.find(a => a.id === text);
  if (directMatch) return directMatch.id;

  // 2. Keyword match
  for (const [id, keywords] of Object.entries(ASSET_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return id;
      }
    }
  }

  // 3. Fallback based on category letter (G, R, D, E)
  const catMatch = rawCategory.toUpperCase().trim();
  if (catMatch === 'G' || catMatch.startsWith('GOLD')) return 'g_gold';
  if (catMatch === 'R' || catMatch.startsWith('REAL')) return 'r_mind';
  if (catMatch === 'D' || catMatch.startsWith('DEBT')) return 'd_fd';
  if (catMatch === 'E' || catMatch.startsWith('EQUITY')) return 'e_mf';

  return null;
}

/**
 * Reads an Excel file buffer or blob and returns mapped rows
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
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const mapped = [];
        const unmapped = [];

        rows.forEach((row, idx) => {
          // Normalize column headers
          const keys = Object.keys(row);
          const findVal = (...aliases) => {
            for (const key of keys) {
              const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const alias of aliases) {
                if (k.includes(alias)) return row[key];
              }
            }
            return '';
          };

          const rawName = String(findVal('name', 'asset', 'holding', 'fund', 'scheme', 'instrument') || '').trim();
          const rawAmount = parseFloat(String(findVal('amount', 'value', 'current', 'investment', 'invested', 'balance', 'sip', 'installment')).replace(/[^0-9.-]/g, '')) || 0;
          const rawCategory = String(findVal('category', 'cat', 'type', 'bucket', 'class') || '').trim();
          const rawCustomName = String(findVal('customname', 'fundname', 'alias') || rawName).trim();

          const matchedId = matchAssetId(rawName, rawCategory);

          if (matchedId && rawAmount > 0) {
            const template = ASSET_TEMPLATE.find(t => t.id === matchedId);
            mapped.push({
              id: matchedId,
              name: rawCustomName || template.name,
              originalName: rawName,
              category: template.cat,
              amount: rawAmount,
              rowNumber: idx + 2
            });
          } else if (rawAmount > 0) {
            unmapped.push({
              rawName,
              rawCategory,
              amount: rawAmount,
              rowNumber: idx + 2
            });
          }
        });

        resolve({ mapped, unmapped, totalRows: rows.length });
      } catch (err) {
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

  // Set column widths
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
