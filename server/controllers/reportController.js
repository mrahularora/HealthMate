const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Appointment = require('../models/Appointments');

exports.generateReport = async (req, res) => {
  const { appointmentId, slotId } = req.params;

  try {
    // Fetch the appointment and time slot details
    const appointment = await Appointment.findById(appointmentId).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const timeSlot = appointment.timeSlots.id(slotId);
    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    // Check if the appointment status is 'Completed'
    if (timeSlot.status !== "Completed") {
      return res.status(400).json({ message: "Report can only be generated for completed appointments." });
    }

    // Ensure the reports directory exists
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    // Generate PDF file path
    const pdfFileName = `Appointment_${appointmentId}_${slotId}.pdf`;
    const pdfPath = path.join(reportsDir, pdfFileName);

    // Create and write the PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Add branding and header
    doc.fontSize(22).text('HealthMate', { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(18).text('Appointment Report', { align: 'center' });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Add doctor details
    doc.fontSize(14).text(`Doctor: ${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`);
    doc.text(`Email: ${appointment.doctorId.email}`);
    doc.moveDown();

    // Add patient details
    doc.fontSize(16).text('Patient Details:', { underline: true });
    doc.fontSize(14).text(`Name: ${timeSlot.userDetails.firstName} ${timeSlot.userDetails.lastName}`);
    doc.text(`Email: ${timeSlot.userDetails.email}`);
    doc.text(`Phone: ${timeSlot.userDetails.phone}`);
    doc.text(`Address: ${timeSlot.userDetails.address}`);
    doc.text(`Blood Group: ${timeSlot.userDetails.bloodGroup}`);
    doc.text(`Illness: ${timeSlot.userDetails.illness}`);
    doc.text(`Notes: ${timeSlot.userDetails.notes}`);
    doc.moveDown();

    // Add prescription details
    doc.fontSize(16).text('Prescription:', { underline: true });
    timeSlot.prescription.medicines.forEach((medicine, index) => {
      doc.text(`${index + 1}. ${medicine.name} - ${medicine.dosage} for ${medicine.duration}`);
    });
    doc.text(`Doctor's Notes: ${timeSlot.prescription.notes}`);
    doc.text(`Advice: ${timeSlot.prescription.advice}`);
    doc.moveDown();

    // Footer
    doc.fontSize(12).text('Thank you for using HealthMate!', { align: 'center' });
    doc.text('Visit us at www.healthmate.com for more information.', { align: 'center' });
    doc.end();

    // Wait for the PDF to finish writing
    writeStream.on('finish', async () => {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000'; // Fallback to localhost for development
      const publicReportPath = `${baseUrl}/reports/${pdfFileName}`;

      // Save the PDF path in the database
      timeSlot.reportPath = publicReportPath;
      await appointment.save();

      return res.status(200).json({
        message: "Report generated successfully",
        reportPath: publicReportPath,
      });
    });

    writeStream.on('error', (error) => {
      console.error('Error writing PDF:', error);
      return res.status(500).json({ message: "Error generating report", error: error.message });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating report", error: error.message });
  }
};
