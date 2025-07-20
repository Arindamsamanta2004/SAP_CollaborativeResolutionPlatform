/**
 * Format number as percentage
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US');
};

/**
 * Format capacity value (hours)
 */
export const formatCapacity = (value: number): string => {
  return `${formatNumber(value)} h`;
};