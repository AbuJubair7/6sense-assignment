import { createHash } from "crypto";

/**
 * Generates a product code based on the product name.
 *
 * Algorithm:
 * 1. Strip non-letter chars, lowercase → working string.
 * 2. Find all longest strictly increasing substrings (each letter's char code
 *    must be GREATER than the previous — any gap, not necessarily +1).
 *    e.g. in "alphasorter": "alp" (a<l<p) and "ort" (o<r<t) are both length 3.
 * 3. If multiple substrings of equal max length exist, concatenate them.
 * 4. start_index = position of first substring in the letters-only string.
 *    end_index   = position of last char of last substring in letters-only string.
 * 5. Prefix with first 7 chars of MD5 hash of the ORIGINAL name.
 *
 * Format: <hash>-<start_index><combinedSubstring><end_index>
 *
 * Verified example: "Alpha Sorter"
 *   letters-only → "alphasorter"
 *   longest runs → "alp" (0–2) and "ort" (6–8)
 *   combined     → "alport", start=0, end=8
 *   result       → "<md5hash>-0alport8"
 */
export const generateProductCode = (name: string): string => {
  // Step 1: strip non-letter chars, lowercase
  const letters = name.toLowerCase().replace(/[^a-z]/g, "");

  if (letters.length === 0) {
    const hash = createHash("md5").update(name).digest("hex").slice(0, 7);
    return `${hash}-0`;
  }

  // Step 2: Find all strictly increasing runs
  let maxLen = 0;
  let substrings: Array<{ text: string; start: number; end: number }> = [];

  let i = 0;
  while (i < letters.length) {
    let j = i + 1;
    // Extend run while next char is strictly greater (any increment)
    while (
      j < letters.length &&
      (letters.charCodeAt(j) > letters.charCodeAt(j - 1))
    ) {
      j++;
    }

    const runLen = j - i;
    const text = letters.slice(i, j);

    if (runLen > maxLen) {
      maxLen = runLen;
      substrings = [{ text, start: i, end: j - 1 }];
    } else if (runLen === maxLen) {
      substrings.push({ text, start: i, end: j - 1 });
    }

    i = j;
  }

  // Step 3: Concatenate all max-length substrings
  const combinedText = substrings.map((s) => s.text).join("");
  const overallStart = substrings[0]?.start ?? 0;
  const overallEnd = substrings[substrings.length - 1]?.end ?? 0;

  // Step 5: Hash the ORIGINAL product name (MD5, first 7 hex chars)
  const hash = createHash("md5").update(name).digest("hex").slice(0, 7);

  // Format: <hash>-<start><combinedSubstring><end>
  return `${hash}-${overallStart}${combinedText}${overallEnd}`;
};
