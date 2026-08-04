export const formatCurrency = (amount, currency = 'PHP') => new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(amount)
