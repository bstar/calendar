/**
 * Simple CSV parser utility
 * @param csvText CSV content as string
 * @param delimiter Column delimiter, defaults to comma
 * @param hasHeader Whether the CSV has a header row
 * @returns Array of objects representing the CSV data
 */
export const parseCSV = (
  csvText: string, 
  delimiter: string = ',', 
  hasHeader: boolean = true
): Record<string, string>[] => {
  // Split the CSV into rows
  const rows = csvText.split('\n').filter(row => row.trim().length > 0);
  
  // If no rows, return empty array
  if (rows.length === 0) return [];
  
  // Parse header
  const headers = hasHeader 
    ? rows[0].split(delimiter).map(header => header.trim())
    : [];
  
  // Parse data rows
  const dataStartIndex = hasHeader ? 1 : 0;
  const result = [];
  
  for (let i = dataStartIndex; i < rows.length; i++) {
    const row = rows[i];
    const values = row.split(delimiter);
    
    if (hasHeader) {
      // Create object with header keys
      const rowData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index]?.trim() || '';
      });
      
      result.push(rowData);
    } else {
      // Without headers, just return array of values
      result.push(values.reduce((obj, val, index) => {
        obj[`col${index}`] = val.trim();
        return obj;
      }, {} as Record<string, string>));
    }
  }
  
  return result;
}; 