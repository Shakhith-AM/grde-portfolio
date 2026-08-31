import * as XLSX from 'xlsx';
import { ASSET_TEMPLATE } from './src/constants/masterData.js';

// Comprehensive keyword mapping with prioritized weights
export const ASSET_KEYWORDS = {
  // G — Gold & Silver
  g_silver: ['silver', 'silverbees', 'silver bees', 'tatsilv', 'tata silver', 'nippon silver', 'hdfc silver'],
  g_gold:   ['gold', 'goldbees', 'gold bees', 'gldm', 'sovereign', 'sgb', 'nippon gold', 'hdfc gold', 'icici gold', 'sbi gold', 'physical gold'],

  // R — Real Estate / REITs & InvITs
  r_dc:     ['data centre', 'data center', 'dc reit', 'datacentre'],
  r_nexus:  ['nexus', 'retail reit', 'mall reit'],
  r_krt:    ['krt', 'brookfield', 'embassy', 'office reit b', 'office reit (b)'],
  r_mind:   ['mindspace', 'mind space', 'office reit a', 'office reit (a)', 'office reit'],
  r_indi:   ['indigrid', 'power invit', 'transmission', 'indi grid'],
  r_irb:    ['irb', 'irbinv', 'highways', 'road invit', 'pginvit', 'toll'],

  // D — Debt & Fixed Income
  d_ult:    ['ultra short', 'nipp ultra', 'low duration', 'money market', 'short duration', 'short term'],
  d_liq:    ['jio', 'balckrock', 'blackrock', 'liquid', 'overnight', 'cash', 'emergency', 'savings', 'instant redemption'],
  d_pomis:  ['pomis', 'post office', 'monthly income', 'senior citizen', 'scss'],
  d_nps:    ['nps', 'tier 1', 'tier i', 'tier-1', 'tier-i', 'national pension', 'pran'],
  d_inc:    ['wint', 'bond', 'bonds', 'target maturity', 'sdl', 'g-sec', 'gsec', 'debenture', 'duration'],
  d_fd:     ['fd', 'fd.1', 'fd.2', 'fixed deposit', 'term deposit', 'bank fd', 'corporate fd'],

  // E — Equity
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

  // 1. Exact ID match
  const direct = ASSET_TEMPLATE.find(a => a.id === text);
  if (direct) return direct.id;

  // 2. Exact template name match
  const nameMatch = ASSET_TEMPLATE.find(a => a.name.toLowerCase() === text);
  if (nameMatch) return nameMatch.id;

  // 3. Keyword matching in order of specificity (specific sub-assets checked before generic ones)
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
