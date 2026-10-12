import PDFDocument from 'pdfkit';

export const generateInvoicePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fillColor('#E31E24')
         .fontSize(24)
         .text('SnapDent India', { align: 'left' });
         
      doc.fillColor('#475569')
         .fontSize(10)
         .text('Premium Dental Solutions', { align: 'left' })
         .moveDown();

      // Invoice Title
      doc.fillColor('#1e293b')
         .fontSize(20)
         .text('INVOICE', { align: 'right' });

      doc.fontSize(10)
         .text(`Order Number: ${order.orderId}`, { align: 'right' })
         .text(`Date: ${new Date(order.createdAt).toLocaleString()}`, { align: 'right' })
         .text('GSTIN: 27AXMPP6694C1ZX', { align: 'right' })
         .moveDown();

      // Addresses
      doc.text('Bill To:', 50, 150)
         .font('Helvetica-Bold')
         .text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`)
         .font('Helvetica')
         .text(order.shippingAddress.street)
         .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`)
         .text(order.shippingAddress.postalCode)
         .text(`Phone: ${order.shippingAddress.phone}`);

      doc.text('From:', 350, 150)
         .font('Helvetica-Bold')
         .text('SnapDent India')
         .font('Helvetica')
         .text('Mumbai, Maharashtra')
         .text('India')
         .text('Email: support@snapdent.in')
         .text('Phone: +91 96652 00527');

      // Table Header
      const tableTop = 270;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 340, tableTop);
      doc.text('Price', 390, tableTop, { width: 80, align: 'right' });
      doc.text('Total', 470, tableTop, { width: 80, align: 'right' });
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Table Rows
      let y = tableTop + 25;
      doc.font('Helvetica');
      order.items.forEach(item => {
        doc.text(item.name, 50, y, { width: 280 });
        doc.text(item.qty.toString(), 340, y);
        doc.text(`Rs ${item.price.toFixed(2)}`, 390, y, { width: 80, align: 'right' });
        doc.text(`Rs ${(item.price * item.qty).toFixed(2)}`, 470, y, { width: 80, align: 'right' });
        y += 20;
      });

      doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
      y += 20;

      // Totals
      doc.font('Helvetica-Bold');
      doc.text('Subtotal:', 350, y, { width: 100, align: 'right' });
      doc.text(`Rs ${order.subtotal.toFixed(2)}`, 450, y, { width: 100, align: 'right' });
      y += 20;

      doc.text('Shipping:', 350, y, { width: 100, align: 'right' });
      doc.text(`Rs ${order.shipping.toFixed(2)}`, 450, y, { width: 100, align: 'right' });
      y += 20;

      doc.fontSize(14);
      doc.text('Total:', 350, y, { width: 100, align: 'right' });
      doc.fillColor('#E31E24')
         .text(`Rs ${order.total.toFixed(2)}`, 450, y, { width: 100, align: 'right' });

      // Footer
      doc.fontSize(10)
         .fillColor('#94a3b8')
         .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
