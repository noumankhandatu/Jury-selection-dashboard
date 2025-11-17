/**
 * Format phone number to US format: (XXX) XXX-XXXX
 * @param phone - Phone number string (can be digits only or already formatted)
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Format based on length
  if (cleaned.length === 0) return "";
  if (cleaned.length <= 3) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

/**
 * Format phone number input handler - formats as user types
 * @param value - Input value
 * @returns Formatted phone number
 */
export function formatPhoneInput(value: string): string {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, "");
  
  // Limit to 10 digits (US phone number)
  const limited = cleaned.slice(0, 10);
  
  // Format based on length
  if (limited.length === 0) return "";
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
}

/**
 * Format date to US format: MM/DD/YYYY
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateUS(date: string | Date | null | undefined): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const year = dateObj.getFullYear();
  
  return `${month}/${day}/${year}`;
}

/**
 * Format date to US format with options
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateUSLocale(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  };
  
  return dateObj.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Format date to US format: MM/DD/YYYY (for date inputs)
 * @param date - Date string or Date object
 * @returns Formatted date string for HTML date input (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return "";
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

