const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
};

const generateBookingNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `BK-${dateStr}-${randomSuffix}`;
};

module.exports = {
  generateInvoiceNumber,
  generateBookingNumber
};
