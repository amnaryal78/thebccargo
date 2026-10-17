/**
 * Converts a positive number to South Asian words (Crore, Lakh, Thousand, Hundred)
 * for official invoice and bill statements.
 */
export function numberToWords(num: number): string {
  const rounded = Math.floor(Math.abs(num));
  if (rounded === 0) return 'Zero';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertChunk(n: number): string {
    let s = '';
    if (n >= 100) {
      s += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      s += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      s += ones[n] + ' ';
    }
    return s.trim();
  }

  const parts: string[] = [];
  const crore = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundred = rem;

  if (crore > 0) parts.push(`${convertChunk(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertChunk(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertChunk(thousand)} Thousand`);
  if (hundred > 0) parts.push(convertChunk(hundred));

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
