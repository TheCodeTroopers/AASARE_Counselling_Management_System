import PDFDocument from "pdfkit";

const PAGE_HEIGHT = 792; // US Letter portrait
const PAGE_WIDTH = 612;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 540 pt
const PAGE_BOTTOM = PAGE_HEIGHT - MARGIN;

// Design system tokens matching app/globals.css & CaseDetailsView
const COLOR_PRIMARY = "#6d214f"; // Primary burgundy
const COLOR_ACCENT = "#c89b7b"; // Accent warm bronze
const COLOR_SECONDARY = "#f8f3ee"; // Secondary soft cream card bg
const COLOR_BORDER = "#e8ddd5"; // Warm border line color
const COLOR_TEXT_DARK = "#2f2f2f"; // Dark warm foreground text
const COLOR_TEXT_MUTED = "#7e6e65"; // Muted label text
const COLOR_CHECK_GREEN = "#047857"; // Emerald green for checks
const COLOR_CHECK_BG = "#ecfdf5"; // Light emerald check fill
const COLOR_CHECK_UNCHECKED = "#94a3b8"; // Slate grey for unchecked

/**
 * Generates an official Case Report PDF with flex-items-center vertical centering
 * for consent rows and checkbox cards, matching the web UI layout.
 */
export async function generateCaseReportPDF(caseId: string, caseData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: MARGIN, size: "LETTER" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      let y = MARGIN;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > PAGE_BOTTOM) {
          doc.addPage();
          y = MARGIN;
          return true;
        }
        return false;
      };

      // ── Vector Checkbox Helper (CheckSquare vs Square) ─────────────────────
      const drawCheckboxIcon = (x: number, iconY: number, checked: boolean) => {
        if (checked) {
          doc
            .roundedRect(x, iconY, 13, 13, 3)
            .lineWidth(0.75)
            .strokeColor(COLOR_CHECK_GREEN)
            .fillAndStroke(COLOR_CHECK_BG, COLOR_CHECK_GREEN);

          doc
            .moveTo(x + 3.2, iconY + 6.5)
            .lineTo(x + 5.5, iconY + 9.5)
            .lineTo(x + 9.8, iconY + 3.8)
            .lineWidth(1.5)
            .strokeColor(COLOR_CHECK_GREEN)
            .stroke();
        } else {
          doc
            .roundedRect(x, iconY, 13, 13, 3)
            .lineWidth(0.75)
            .strokeColor(COLOR_CHECK_UNCHECKED)
            .fillAndStroke("#ffffff", COLOR_CHECK_UNCHECKED);
        }
      };

      const drawSectionHeader = (title: string, minContentHeight: number = 60) => {
        const headerHeight = 34;
        checkPageBreak(headerHeight + minContentHeight);

        doc
          .fillColor(COLOR_PRIMARY)
          .fontSize(12)
          .font("Helvetica-Bold")
          .text(title, MARGIN, y);
        y += 18;
        doc
          .moveTo(MARGIN, y)
          .lineTo(PAGE_WIDTH - MARGIN, y)
          .strokeColor(COLOR_BORDER)
          .lineWidth(0.75)
          .stroke();
        y += 10;
      };

      // ── Document Header (Exact match to CaseDetailsView UI) ─────────────────
      doc
        .fillColor(COLOR_ACCENT)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(
          "SHRI MADHWA VADIRAJA INSTITUTE OF TECHNOLOGY AND MANAGEMENT",
          MARGIN,
          y,
          { width: CONTENT_WIDTH, align: "center" }
        );
      y += 13;

      doc
        .fillColor(COLOR_TEXT_MUTED)
        .fontSize(8.25)
        .font("Helvetica")
        .text(
          "An Autonomous Institute Affiliated to VTU, Belagavi | Approved by AICTE, Accredited by NAAC with 'A' Grade",
          MARGIN,
          y,
          { width: CONTENT_WIDTH, align: "center" }
        );
      y += 15;

      doc
        .fillColor(COLOR_PRIMARY)
        .fontSize(18)
        .font("Times-Bold")
        .text("AASARE — Institutional Counseling Cell – Case Sheet", MARGIN, y, {
          width: CONTENT_WIDTH,
          align: "center",
        });
      y += 22;

      doc
        .fillColor(COLOR_TEXT_DARK)
        .fontSize(10.5)
        .font("Helvetica-Bold")
        .text("(Mental Health First Aid)", MARGIN, y, {
          width: CONTENT_WIDTH,
          align: "center",
        });
      y += 18;

      // Header bottom divider (border-b-2 border-primary)
      doc
        .moveTo(MARGIN, y)
        .lineTo(PAGE_WIDTH - MARGIN, y)
        .strokeColor(COLOR_PRIMARY)
        .lineWidth(1.5)
        .stroke();
      y += 12;

      // Case Meta info line
      doc
        .fillColor(COLOR_TEXT_MUTED)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Case Reference ID: ", MARGIN, y, { continued: true })
        .fillColor(COLOR_TEXT_DARK)
        .font("Helvetica")
        .text(caseId);

      const dateStr = `Date of Record: ${
        caseData.caseDate ||
        caseData.dateFirstInteraction ||
        new Date().toISOString().slice(0, 10)
      }`;
      doc
        .fillColor(COLOR_TEXT_MUTED)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(dateStr, MARGIN, y, { width: CONTENT_WIDTH, align: "right" });

      y += 18;
      doc
        .moveTo(MARGIN, y)
        .lineTo(PAGE_WIDTH - MARGIN, y)
        .strokeColor(COLOR_BORDER)
        .lineWidth(0.75)
        .stroke();
      y += 12;

      // ── 1. General Information ──────────────────────────────────────────────
      drawSectionHeader("1. General Information", 50);

      const drawGridCard = (
        x: number,
        boxY: number,
        w: number,
        label: string,
        val: string
      ) => {
        doc.font("Helvetica-Bold").fontSize(9);
        const labelH = doc.heightOfString(label, { width: w - 20 });
        doc.font("Helvetica").fontSize(10.5);
        const valH = doc.heightOfString(val || "N/A", { width: w - 20 });
        const boxH = Math.max(40, labelH + valH + 14);

        // bg-secondary (#f8f3ee soft cream card)
        doc.roundedRect(x, boxY, w, boxH, 8).fill(COLOR_SECONDARY);

        doc
          .fillColor(COLOR_TEXT_MUTED)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(label, x + 10, boxY + 7, { width: w - 20 });

        doc
          .fillColor(COLOR_TEXT_DARK)
          .fontSize(10.5)
          .font("Helvetica")
          .text(val || "N/A", x + 10, boxY + 7 + labelH + 3, {
            width: w - 20,
          });

        return boxH;
      };

      const colGap = 10;
      const halfW = (CONTENT_WIDTH - colGap) / 2;

      // Row 1
      checkPageBreak(45);
      const h1 = drawGridCard(
        MARGIN,
        y,
        halfW,
        "Client Name:",
        caseData.clientName || caseData.studentName || "N/A"
      );
      const h2 = drawGridCard(
        MARGIN + halfW + colGap,
        y,
        halfW,
        "Age / Gender:",
        `${caseData.age || "N/A"} · ${caseData.gender || "N/A"}`
      );
      y += Math.max(h1, h2) + 8;

      // Row 2
      checkPageBreak(45);
      const h3 = drawGridCard(
        MARGIN,
        y,
        halfW,
        "Role in Institution:",
        caseData.roleInInstitution || "Student"
      );
      const h4 = drawGridCard(
        MARGIN + halfW + colGap,
        y,
        halfW,
        "Department / Branch:",
        caseData.department || "General"
      );
      y += Math.max(h3, h4) + 8;

      // Row 3
      checkPageBreak(45);
      const h5 = drawGridCard(
        MARGIN,
        y,
        halfW,
        "Year / Semester:",
        caseData.yearSemester || caseData.semester || "N/A"
      );
      const h6 = drawGridCard(
        MARGIN + halfW + colGap,
        y,
        halfW,
        "Contact / Email:",
        `${caseData.contactNumber || "N/A"} · ${caseData.email || "N/A"}`
      );
      y += Math.max(h5, h6) + 8;

      // Row 4 (Full width)
      checkPageBreak(45);
      const refText = `${
        caseData.dateFirstInteraction || caseData.createdDate || "N/A"
      } · Referred by: ${caseData.referredBy || "Self"}${
        caseData.referredByOther ? ` (${caseData.referredByOther})` : ""
      }`;
      const h7 = drawGridCard(
        MARGIN,
        y,
        CONTENT_WIDTH,
        "Date of First Interaction / Referred By:",
        refText
      );
      y += h7 + 14;

      // ── 2. Reason for Visit ─────────────────────────────────────────────────
      drawSectionHeader("2. Reason for Visit / Concerns Expressed", 60);
      const reasonVal =
        caseData.reasonForVisit || "No concerns expressed recorded.";
      doc.font("Helvetica").fontSize(10.5);
      const reasonH = doc.heightOfString(reasonVal, { width: CONTENT_WIDTH - 24 });
      const reasonBoxH = Math.max(40, reasonH + 20);

      checkPageBreak(reasonBoxH + 10);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, reasonBoxH, 8).fill(COLOR_SECONDARY);
      doc
        .fillColor(COLOR_TEXT_DARK)
        .fontSize(10.5)
        .font("Helvetica")
        .text(reasonVal, MARGIN + 12, y + 10, { width: CONTENT_WIDTH - 24, lineGap: 3 });
      y += reasonBoxH + 14;

      // ── 3. Relevant Background ──────────────────────────────────────────────
      drawSectionHeader("3. Relevant Background", 50);

      const drawBorderedCard = (label: string, value: string) => {
        const valText = value || "None noted.";
        doc.font("Helvetica-Bold").fontSize(9);
        const lH = doc.heightOfString(label, { width: CONTENT_WIDTH - 24 });
        doc.font("Helvetica").fontSize(10.5);
        const vH = doc.heightOfString(valText, { width: CONTENT_WIDTH - 24 });
        const cardH = Math.max(36, lH + vH + 14);

        checkPageBreak(cardH + 6);
        doc
          .roundedRect(MARGIN, y, CONTENT_WIDTH, cardH, 8)
          .lineWidth(0.75)
          .strokeColor(COLOR_BORDER)
          .fillAndStroke("#ffffff", COLOR_BORDER);

        doc
          .fillColor(COLOR_TEXT_MUTED)
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(label, MARGIN + 12, y + 7, { width: CONTENT_WIDTH - 24 });

        doc
          .fillColor(COLOR_TEXT_DARK)
          .fontSize(10.5)
          .font("Helvetica")
          .text(valText, MARGIN + 12, y + 7 + lH + 3, {
            width: CONTENT_WIDTH - 24,
          });

        y += cardH + 6;
      };

      drawBorderedCard("Family / Personal Background:", caseData.familyBackground);
      drawBorderedCard("Academic / Work Stressors:", caseData.academicStressors);
      drawBorderedCard("Peer / Social Challenges:", caseData.peerChallenges);
      drawBorderedCard(
        "Recent Major Changes / Loss / Events:",
        caseData.recentMajorChanges
      );
      drawBorderedCard(
        "Physical / Health Issues (if shared):",
        caseData.physicalHealthIssues
      );
      y += 8;

      // ── 4. First Aid Response Provided ──────────────────────────────────────
      drawSectionHeader("4. First Aid Response Provided", 50);

      const drawCheckboxCard = (
        x: number,
        boxY: number,
        w: number,
        checked: boolean,
        label: string
      ) => {
        doc.font("Helvetica").fontSize(10.5);
        const textH = doc.heightOfString(label, { width: w - 36 });
        const boxH = Math.max(36, textH + 14);

        doc.roundedRect(x, boxY, w, boxH, 8).fill(COLOR_SECONDARY);

        // Flex items-center: Center both checkbox icon and text vertically in boxH
        const iconY = boxY + (boxH - 13) / 2;
        const textY = boxY + (boxH - textH) / 2;

        drawCheckboxIcon(x + 10, iconY, checked);

        doc
          .fillColor(COLOR_TEXT_DARK)
          .fontSize(10.5)
          .font("Helvetica")
          .text(label, x + 30, textY, { width: w - 36 });

        return boxH;
      };

      // Item 1 & 2
      checkPageBreak(40);
      const cb1H = drawCheckboxCard(
        MARGIN,
        y,
        halfW,
        Boolean(caseData.activeListening),
        `Active Listening${
          caseData.activeListeningNotes
            ? ` (${caseData.activeListeningNotes})`
            : ""
        }`
      );
      const cb2H = drawCheckboxCard(
        MARGIN + halfW + colGap,
        y,
        halfW,
        Boolean(caseData.emotionalSupport),
        `Emotional Support${
          caseData.emotionalSupportNotes
            ? ` (${caseData.emotionalSupportNotes})`
            : ""
        }`
      );
      y += Math.max(cb1H, cb2H) + 6;

      // Item 3 (Stress Management) - Full width
      checkPageBreak(40);
      const stressTipsStr = [
        caseData.stressTipsBreathing && "Breathing",
        caseData.stressTipsGrounding && "Grounding",
        caseData.stressTipsPositiveTalk && "Positive Talk",
        caseData.stressTipsOther,
      ]
        .filter(Boolean)
        .join(", ");
      const cb3H = drawCheckboxCard(
        MARGIN,
        y,
        CONTENT_WIDTH,
        Boolean(caseData.stressManagementTips),
        `Stress Management Tips: ${stressTipsStr || "Standard tips"}`
      );
      y += cb3H + 6;

      // Item 4 & 5
      checkPageBreak(40);
      const cb4H = drawCheckboxCard(
        MARGIN,
        y,
        halfW,
        Boolean(caseData.encouragedPeerFamilySupport),
        "Encouraged Peer / Family Support"
      );
      const cb5H = drawCheckboxCard(
        MARGIN + halfW + colGap,
        y,
        halfW,
        Boolean(caseData.sharedCollegeHelpline),
        "Shared Helpline / Mental Health Info"
      );
      y += Math.max(cb4H, cb5H) + 6;

      // Item 6 (Referral) - Full width
      checkPageBreak(40);
      const refDetails = `${
        caseData.referralICCCoordinator ? "Informed ICC Coordinator " : ""
      }${
        caseData.referralToDetails
          ? `Referred to: ${caseData.referralToDetails}`
          : "None"
      }`;
      const cb6H = drawCheckboxCard(
        MARGIN,
        y,
        CONTENT_WIDTH,
        Boolean(caseData.referralProfessionalHelp),
        `Referral to Professional Help: ${refDetails}`
      );
      y += cb6H + 14;

      // ── 5. Client Response and Observations ─────────────────────────────────
      drawSectionHeader("5. Client Response and Observations", 60);
      const obsVal =
        caseData.clientResponseObservations || "No observations recorded.";
      doc.font("Helvetica").fontSize(10.5);
      const obsH = doc.heightOfString(obsVal, { width: CONTENT_WIDTH - 24 });
      const obsBoxH = Math.max(40, obsH + 20);

      checkPageBreak(obsBoxH + 10);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, obsBoxH, 8).fill(COLOR_SECONDARY);
      doc
        .fillColor(COLOR_TEXT_DARK)
        .fontSize(10.5)
        .font("Helvetica")
        .text(obsVal, MARGIN + 12, y + 10, { width: CONTENT_WIDTH - 24, lineGap: 3 });
      y += obsBoxH + 14;

      // ── 6. Follow-Up ─────────────────────────────────────────────────────────
      drawSectionHeader("6. Follow-Up", 50);

      checkPageBreak(45);
      const fu1H = drawGridCard(
        MARGIN,
        y,
        halfW,
        "Follow-Up Needed:",
        caseData.isFollowupNeeded ? "Yes" : "No"
      );
      let fu2H = 0;
      if (caseData.isFollowupNeeded) {
        fu2H = drawGridCard(
          MARGIN + halfW + colGap,
          y,
          halfW,
          "Next Follow-Up Date:",
          caseData.nextFollowupDate || "TBD"
        );
      }
      y += Math.max(fu1H, fu2H) + 6;

      checkPageBreak(45);
      const fu3H = drawGridCard(
        MARGIN,
        y,
        CONTENT_WIDTH,
        "Actions Planned:",
        caseData.actionsPlanned || "None specified."
      );
      y += fu3H + 14;

      // ── 7. Consent & Confidentiality & Signatures ───────────────────────────
      drawSectionHeader("7. Consent & Confidentiality", 90);

      const drawConsentRow = (checked: boolean, label: string) => {
        doc.font("Helvetica").fontSize(9.5);
        const textH = doc.heightOfString(label, { width: CONTENT_WIDTH - 22 });
        const rowH = Math.max(20, textH + 4);

        checkPageBreak(rowH);

        // Flex items-center: Center both 13x13 checkbox icon and text vertically in rowH
        const iconY = y + (rowH - 13) / 2;
        const textY = y + (rowH - textH) / 2;

        drawCheckboxIcon(MARGIN, iconY, checked);

        doc
          .fillColor(COLOR_TEXT_DARK)
          .fontSize(9.5)
          .font("Helvetica")
          .text(label, MARGIN + 22, textY, { width: CONTENT_WIDTH - 22 });

        y += rowH + 6;
      };

      drawConsentRow(
        caseData.consentInfoPolicy !== false,
        "The individual was informed about the nature of support and the confidentiality policy."
      );
      drawConsentRow(
        caseData.consentVerbal !== false,
        "Verbal consent was taken to proceed with first aid support and basic documentation."
      );

      y += 10;
      checkPageBreak(70);

      // Section divider (border-t-2 border-border)
      doc
        .moveTo(MARGIN, y)
        .lineTo(PAGE_WIDTH - MARGIN, y)
        .strokeColor(COLOR_BORDER)
        .lineWidth(1.5)
        .stroke();
      y += 16;

      // Signatures
      doc
        .fillColor(COLOR_TEXT_MUTED)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("ICC FACULTY / HR CO. SIGNATURE:", MARGIN, y);

      doc
        .fillColor(COLOR_TEXT_MUTED)
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("DATE:", MARGIN + halfW + colGap, y);

      y += 16;

      doc
        .fillColor(COLOR_PRIMARY)
        .fontSize(14)
        .font("Times-Bold")
        .text(caseData.iccSignatureName || "Dr. Deepika B V", MARGIN, y);

      doc
        .fillColor(COLOR_TEXT_DARK)
        .fontSize(10.5)
        .font("Helvetica")
        .text(
          caseData.caseDate ||
            caseData.createdDate ||
            new Date().toISOString().slice(0, 10),
          MARGIN + halfW + colGap,
          y
        );

      y += 28;
      doc
        .fillColor(COLOR_TEXT_MUTED)
        .fontSize(8)
        .font("Helvetica-Oblique")
        .text(
          "Generated securely by AASARE Counselling Management System",
          MARGIN,
          y,
          { width: CONTENT_WIDTH, align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
