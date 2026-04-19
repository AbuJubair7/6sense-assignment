/**
 * Calculates the final price of a product after applying a discount.
 *
 * @param price    - The original price (must be >= 0)
 * @param discount - The discount percentage (0–100). Defaults to 0.
 * @returns        - The final price rounded to 2 decimal places.
 *
 * Example: calculateFinalPrice(99.99, 10) → 89.99
 */
export const calculateFinalPrice = (price: number, discount: number = 0): number => {
  if (discount <= 0) return price;
  return +(price * (1 - discount / 100)).toFixed(2);
};
