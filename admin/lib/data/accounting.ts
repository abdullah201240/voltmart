/**
 * Accounting depth data layer — Phase 4 (Odoo `account` parity)
 * ------------------------------------------------------------------
 * Extends the basic invoice/bill/payment mocks with the core ledger:
 *  - Chart of Accounts  (`account.account`)
 *  - Journals           (`account.journal`)
 *  - Journal Entries    (`account.move` + `account.move.line`)
 *
 * Balances are DERIVED from posted move lines only (Odoo rule: draft and
 * cancelled entries never touch the books), so Trial Balance / Income
 * Statement / Balance Sheet always stay coherent with the ledger.
 *
 * Move state machine mirrors Odoo: Draft -> Posted -> (Paid) / Cancelled,
 * with revert-to-draft and per-move credit notes handled in workflows.ts.
 */

import type { MoveState } from "@/lib/data/finance";

// Re-export convenience so pages can import everything accounting from here.
export type { MoveState };

/** Alias used by the journal-entry UI to avoid clashing with invoice rows. */
export type AcctMoveState = MoveState;

// ------------------------------------------------------------------
// Chart of Accounts (`account.account`)
// ------------------------------------------------------------------

export type AccountInternalType =
  | "asset_receivable"
  | "asset_current"
  | "asset_fixed"
  | "liability_payable"
  | "liability_credit"
  | "liability_current"
  | "equity"
  | "income"
  | "income_other"
  | "expense"
  | "expense_direct";

export interface AccountRow {
  code: string;
  name: string;
  internalType: AccountInternalType;
  journalCodes: string;
}

/** Grouping labels used by the reports (Odoo section buckets). */
export const ASSET_TYPES: AccountInternalType[] = ["asset_receivable", "asset_current", "asset_fixed"];
export const LIABILITY_TYPES: AccountInternalType[] = ["liability_payable", "liability_credit", "liability_current"];
export const EQUITY_TYPES: AccountInternalType[] = ["equity"];
export const INCOME_TYPES: AccountInternalType[] = ["income", "income_other"];
export const EXPENSE_TYPES: AccountInternalType[] = ["expense", "expense_direct"];

export const ACCOUNT_TYPE_LABEL: Record<AccountInternalType, string> = {
  asset_receivable: "Receivable",
  asset_current: "Current Asset",
  asset_fixed: "Fixed Asset",
  liability_payable: "Payable",
  liability_credit: "Credit Card",
  liability_current: "Current Liability",
  equity: "Equity",
  income: "Income",
  income_other: "Other Income",
  expense: "Expense",
  expense_direct: "Expenses",
};

const ACCOUNTS: AccountRow[] = [
  { code: "111100", name: "Accounts Receivable", internalType: "asset_receivable", journalCodes: "INV" },
  { code: "111200", name: "Bank — Dutch Bangla", internalType: "asset_current", journalCodes: "BNK" },
  { code: "121000", name: "Prepaid VAT (Input)", internalType: "asset_current", journalCodes: "BILL" },
  { code: "151000", name: "Warehouse Equipment", internalType: "asset_fixed", journalCodes: "MISC" },
  { code: "211000", name: "Accounts Payable", internalType: "liability_payable", journalCodes: "BILL" },
  { code: "215000", name: "VAT Payable (Output 15%)", internalType: "liability_current", journalCodes: "INV" },
  { code: "310000", name: "Owner Equity", internalType: "equity", journalCodes: "MISC" },
  { code: "410000", name: "Product Sales", internalType: "income", journalCodes: "INV" },
  { code: "420000", name: "Shipping Revenue", internalType: "income_other", journalCodes: "INV" },
  { code: "511000", name: "Cost of Goods Sold", internalType: "expense_direct", journalCodes: "MISC" },
  { code: "521000", name: "Shipping Expense", internalType: "expense", journalCodes: "BILL" },
  { code: "531000", name: "Marketing Expense", internalType: "expense", journalCodes: "MISC" },
  { code: "541000", name: "Software Subscriptions", internalType: "expense", journalCodes: "MISC" },
];

// ------------------------------------------------------------------
// Journals (`account.journal`)
// ------------------------------------------------------------------

export type JournalType = "sale" | "purchase" | "cash" | "bank" | "misc";

export interface JournalRow {
  code: string;
  name: string;
  type: JournalType;
  defaultAccount: string;
}

const JOURNALS: JournalRow[] = [
  { code: "INV", name: "Customer Invoices", type: "sale", defaultAccount: "111100" },
  { code: "BILL", name: "Vendor Bills", type: "purchase", defaultAccount: "211000" },
  { code: "BNK", name: "Bank — Dutch Bangla", type: "bank", defaultAccount: "111200" },
  { code: "MISC", name: "Miscellaneous Operations", type: "misc", defaultAccount: "" },
];

// ------------------------------------------------------------------
// Journal Entries (`account.move`) — double-entry with balanced lines
// ------------------------------------------------------------------

export interface MoveLine {
  account: string;
  accountName: string;
  label: string;
  debit: number;
  credit: number;
}

export interface MoveRow {
  id: string;
  number: string;
  date: string;
  journalCode: string;
  journalName: string;
  partner: string;
  narration: string;
  state: AcctMoveState;
  /** "out_invoice" | "in_invoice" | "entry" — mirrors Odoo move_type. */
  moveType: "out_invoice" | "in_invoice" | "entry";
  lines: MoveLine[];
}

/** Sum of a move's line amounts (non-negative magnitude, used for display). */
export function moveTotal(m: MoveRow): number {
  return m.lines.reduce((s, l) => s + l.debit, 0);
}

/** Balance check — a move can only be posted when debits equal credits. */
export function isBalanced(m: Pick<MoveRow, "lines">): boolean {
  const d = m.lines.reduce((s, l) => s + l.debit, 0);
  const c = m.lines.reduce((s, l) => s + l.credit, 0);
  return Math.abs(d - c) < 0.01;
}

const MOVES: MoveRow[] = [
  // Opening balance
  {
    id: "MISC-2026-0001", number: "MISC/2026/0001", date: "Sep 01, 2026", journalCode: "MISC", journalName: "Miscellaneous Operations",
    partner: "VoltMart (Owner)", narration: "Opening balance — capital deposited to bank.", state: "Posted", moveType: "entry",
    lines: [
      { account: "111200", accountName: "Bank — Dutch Bangla", label: "Opening capital", debit: 8000000, credit: 0 },
      { account: "310000", accountName: "Owner Equity", label: "Opening capital", debit: 0, credit: 8000000 },
    ],
  },
  // Customer invoices (mirror finance.ts INVOICES amounts exactly)
  {
    id: "MJE-3001", number: "INV/2026/0031", date: "Sep 28, 2026", journalCode: "INV", journalName: "Customer Invoices",
    partner: "Noah Wilson", narration: "Invoice for ORD-7389.", state: "Paid", moveType: "out_invoice",
    lines: [
      { account: "111100", accountName: "Accounts Receivable", label: "Noah Wilson", debit: 51480, credit: 0 },
      { account: "410000", accountName: "Product Sales", label: "Electronics order", debit: 0, credit: 44765.22 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT 15%", debit: 0, credit: 6714.78 },
    ],
  },
  {
    id: "MJE-3002", number: "INV/2026/0030", date: "Sep 26, 2026", journalCode: "INV", journalName: "Customer Invoices",
    partner: "Mia Clark", narration: "Invoice for ORD-7385.", state: "Posted", moveType: "out_invoice",
    lines: [
      { account: "111100", accountName: "Accounts Receivable", label: "Mia Clark", debit: 383880, credit: 0 },
      { account: "410000", accountName: "Product Sales", label: "Laptop bundle", debit: 0, credit: 333808.7 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT 15%", debit: 0, credit: 50071.3 },
    ],
  },
  {
    id: "MJE-3003", number: "INV/2026/0029", date: "Sep 27, 2026", journalCode: "INV", journalName: "Customer Invoices",
    partner: "James Davis", narration: "Invoice for ORD-7388 (draft — not yet posted).", state: "Draft", moveType: "out_invoice",
    lines: [
      { account: "111100", accountName: "Accounts Receivable", label: "James Davis", debit: 1705200, credit: 0 },
      { account: "410000", accountName: "Product Sales", label: "Bulk smartphone order", debit: 0, credit: 1482782.61 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT 15%", debit: 0, credit: 222417.39 },
    ],
  },
  {
    id: "MJE-3004", number: "INV/2026/0028", date: "Sep 28, 2026", journalCode: "INV", journalName: "Customer Invoices",
    partner: "Emma Brown", narration: "Invoice for ORD-7390.", state: "Paid", moveType: "out_invoice",
    lines: [
      { account: "111100", accountName: "Accounts Receivable", label: "Emma Brown", debit: 220800, credit: 0 },
      { account: "410000", accountName: "Product Sales", label: "Audio gear", debit: 0, credit: 192000 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT 15%", debit: 0, credit: 28800 },
    ],
  },
  {
    id: "MJE-3005", number: "INV/2026/0027", date: "Sep 26, 2026", journalCode: "INV", journalName: "Customer Invoices",
    partner: "Lucas White", narration: "Invoice for ORD-7386 (cancelled — payment failed).", state: "Cancelled", moveType: "out_invoice",
    lines: [
      { account: "111100", accountName: "Accounts Receivable", label: "Lucas White", debit: 9598.8, credit: 0 },
      { account: "410000", accountName: "Product Sales", label: "Accessory order", debit: 0, credit: 8346.78 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT 15%", debit: 0, credit: 1252.02 },
    ],
  },
  // Customer payments (bKash / bank)
  {
    id: "BNK-2026-0011", number: "BNK/2026/0011", date: "Sep 28, 2026", journalCode: "BNK", journalName: "Bank — Dutch Bangla",
    partner: "Noah Wilson", narration: "Payment received — bKash, reconciles INV/2026/0031.", state: "Posted", moveType: "entry",
    lines: [
      { account: "111200", accountName: "Bank — Dutch Bangla", label: "bKash receipt", debit: 51480, credit: 0 },
      { account: "111100", accountName: "Accounts Receivable", label: "Noah Wilson", debit: 0, credit: 51480 },
    ],
  },
  {
    id: "BNK-2026-0012", number: "BNK/2026/0012", date: "Sep 28, 2026", journalCode: "BNK", journalName: "Bank — Dutch Bangla",
    partner: "Emma Brown", narration: "Payment received — bank transfer, reconciles INV/2026/0028.", state: "Posted", moveType: "entry",
    lines: [
      { account: "111200", accountName: "Bank — Dutch Bangla", label: "Bank transfer", debit: 220800, credit: 0 },
      { account: "111100", accountName: "Accounts Receivable", label: "Emma Brown", debit: 0, credit: 220800 },
    ],
  },
  // Vendor bills (mirror finance.ts BILLS amounts exactly)
  {
    id: "MJE-2001", number: "BILL/2026/0014", date: "Sep 20, 2026", journalCode: "BILL", journalName: "Vendor Bills",
    partner: "TechDist GmbH", narration: "Bill for PO-8801 — smartphones.", state: "Paid", moveType: "in_invoice",
    lines: [
      { account: "511000", accountName: "Cost of Goods Sold", label: "Handset procurement", debit: 1920000, credit: 0 },
      { account: "121000", accountName: "Prepaid VAT (Input)", label: "VAT 15% on bill", debit: 288000, credit: 0 },
      { account: "211000", accountName: "Accounts Payable", label: "TechDist GmbH", debit: 0, credit: 2208000 },
    ],
  },
  {
    id: "MJE-2002", number: "BILL/2026/0015", date: "Sep 24, 2026", journalCode: "BILL", journalName: "Vendor Bills",
    partner: "Shenzhen Mobile Supply", narration: "Bill for PO-8803 — tablets.", state: "Posted", moveType: "in_invoice",
    lines: [
      { account: "511000", accountName: "Cost of Goods Sold", label: "Tablet procurement", debit: 4434782.61, credit: 0 },
      { account: "121000", accountName: "Prepaid VAT (Input)", label: "VAT 15% on bill", debit: 665217.39, credit: 0 },
      { account: "211000", accountName: "Accounts Payable", label: "Shenzhen Mobile Supply", debit: 0, credit: 5100000 },
    ],
  },
  {
    id: "MJE-2003", number: "BILL/2026/0016", date: "Sep 26, 2026", journalCode: "BILL", journalName: "Vendor Bills",
    partner: "AudioWorks Inc", narration: "Bill for PO-8805 — audio equipment.", state: "Posted", moveType: "in_invoice",
    lines: [
      { account: "511000", accountName: "Cost of Goods Sold", label: "Audio procurement", debit: 813913.04, credit: 0 },
      { account: "121000", accountName: "Prepaid VAT (Input)", label: "VAT 15% on bill", debit: 122086.96, credit: 0 },
      { account: "211000", accountName: "Accounts Payable", label: "AudioWorks Inc", debit: 0, credit: 936000 },
    ],
  },
  {
    id: "MJE-2004", number: "BILL/2026/0017", date: "Sep 28, 2026", journalCode: "BILL", journalName: "Vendor Bills",
    partner: "Logitech Distribution", narration: "Bill for PO-8806 — peripherals (draft).", state: "Draft", moveType: "in_invoice",
    lines: [
      { account: "511000", accountName: "Cost of Goods Sold", label: "Peripheral procurement", debit: 542608.7, credit: 0 },
      { account: "121000", accountName: "Prepaid VAT (Input)", label: "VAT 15% on bill", debit: 81391.3, credit: 0 },
      { account: "211000", accountName: "Accounts Payable", label: "Logitech Distribution", debit: 0, credit: 624000 },
    ],
  },
  // Vendor payment
  {
    id: "BNK-2026-0013", number: "BNK/2026/0013", date: "Sep 26, 2026", journalCode: "BNK", journalName: "Bank — Dutch Bangla",
    partner: "TechDist GmbH", narration: "Payment sent — bank transfer, settles BILL/2026/0014.", state: "Posted", moveType: "entry",
    lines: [
      { account: "211000", accountName: "Accounts Payable", label: "TechDist GmbH", debit: 2208000, credit: 0 },
      { account: "111200", accountName: "Bank — Dutch Bangla", label: "Bank transfer", debit: 0, credit: 2208000 },
    ],
  },
  // Operating expenses
  {
    id: "MISC-2026-0002", number: "MISC/2026/0002", date: "Sep 15, 2026", journalCode: "MISC", journalName: "Miscellaneous Operations",
    partner: "Meta Ads", narration: "September social campaigns — paid from bank.", state: "Posted", moveType: "entry",
    lines: [
      { account: "531000", accountName: "Marketing Expense", label: "Social campaigns", debit: 85000, credit: 0 },
      { account: "111200", accountName: "Bank — Dutch Bangla", label: "Card settlement", debit: 0, credit: 85000 },
    ],
  },
  {
    id: "MISC-2026-0003", number: "MISC/2026/0003", date: "Sep 05, 2026", journalCode: "MISC", journalName: "Miscellaneous Operations",
    partner: "Infrastructure vendors", narration: "SaaS licences (hosting, email, ERP) — paid from bank.", state: "Posted", moveType: "entry",
    lines: [
      { account: "541000", accountName: "Software Subscriptions", label: "Monthly SaaS", debit: 32000, credit: 0 },
      { account: "111200", accountName: "Bank — Dutch Bangla", label: "Card settlement", debit: 0, credit: 32000 },
    ],
  },
  {
    id: "MISC-2026-0004", number: "MISC/2026/0004", date: "Sep 12, 2026", journalCode: "MISC", journalName: "Miscellaneous Operations",
    partner: "Pathao Delivery", narration: "Last-mile courier — bill pending, on payable.", state: "Posted", moveType: "entry",
    lines: [
      { account: "521000", accountName: "Shipping Expense", label: "Courier runs", debit: 18400, credit: 0 },
      { account: "211000", accountName: "Accounts Payable", label: "Pathao Delivery", debit: 0, credit: 18400 },
    ],
  },
  // Credit notes (draft — post from the Credit Notes page)
  {
    id: "RINV-2026-0001", number: "RINV/2026/0001", date: "Sep 29, 2026", journalCode: "INV", journalName: "Customer Invoices",
    partner: "Mia Clark", narration: "Credit note for INV/2026/0030 — returned headset.", state: "Draft", moveType: "entry",
    lines: [
      { account: "410000", accountName: "Product Sales", label: "Return credit — INV/2026/0030", debit: 38388, credit: 0 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT reversal", debit: 5757, credit: 0 },
      { account: "111100", accountName: "Accounts Receivable", label: "Mia Clark", debit: 0, credit: 44145 },
    ],
  },
  {
    id: "RINV-2026-0002", number: "RINV/2026/0002", date: "Sep 29, 2026", journalCode: "INV", journalName: "Customer Invoices",
    partner: "Emma Brown", narration: "Credit note for INV/2026/0028 — damaged packaging.", state: "Draft", moveType: "entry",
    lines: [
      { account: "410000", accountName: "Product Sales", label: "Return credit — INV/2026/0028", debit: 22080, credit: 0 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT reversal", debit: 3312, credit: 0 },
      { account: "111100", accountName: "Accounts Receivable", label: "Emma Brown", debit: 0, credit: 25392 },
    ],
  },
];

// ------------------------------------------------------------------
// Resolvers (merge ops-overlay so workflow actions show up)
// ------------------------------------------------------------------

import { withOverlay, getRecord, patchFields, addHistory } from "@/lib/data/ops";
import { ACCOUNT_MOVE, BANK_STATEMENT } from "@/lib/data/workflows";

export async function getAccounts(): Promise<AccountRow[]> {
  return ACCOUNTS;
}

export async function getJournals(): Promise<JournalRow[]> {
  return JOURNALS;
}

/** Every journal entry (Odoo "Journal Entries" list shows all move types). */
export async function getMoves(): Promise<MoveRow[]> {
  const created = listCreatedMoves();
  return [...created, ...MOVES.map((m) => withOverlay(ACCOUNT_MOVE, m.id, m))];
}

// --- user-created draft entries (index overlay, same pattern as credit notes)

const ENTRY_INDEX = "ENTRY_INDEX";

/** Read every entry created in this browser session-storage overlay. */
function listCreatedMoves(): MoveRow[] {
  if (typeof window === "undefined") return [];
  const idx = getRecord(ACCOUNT_MOVE, ENTRY_INDEX).fields["items"] as MoveRow[] | undefined;
  return (idx ?? []).map((m) => withOverlay(ACCOUNT_MOVE, m.id, m));
}

/** Persist a new draft journal entry (MISC journal, auto-numbered). */
export function createDraftMove(input: { journalCode: string; partner: string; narration: string; lines: MoveLine[] }): MoveRow {
  const items = (getRecord(ACCOUNT_MOVE, ENTRY_INDEX).fields["items"] as MoveRow[] | undefined) ?? [];
  const journal = JOURNALS.find((j) => j.code === input.journalCode) ?? JOURNALS[3];
  const seq = String(items.length + 1).padStart(4, "0");
  const move: MoveRow = {
    id: `USR-${Date.now().toString(36)}`,
    number: `${journal.code}/2026/NEW-${seq}`,
    date: "Sep 30, 2026",
    journalCode: journal.code,
    journalName: journal.name,
    partner: input.partner || "VoltMart (Internal)",
    narration: input.narration || "Manual journal entry.",
    state: "Draft",
    moveType: "entry",
    lines: input.lines,
  };
  patchFields(ACCOUNT_MOVE, ENTRY_INDEX, { items: [...items, move] });
  addHistory(ACCOUNT_MOVE, move.id, "Entry created", `Draft entry ${move.number} created in journal ${journal.code}.`);
  return move;
}

/** Patch the lines/narration of a created (or base) move via overlay. */
export function updateMoveLines(ref: string, lines: MoveLine[], narration?: string) {
  patchFields(ACCOUNT_MOVE, ref, narration === undefined ? { lines } : { lines, narration });
  addHistory(ACCOUNT_MOVE, ref, "Journal items updated", `${lines.length} line(s) saved.`);
}

/** Credit notes only — the base set plus any created via invoice workflow. */
export async function getCreditNotes(): Promise<MoveRow[]> {
  const base = MOVES.filter((m) => m.number.startsWith("RINV"));
  const created = listCreatedCreditNotes();
  return [...created, ...base.map((m) => withOverlay(ACCOUNT_MOVE, m.id, m))];
}

// --- created credit notes (stored as overlay blobs on ACCOUNT_MOVE) -----

type CreatedCn = MoveRow & { __cnOrigin: string };

/** Read every synthetic credit-note record created by `createCreditNote`. */
function listCreatedCreditNotes(): MoveRow[] {
  if (typeof window === "undefined") return [];
  // Credit notes created from invoices are stored under key `account.move:CN:<invoiceNumber>`
  // and mirrored onto the invoice overlay (`creditNoteRef`). We keep a simple index
  // under `account.move:CN_INDEX` holding the array.
  const idx = getRecord(ACCOUNT_MOVE, "CN_INDEX").fields["items"] as MoveRow[] | undefined;
  return idx ?? [];
}

/** Register a synthetic credit note against a posted invoice. Idempotent per invoice. */
export function createCreditNote(invoiceNumber: string, partner: string, total: number, vatRate = 0.15): MoveRow | null {
  const idxKey = "CN_INDEX";
  const items = (getRecord(ACCOUNT_MOVE, idxKey).fields["items"] as CreatedCn[] | undefined) ?? [];
  if (items.some((c) => c.__cnOrigin === invoiceNumber)) return null;

  const seq = String(items.length + 1).padStart(4, "0");
  const base = Math.round((total / (1 + vatRate)) * 100) / 100;
  const vat = Math.round((total - base) * 100) / 100;
  const cn: CreatedCn = {
    id: `CN-${invoiceNumber}`,
    number: `RINV/2026/${seq}`,
    date: "Sep 30, 2026",
    journalCode: "INV",
    journalName: "Customer Invoices",
    partner,
    narration: `Credit note for ${invoiceNumber} — issued from invoice action.`,
    state: "Draft",
    moveType: "entry",
    lines: [
      { account: "410000", accountName: "Product Sales", label: `Return credit — ${invoiceNumber}`, debit: base, credit: 0 },
      { account: "215000", accountName: "VAT Payable (Output 15%)", label: "VAT reversal", debit: vat, credit: 0 },
      { account: "111100", accountName: "Accounts Receivable", label: partner, debit: 0, credit: base + vat },
    ],
    __cnOrigin: invoiceNumber,
  };
  patchFields(ACCOUNT_MOVE, idxKey, { items: [...items, cn] });
  addHistory(ACCOUNT_MOVE, invoiceNumber, "Credit note created", `${cn.number} created in draft for ${partner}.`);
  return cn;
}

// ------------------------------------------------------------------
// Report helpers — derived from POSTED move lines only
// ------------------------------------------------------------------

export type BalanceMap = Record<string, { debit: number; credit: number }>;

/** Aggregate posted move lines per account. Draft/cancelled are excluded. */
export function postedBalances(moves: MoveRow[]): BalanceMap {
  const out: BalanceMap = {};
  for (const m of moves) {
    if (m.state !== "Posted" && m.state !== "Paid") continue;
    for (const l of m.lines) {
      const cur = (out[l.account] ??= { debit: 0, credit: 0 });
      cur.debit += l.debit;
      cur.credit += l.credit;
    }
  }
  return out;
}

/** Net balance (debit - credit) for one account from a balance map. */
export function netOf(map: BalanceMap, code: string): number {
  const b = map[code];
  return b ? b.debit - b.credit : 0;
}

export interface SectionRow {
  code: string;
  name: string;
  balance: number;
}

export interface ReportSection {
  title: string;
  rows: SectionRow[];
  total: number;
}

/** Build report sections for accounts of the given internal types. */
export function reportSections(balances: BalanceMap, types: AccountInternalType[], title: string, naturalDebit: boolean): ReportSection {
  const rows = ACCOUNTS.filter((a) => types.includes(a.internalType)).map((a) => ({
    code: a.code,
    name: a.name,
    balance: naturalDebit ? netOf(balances, a.code) : -netOf(balances, a.code),
  }));
  return { title, rows, total: rows.reduce((s, r) => s + r.balance, 0) };
}

/** Trial balance rows — every account with posted activity. */
export function trialBalanceRows(moves: MoveRow[]) {
  const balances = postedBalances(moves);
  return ACCOUNTS.map((a) => {
    const b = balances[a.code] ?? { debit: 0, credit: 0 };
    const net = b.debit - b.credit;
    return { ...a, debit: b.debit, credit: b.credit, balance: net };
  }).filter((r) => r.debit !== 0 || r.credit !== 0);
}

/** Account row lookup for the CoA page. */
export function accountCatalog(): AccountRow[] {
  return ACCOUNTS;
}

// ------------------------------------------------------------------
// Bank statements (`account.bank.statement.line`) — reconciliation
// ------------------------------------------------------------------

/** A single line on a bank statement feed (money in is positive). */
export interface BankStatementLine {
  id: string;
  date: string;
  label: string;
  partner: string;
  amount: number;
  /** "unreconciled" | "reconciled" — driven by the ops overlay. */
  status: "unreconciled" | "reconciled";
}

const STATEMENT_LINES: BankStatementLine[] = [
  { id: "BNKL-9001", date: "Sep 26, 2026", label: "Wire — Mia Clark", partner: "Mia Clark", amount: 383880, status: "unreconciled" },
  { id: "BNKL-9002", date: "Sep 29, 2026", label: "Nagad — Olivia Martin", partner: "Olivia Martin", amount: 225478.8, status: "unreconciled" },
  { id: "BNKL-9003", date: "Sep 24, 2026", label: "Transfer to Shenzhen Mobile Supply", partner: "Shenzhen Mobile Supply", amount: -5100000, status: "unreconciled" },
  { id: "BNKL-9004", date: "Sep 26, 2026", label: "Part payment — AudioWorks Inc", partner: "AudioWorks Inc", amount: -360000, status: "unreconciled" },
  { id: "BNKL-9005", date: "Sep 28, 2026", label: "Bank service charge", partner: "City Bank PLC", amount: -350, status: "unreconciled" },
];

/** Bank feed with any reconciliation made in the UI merged back in. */
export async function getBankStatementLines(): Promise<BankStatementLine[]> {
  return STATEMENT_LINES.map((l) => withOverlay(BANK_STATEMENT, l.id, l));
}

/** Counterpart account to auto-suggest for a statement line (receivable/payable/bank-charge). */
export function suggestAccountForLine(line: BankStatementLine): { code: string; name: string } {
  if (line.amount > 0) return { code: "111100", name: ACCOUNTS.find((a) => a.code === "111100")!.name };
  if (/charge|fee/i.test(line.label)) return { code: "541000", name: ACCOUNTS.find((a) => a.code === "541000")?.name ?? "Bank Charges" };
  return { code: "211000", name: ACCOUNTS.find((a) => a.code === "211000")!.name };
}
