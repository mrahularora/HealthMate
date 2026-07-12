const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
require("../models/User");
const Appointment = require("../models/Appointments");

const COLORS = {
  navy: "#123c69",
  teal: "#0b7f8f",
  pink: "#ed0d63",
  green: "#15803d",
  ink: "#102a43",
  body: "#334155",
  muted: "#64748b",
  line: "#dbe7f0",
  pale: "#f6fbfd",
  white: "#ffffff",
};

const getValue = (value, fallback = "Not provided") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
};

const fullName = (person = {}) =>
  [person.firstName, person.lastName].filter(Boolean).join(" ") ||
  person.name ||
  "Not provided";

const formatDate = (date) => {
  if (!date) return "Not provided";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const drawFooter = (doc) => {
  const footerY = 780;

  doc
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .moveTo(36, footerY - 8)
    .lineTo(doc.page.width - 36, footerY - 8)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(COLORS.muted)
    .text("HealthMate appointment report", 36, footerY, {
      width: 240,
      lineBreak: false,
    })
    .text("Page 1 of 1", doc.page.width - 116, footerY, {
      width: 80,
      align: "right",
      lineBreak: false,
    });
};

const sectionTitle = (doc, title, x, y, width) => {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(COLORS.ink)
    .text(title, x, y, { width });

  doc
    .strokeColor(COLORS.teal)
    .lineWidth(1.2)
    .moveTo(x, y + 16)
    .lineTo(x + width, y + 16)
    .stroke();
};

const field = (doc, label, value, x, y, width, height = 32) => {
  doc
    .roundedRect(x, y, width, height, 5)
    .fillAndStroke(COLORS.pale, COLORS.line);

  doc
    .font("Helvetica-Bold")
    .fontSize(6.5)
    .fillColor(COLORS.muted)
    .text(label.toUpperCase(), x + 8, y + 6, {
      width: width - 16,
      height: 8,
      ellipsis: true,
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(COLORS.ink)
    .text(getValue(value), x + 8, y + 17, {
      width: width - 16,
      height: height - 20,
      ellipsis: true,
    });
};

const infoGrid = (doc, items, x, y, width, columns = 2, rowHeight = 34) => {
  const gap = 8;
  const cardWidth = (width - gap * (columns - 1)) / columns;

  items.forEach((item, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    field(
      doc,
      item.label,
      item.value,
      x + column * (cardWidth + gap),
      y + row * (rowHeight + 8),
      cardWidth,
      rowHeight
    );
  });
};

const paragraphCard = (doc, label, text, x, y, width, height) => {
  const value = getValue(text, "None recorded");

  doc
    .roundedRect(x, y, width, height, 5)
    .fillAndStroke(COLORS.white, COLORS.line);

  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .fillColor(COLORS.teal)
    .text(label.toUpperCase(), x + 8, y + 7, {
      width: width - 16,
      height: 9,
      ellipsis: true,
    });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(COLORS.body)
    .text(value, x + 8, y + 20, {
      width: width - 16,
      height: height - 27,
      lineGap: 1,
      ellipsis: true,
    });
};

const medicineTable = (doc, medicines = [], x, y, width, height) => {
  const columns = [28, width * 0.38, width * 0.27, width - 28 - width * 0.38 - width * 0.27];
  const headerHeight = 20;
  const rowHeight = 25;
  const rows = medicines.slice(0, Math.floor((height - headerHeight) / rowHeight));

  doc.roundedRect(x, y, width, headerHeight, 5).fill(COLORS.navy);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(COLORS.white);
  ["#", "Medicine", "Dosage", "Duration"].forEach((heading, index) => {
    const columnX = x + columns.slice(0, index).reduce((sum, value) => sum + value, 0);
    doc.text(heading, columnX + 7, y + 7, {
      width: columns[index] - 12,
      height: 9,
      ellipsis: true,
    });
  });

  if (rows.length === 0) {
    doc
      .rect(x, y + headerHeight, width, rowHeight)
      .fillAndStroke(COLORS.pale, COLORS.line)
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text("No medicines were added to this report.", x + 8, y + headerHeight + 8, {
        width: width - 16,
        height: 10,
        ellipsis: true,
      });
    return;
  }

  rows.forEach((medicine, index) => {
    const rowY = y + headerHeight + index * rowHeight;

    doc
      .rect(x, rowY, width, rowHeight)
      .fillAndStroke(index % 2 === 0 ? COLORS.white : COLORS.pale, COLORS.line);

    const values = [
      String(index + 1),
      getValue(medicine.name),
      getValue(medicine.dosage),
      getValue(medicine.duration),
    ];

    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.body);
    values.forEach((value, columnIndex) => {
      const columnX =
        x +
        columns.slice(0, columnIndex).reduce((sum, columnWidth) => sum + columnWidth, 0);
      doc.text(value, columnX + 7, rowY + 8, {
        width: columns[columnIndex] - 12,
        height: 10,
        ellipsis: true,
      });
    });
  });
};

const hero = (doc, { generatedAt, status, reportId }) => {
  const width = doc.page.width - 72;
  const y = 34;

  doc
    .roundedRect(36, y, width, 72, 8)
    .fill(COLORS.navy);

  doc
    .rect(36, y + 52, width, 20)
    .fill(COLORS.teal);

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(COLORS.white)
    .text("HealthMate", 52, y + 16);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#d8edf3")
    .text("Clinical appointment report", 52, y + 39, {
      width: 260,
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.white)
    .text("Appointment Report", doc.page.width - 206, y + 18, {
      width: 154,
      align: "right",
    });

  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor("#d8edf3")
    .text(`Generated: ${generatedAt}`, doc.page.width - 246, y + 37, {
      width: 194,
      align: "right",
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .fillColor(COLORS.white)
    .text(`Status: ${status}`, 52, y + 58, {
      width: 220,
      lineBreak: false,
    })
    .text(`Report ID: ${reportId}`, doc.page.width - 246, y + 58, {
      width: 194,
      align: "right",
      lineBreak: false,
    });
};

exports.generateReport = async (req, res) => {
  const { appointmentId, slotId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId).populate("doctorId");
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const timeSlot = appointment.timeSlots.id(slotId);
    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    if (timeSlot.status !== "Completed") {
      return res
        .status(400)
        .json({ message: "Report can only be generated for completed appointments." });
    }

    const reportsDir = path.join(__dirname, "../reports");
    fs.mkdirSync(reportsDir, { recursive: true });

    const pdfFileName = `Appointment_${appointmentId}_${slotId}.pdf`;
    const pdfPath = path.join(reportsDir, pdfFileName);
    const publicBaseUrl = process.env.BASE_URL || "http://localhost:5000";
    const publicReportPath = `${publicBaseUrl}/reports/${pdfFileName}`;
    const patient = timeSlot.userDetails || {};
    const doctor = appointment.doctorId || {};
    const prescription = {
      medicines: [],
      notes: "",
      advice: "",
      ...(timeSlot.prescription || {}),
    };

    const doc = new PDFDocument({
      size: "A4",
      margin: 36,
      bufferPages: true,
      info: {
        Title: "HealthMate Appointment Report",
        Author: "HealthMate",
        Subject: `Appointment report for ${fullName(patient)}`,
      },
    });
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    hero(doc, {
      generatedAt: new Date().toLocaleString(),
      status: timeSlot.status,
      reportId: `${appointmentId.slice(-6)}-${slotId.slice(-6)}`,
    });

    sectionTitle(doc, "Visit Summary", 36, 124, 252);
    infoGrid(
      doc,
      [
        { label: "Appointment date", value: formatDate(appointment.date) },
        { label: "Time", value: `${getValue(timeSlot.startTime)} - ${getValue(timeSlot.endTime)}` },
        { label: "Doctor", value: fullName(doctor) },
        { label: "Doctor email", value: doctor.email },
      ],
      36,
      150,
      252,
      2,
      34
    );

    sectionTitle(doc, "Patient Details", 307, 124, 252);
    infoGrid(
      doc,
      [
        { label: "Patient", value: fullName(patient) },
        { label: "Email", value: patient.email },
        { label: "Phone", value: patient.phone },
        { label: "Blood group", value: patient.bloodGroup || "N/A" },
        { label: "Address", value: patient.address },
        { label: "Reason for visit", value: patient.illness || "Consultation" },
      ],
      307,
      150,
      252,
      2,
      34
    );

    paragraphCard(doc, "Patient notes", patient.notes, 36, 274, 523, 64);

    sectionTitle(doc, "Prescription", 36, 360, 523);
    medicineTable(doc, prescription.medicines || [], 36, 386, 523, 170);

    sectionTitle(doc, "Clinical Notes", 36, 580, 523);
    paragraphCard(doc, "Doctor notes", prescription.notes, 36, 606, 252, 88);
    paragraphCard(doc, "Advice", prescription.advice, 307, 606, 252, 88);
    paragraphCard(
      doc,
      "Follow-up",
      "Please follow the doctor's advice and book follow-up care if symptoms continue.",
      36,
      710,
      252,
      54
    );
    paragraphCard(
      doc,
      "Report URL",
      publicReportPath,
      307,
      710,
      252,
      54
    );

    drawFooter(doc);
    doc.end();

    writeStream.on("finish", async () => {
      timeSlot.reportPath = publicReportPath;
      await appointment.save();

      return res.status(200).json({
        message: "Report generated successfully",
        reportPath: publicReportPath,
      });
    });

    writeStream.on("error", (error) => {
      console.error("Error writing PDF:", error);
      return res.status(500).json({
        message: "Error generating report",
        error: error.message,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
};
