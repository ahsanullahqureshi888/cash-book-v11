/**
 * Client-side Transaction Input Validation Schema
 */
export const transactionSchema = {
  validate: (data, type) => {
    const errors = {};
    
    // Validate Date: prevent future dates
    if (!data.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      // Set to very end of today to allow local timezone overlap
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errors.date = 'Date cannot be in the future';
      }
    }
    
    // Validate Account Name
    if (!data.account_name || !data.account_name.trim()) {
      errors.account_name = 'Account / Contact name is required';
    }
    
    // Validate Detail
    if (!data.detail || !data.detail.trim()) {
      errors.detail = 'Detail description is required';
    }
    
    // Validate Amounts: at least one of cash_amount or usd_amount must be > 0
    const cashVal = parseFloat(data.cash_amount || 0);
    const usdVal = parseFloat(data.usd_amount || 0);
    if (cashVal <= 0 && usdVal <= 0) {
      errors.amount = 'Enter an AFN or USD amount greater than zero';
    }
    
    // Validate Exchange Rate: must be > 0 if USD amount is entered
    if (usdVal > 0) {
      const rateVal = parseFloat(data.exchange_rate || 0);
      if (rateVal <= 0) {
        errors.exchange_rate = 'Exchange rate is required when USD amount is entered';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
