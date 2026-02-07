/* styles.css (APENAS ADIÇÕES NO FINAL — cole no fim do SEU arquivo atual) */

/* Helper: microexplicações estratégicas (curtas e não poluem) */
.helper{
  margin-top: 6px;
  display:flex;
  align-items:flex-start;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.35;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255,255,255,.02);
}
.helper i{margin-top: 1px; opacity:.9}

/* Deixa o card do Saldo pronto para “pop” sem alterar layout */
#sumBalanceCard{ position: relative; }
