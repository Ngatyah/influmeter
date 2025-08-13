/**
 * Utility functions to handle BigInt serialization
 */

export function convertBigIntsToStrings(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntsToStrings(item));
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntsToStrings(value);
    }
    return converted;
  }

  return obj;
}

export function convertBigIntsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntsToNumbers(item));
  }

  if (typeof obj === 'object') {
    // Handle Decimal.js objects with {s, e, d} structure
    if (obj.s !== undefined && obj.e !== undefined && obj.d !== undefined) {
      // This appears to be a Decimal.js object
      if (Array.isArray(obj.d) && obj.d.length > 0) {
        return obj.d[0]; // Return the first element as the number
      }
      return 0; // Fallback for invalid decimal
    }

    // Handle Date objects that might be empty objects
    if (Object.keys(obj).length === 0) {
      return null; // Convert empty objects to null
    }

    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntsToNumbers(value);
    }
    return converted;
  }

  return obj;
}