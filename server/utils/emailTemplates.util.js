const buildEmailTemplate = (type, data) => {
  const { bookingNumber, serviceName, companyName, customerName, date, time, totalAmount, status } = data;

  let subject = `Smart Home Care - Booking Update (${bookingNumber})`;
  let body = '';

  switch (type) {
    case 'BOOKING_CREATED':
      subject = `Booking Confirmation - ${bookingNumber}`;
      body = `
        <h2>Thank you for your booking, ${customerName}!</h2>
        <p>Your service request <strong>${serviceName}</strong> with <strong>${companyName}</strong> has been received.</p>
        <p><strong>Scheduled Date:</strong> ${date} at ${time}</p>
        <p><strong>Total Amount:</strong> $${totalAmount}</p>
        <p>Status: Pending Provider Confirmation</p>
      `;
      break;

    case 'BOOKING_ACCEPTED':
      subject = `Booking Accepted - ${bookingNumber}`;
      body = `
        <h2>Good news, ${customerName}!</h2>
        <p><strong>${companyName}</strong> has accepted your booking request for <strong>${serviceName}</strong>.</p>
        <p><strong>Scheduled Date:</strong> ${date} at ${time}</p>
      `;
      break;

    case 'EMPLOYEE_ASSIGNED':
      subject = `Technician Assigned - ${bookingNumber}`;
      body = `
        <h2>Technician Assigned!</h2>
        <p>A certified service technician from <strong>${companyName}</strong> has been assigned to your booking.</p>
        <p><strong>Service Date:</strong> ${date} at ${time}</p>
      `;
      break;

    case 'PAYMENT_SUCCESS':
      subject = `Payment Receipt - ${bookingNumber}`;
      body = `
        <h2>Payment Successful!</h2>
        <p>We received your payment of <strong>$${totalAmount}</strong> for booking <strong>${bookingNumber}</strong>.</p>
      `;
      break;

    default:
      body = `<p>Booking ${bookingNumber} status changed to ${status}.</p>`;
  }

  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <div style="background: #2563eb; color: #fff; padding: 15px 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin:0; font-size: 20px;">Smart Home Care & Maintenance</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          ${body}
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from Smart Home Care Marketplace.</p>
        </div>
      </div>
    `
  };
};

module.exports = {
  buildEmailTemplate
};
