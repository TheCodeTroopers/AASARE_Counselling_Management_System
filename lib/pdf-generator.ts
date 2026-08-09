import PDFDocument from "pdfkit";

export async function generateCaseReportPDF(caseId: string, caseData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // ── Header Banner ──────────────────────────────────────────────────────────
      doc.rect(0, 0, 612, 60).fill("#6d214f"); // Dark magenta background

      doc
        .fillColor("#FFFFFF")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("AASARE COUNSELLING MANAGEMENT SYSTEM", 50, 15, { align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("OFFICIAL CASE REPORT SHEET (STRICTLY CONFIDENTIAL)", 50, 36, { align: "left" });

      doc.moveDown(2);

      // ── Case Overview Box ──────────────────────────────────────────────────────
      const startY = 80;
      doc
        .fillColor("#2f2f2f")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(`Case Reference ID: ${caseId}`, 50, startY);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Date of Record: ${caseData.caseDate || caseData.dateFirstInteraction || new Date().toISOString().slice(0, 10)}`,
          350,
          startY,
        );

      doc
        .moveTo(50, startY + 20)
        .lineTo(562, startY + 20)
        .strokeColor("#e2e8f0")
        .stroke();

      let currentY = startY + 30;

      // ── Section 1: Client Information ─────────────────────────────────────────
      doc
        .fontSize(12)
        .fillColor("#6d214f")
        .font("Helvetica-Bold")
        .text("1. CLIENT DEMOGRAPHICS", 50, currentY);

      currentY += 20;

      const demographics = [
        [
          "Client Name:",
          caseData.clientName || "N/A",
          "Age / Gender:",
          `${caseData.age || "N/A"} yrs / ${caseData.gender || "N/A"}`,
        ],
        [
          "Department:",
          caseData.department || "N/A",
          "Year / Semester:",
          caseData.yearSemester || "N/A",
        ],
        [
          "Role in Institute:",
          caseData.roleInInstitution || "Student",
          "Contact Number:",
          caseData.contactNumber || "N/A",
        ],
        ["Email Address:", caseData.email || "N/A", "Referred By:", caseData.referredBy || "Self"],
      ];

      doc.fontSize(9).font("Helvetica").fillColor("#333333");
      for (const row of demographics) {
        doc.font("Helvetica-Bold").text(row[0], 50, currentY, { width: 90 });
        doc.font("Helvetica").text(row[1], 140, currentY, { width: 140 });
        doc.font("Helvetica-Bold").text(row[2], 300, currentY, { width: 90 });
        doc.font("Helvetica").text(row[3], 390, currentY, { width: 170 });
        currentY += 16;
      }

      currentY += 10;
      doc.moveTo(50, currentY).lineTo(562, currentY).strokeColor("#e2e8f0").stroke();
      currentY += 15;

      // ── Section 2: Primary Concerns & Background ──────────────────────────────
      doc
        .fontSize(12)
        .fillColor("#6d214f")
        .font("Helvetica-Bold")
        .text("2. PRIMARY CONCERNS & BACKGROUND", 50, currentY);

      currentY += 20;

      const concerns = [
        ["Reason for Visit:", caseData.reasonForVisit || "None specified"],
        ["Family Background:", caseData.familyBackground || "N/A"],
        ["Academic Stressors:", caseData.academicStressors || "N/A"],
        ["Physical Health Issues:", caseData.physicalHealthIssues || "N/A"],
      ];

      for (const [label, val] of concerns) {
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333").text(label, 50, currentY);
        currentY += 14;
        doc.font("Helvetica").fillColor("#555555").text(val, 50, currentY, { width: 512 });
        currentY += doc.heightOfString(val, { width: 512 }) + 8;
      }

      doc.moveTo(50, currentY).lineTo(562, currentY).strokeColor("#e2e8f0").stroke();
      currentY += 15;

      // ── Section 3: Interventions & Observations ───────────────────────────────
      doc
        .fontSize(12)
        .fillColor("#6d214f")
        .font("Helvetica-Bold")
        .text("3. INTERVENTIONS & OBSERVATIONS", 50, currentY);

      currentY += 20;

      const interventions = [
        caseData.activeListening ? "• Active Listening & Empathy Session" : null,
        caseData.emotionalSupport ? "• Emotional Support & Confidential Reassurance" : null,
        caseData.stressManagementTips ? "• Stress Management & Breathing Exercises" : null,
        caseData.encouragedPeerFamilySupport
          ? "• Encouraged Peer and Family Support Systems"
          : null,
        caseData.sharedCollegeHelpline ? "• Shared College Helpline & Resource Access" : null,
      ].filter(Boolean);

      if (interventions.length > 0) {
        doc.fontSize(9).font("Helvetica").fillColor("#333333");
        for (const item of interventions) {
          doc.text(item!, 50, currentY);
          currentY += 14;
        }
      }

      currentY += 5;
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text("Counsellor Observations:", 50, currentY);
      currentY += 14;
      doc
        .font("Helvetica")
        .fillColor("#555555")
        .text(caseData.clientResponseObservations || "None recorded.", 50, currentY, {
          width: 512,
        });
      currentY +=
        doc.heightOfString(caseData.clientResponseObservations || "None recorded.", {
          width: 512,
        }) + 10;

      doc.moveTo(50, currentY).lineTo(562, currentY).strokeColor("#e2e8f0").stroke();
      currentY += 15;

      // ── Section 4: Follow-up & Sign-off ────────────────────────────────────────
      doc
        .fontSize(12)
        .fillColor("#6d214f")
        .font("Helvetica-Bold")
        .text("4. FOLLOW-UP & SIGN-OFF", 50, currentY);

      currentY += 20;

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text("Follow-up Required:", 50, currentY);
      doc
        .font("Helvetica")
        .text(
          caseData.isFollowupNeeded
            ? `Yes (Scheduled: ${caseData.nextFollowupDate || "TBD"})`
            : "No",
          160,
          currentY,
        );
      currentY += 16;

      doc.font("Helvetica-Bold").text("Planned Action Items:", 50, currentY);
      currentY += 14;
      doc
        .font("Helvetica")
        .fillColor("#555555")
        .text(caseData.actionsPlanned || "Standard follow-up as required.", 50, currentY, {
          width: 512,
        });
      currentY +=
        doc.heightOfString(caseData.actionsPlanned || "Standard follow-up as required.", {
          width: 512,
        }) + 20;

      // Signature Area
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#2f2f2f")
        .text(
          `Attending Counsellor: ${caseData.iccSignatureName || "Authorized Counsellor"}`,
          50,
          currentY,
        );

      doc
        .fontSize(8)
        .font("Helvetica-Oblique")
        .fillColor("#777777")
        .text("Generated securely by AASARE Counselling Management System", 50, currentY + 25);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
