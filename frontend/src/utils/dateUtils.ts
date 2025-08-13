// Utility functions for safe date handling

export const formatSafeDate = (dateInput: any): string => {
  if (!dateInput) return 'N/A'
  
  try {
    // Handle different input types
    let date: Date
    
    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput)
    } else if (typeof dateInput === 'object') {
      // Handle date objects with {s, e, d} structure (possibly from a date library)
      console.warn('Unexpected date object received:', dateInput)
      if (dateInput.s !== undefined || dateInput.e !== undefined || dateInput.d !== undefined) {
        return 'Invalid Date Format'
      }
      // Try to convert object to date
      if (dateInput.toString) {
        date = new Date(dateInput.toString())
      } else {
        return 'Invalid Date Object'
      }
    } else if (typeof dateInput === 'number') {
      // Handle timestamps
      date = new Date(dateInput)
    } else {
      console.warn('Unsupported date type:', typeof dateInput, dateInput)
      return 'Invalid Date Type'
    }
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date created from input:', dateInput)
      return 'Invalid Date'
    }
    
    return date.toLocaleDateString()
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', dateInput)
    return 'Date Error'
  }
}

export const formatSafeDatetime = (dateInput: any): string => {
  if (!dateInput) return 'N/A'
  
  try {
    let date: Date
    
    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput)
    } else if (typeof dateInput === 'object') {
      console.warn('Unexpected datetime object received:', dateInput)
      if (dateInput.toString) {
        date = new Date(dateInput.toString())
      } else {
        return 'Invalid DateTime Object'
      }
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput)
    } else {
      return 'Invalid DateTime Type'
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid DateTime'
    }
    
    return date.toLocaleString()
  } catch (error) {
    console.error('DateTime formatting error:', error, 'Input:', dateInput)
    return 'DateTime Error'
  }
}

export const formatRelativeDate = (dateInput: any): string => {
  if (!dateInput) return 'N/A'
  
  try {
    let date: Date
    
    if (dateInput instanceof Date) {
      date = dateInput
    } else if (typeof dateInput === 'string') {
      date = new Date(dateInput)
    } else {
      return formatSafeDate(dateInput)
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    
    return date.toLocaleDateString()
  } catch (error) {
    console.error('Relative date formatting error:', error, 'Input:', dateInput)
    return formatSafeDate(dateInput)
  }
}

// Safe budget formatter for handling objects with {s, e, d} structure
export const formatSafeBudget = (budgetInput: any): string => {
  if (!budgetInput) return 'TBD'
  
  try {
    // Handle number directly
    if (typeof budgetInput === 'number') {
      return budgetInput.toString()
    }
    
    // Handle string
    if (typeof budgetInput === 'string') {
      return budgetInput
    }
    
    // Handle object with {s, e, d} structure (possibly from BigInt/Decimal)
    if (typeof budgetInput === 'object') {
      console.warn('Unexpected budget object received:', budgetInput)
      
      // Check for Decimal.js or Prisma BigInt structure
      if (budgetInput.s !== undefined && budgetInput.e !== undefined && budgetInput.d !== undefined) {
        // This appears to be a Decimal.js object
        if (Array.isArray(budgetInput.d) && budgetInput.d.length > 0) {
          return budgetInput.d[0].toString()
        }
        return 'Invalid Budget Format'
      }
      
      // Check for valueOf method (some numeric libraries)
      if (budgetInput.valueOf && typeof budgetInput.valueOf === 'function') {
        return budgetInput.valueOf().toString()
      }
      
      // Check for toString method
      if (budgetInput.toString && typeof budgetInput.toString === 'function') {
        const stringValue = budgetInput.toString()
        if (stringValue !== '[object Object]') {
          return stringValue
        }
      }
      
      return 'Invalid Budget Object'
    }
    
    return 'Invalid Budget Type'
  } catch (error) {
    console.error('Budget formatting error:', error, 'Input:', budgetInput)
    return 'Budget Error'
  }
}