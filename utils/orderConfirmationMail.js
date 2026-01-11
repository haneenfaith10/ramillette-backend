const generateOrderConfirmationEmail = (user, order, companyData) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0056b3;">Order Confirmation - #${order._id}</h2>
      <p>Hello ${user.username || user.email},</p>
      <p>Thank you for your purchase from Your ${
        companyData.companyName
      }! Your order has been placed successfully.</p>
      <p>If you have any questions, please contact us at ${
        companyData.companySupportEmail
      }.</p>
      <p>Best regards,<br>${companyData.companyName} Team</p>
    </div>
  `;
};

module.exports = generateOrderConfirmationEmail;
