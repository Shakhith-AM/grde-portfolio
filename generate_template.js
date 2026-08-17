import * as XLSX from 'xlsx';
import * as fs from 'fs';

const headers = [
  "Category (G/R/D/E)",
  "GRDE Asset Class",
  "Sub-Category",
  "Your Fund / Bank / Instrument Name",
  "Current Invested Value (INR)",
  "Monthly SIP / Installment (INR)",
  "Notes / Account / Broker"
];

const data = [
  // ── G — Gold & Silver (10%) ──
  ["G", "Gold ETFs", "Gold", "Nippon India Gold BeES ETF / GLDM", 366659.93, 10000, "Zerodha / ICICI Direct"],
  ["G", "Silver ETFs", "Silver", "Tata Silver ETF / SilverBeES", 34554.72, 2000, "Zerodha"],

  // ── R — Real Estate / REITs & InvITs (15%) ──
  ["R", "Mindspace REIT", "REITs · Office", "Mindspace Business Parks REIT", 112862.28, 5000, "Quarterly distribution"],
  ["R", "KRT REIT", "REITs · Office", "Brookfield India / KRT REIT", 102341.79, 5000, "Quarterly distribution"],
  ["R", "Nexus REIT", "REITs · Retail", "Nexus Select Trust REIT", 124876.01, 5000, "Retail / Malls"],
  ["R", "Data Centre REITs", "REITs · Data Centre", "Data Centre REITs", 2939.30, 2000, "AI / Cloud Data Centers"],
  ["R", "IndiGrid InvIT", "InvITs · Power", "India Grid Trust (IndiGrid)", 184478.00, 5000, "Power Transmission"],
  ["R", "IRB InvIT", "InvITs · Roads", "IRB InvIT Fund", 74553.00, 3000, "Highways & Tolls"],

  // ── D — Debt & Defense (25%) ──
  ["D", "Liquid Funds", "Liquidity", "Jio BlackRock / ICICI Liquid Fund", 63860.00, 5000, "Instant redemption / T+0"],
  ["D", "Ultra Short Duration", "Liquidity", "Nippon India Ultra Short Duration", 21440.00, 3000, "3-6 month horizon"],
  ["D", "Fixed Deposits", "Capital Protection", "Bank Fixed Deposits (FD.1)", 250000.00, 0, "Guaranteed / DICGC cover"],
  ["D", "POMIS / Income", "Capital Protection", "Post Office Monthly Income Scheme", 450000.00, 0, "Monthly interest payout"],
  ["D", "Bonds / Duration", "Income / Duration", "Wint Wealth Bonds / Target Maturity G-Secs", 173770.00, 5000, "Locked yield to maturity"],
  ["D", "NPS Tier I", "Pension", "National Pension System (Active Choice)", 10500.00, 4200, "80CCD(1B) Tax Benefit"],

  // ── E — Equity Compounding Engine (50%) ──
  ["E", "Indian Mutual Funds", "Active Indian Equity", "PPFAS / ICICI Value / Franklin / MO Midcap", 1277399.36, 25000, "Active Multi-Cap & Flexi-Cap"],
  ["E", "Indian ETFs", "Passive Indian Equity", "Nifty 50 BeES / Junior BeES", 236044.49, 10000, "Large & Midcap Passive Core"],
  ["E", "US Equity ETFs", "Global / US Equity", "VOO (S&P 500) / MON100 (Nasdaq) / SCHD", 317554.12, 10000, "International Dollar Hedge"],
  ["E", "Healthcare Sector", "Defensive Equity", "Mirae Asset Healthcare Fund", 69000.00, 2000, "Pharma & Hospitals Secular Theme"]
];

const wsData = [headers, ...data];
const ws = XLSX.utils.aoa_to_sheet(wsData);

ws['!cols'] = [
  { wch: 18 },
  { wch: 22 },
  { wch: 22 },
  { wch: 42 },
  { wch: 28 },
  { wch: 30 },
  { wch: 32 }
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "GRDE_Template");

XLSX.writeFile(wb, "c:/Users/Admin/Desktop/learning/GRDE_Master_Google_Sheets_Template.xlsx");

// Also export as clean CSV
const csvContent = wsData.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
fs.writeFileSync("c:/Users/Admin/Desktop/learning/GRDE_Master_Google_Sheets_Template.csv", csvContent);

console.log("Template generated successfully!");
