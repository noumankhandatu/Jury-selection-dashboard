/* eslint-disable @typescript-eslint/no-explicit-any */

export async function exportSessionReport({
  session,
  sessionStats,
  strikeRecommendations,
  selectedJurors = [],
}: {
  session: any | null;
  sessionStats: any | null;
  strikeRecommendations: any | null;
  selectedJurors?: Array<{
    id: string;
    name: string;
    jurorNumber?: string | null;
    panelPosition?: number | null;
  }>;
}) {
  try {
    const jsPDFMod: any = await import("jspdf");
    const jsPDF = jsPDFMod.default || jsPDFMod;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    /* ===============================
       PAGE CONSTANTS & CONFIGURATION
    =============================== */
    const PAGE_TOP = 50;
    const PAGE_BOTTOM = 780;
    const marginX = 40;
    const marginRight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - marginX - marginRight;
    const centerX = pageWidth / 2;

    // Color palette for professional legal documents
    const colors = {
      primary: [31, 78, 121], // Dark blue
      secondary: [70, 130, 180], // Steel blue
      accent: [220, 53, 69], // Red for strikes
      success: [40, 167, 69], // Green for ideal
      warning: [255, 193, 7], // Amber for neutral
      text: [33, 37, 41], // Dark gray
      lightGray: [248, 249, 250], // Light background
      border: [206, 212, 218], // Border gray
    };

    let y = PAGE_TOP;
    let pageNumber = 1;

    /* ===============================
       ENHANCED HELPER FUNCTIONS
    =============================== */

    const addPageNumber = () => {
      const oldY = y;
      setFont(false, 9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${pageNumber}`, pageWidth - marginRight, pageHeight - 30, {
        align: "right",
      });
      doc.setTextColor(...colors.text);
      y = oldY;
      pageNumber++;
    };

    const ensurePage = () => {
      if (y > PAGE_BOTTOM) {
        addPageNumber();
        doc.addPage();
        y = PAGE_TOP;
      }
    };

    const ensureSpace = (space = 40) => {
      if (y + space > PAGE_BOTTOM) {
        addPageNumber();
        doc.addPage();
        y = PAGE_TOP;
      }
    };

    const setFont = (bold = false, size = 11) => {
      doc.setFont("Helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
    };

    const drawLine = (color = colors.border, thickness = 0.5) => {
      ensurePage();
      doc.setDrawColor(...color);
      doc.setLineWidth(thickness);
      doc.line(marginX, y, pageWidth - marginRight, y);
      y += 8;
    };

    const text = (
      t: string,
      x: number,
      bold = false,
      size = 11,
      color = colors.text
    ) => {
      ensurePage();
      setFont(bold, size);
      doc.setTextColor(...color);
      doc.text(t, x, y);
      y += size * 1.2;
      doc.setTextColor(...colors.text);
    };

    const textRight = (
      t: string,
      bold = false,
      size = 11,
      color = colors.text
    ) => {
      ensurePage();
      setFont(bold, size);
      doc.setTextColor(...color);
      doc.text(t, pageWidth - marginRight, y, { align: "right" });
      y += size * 1.2;
      doc.setTextColor(...colors.text);
    };

    const textCenter = (
      t: string,
      bold = false,
      size = 11,
      color = colors.text
    ) => {
      ensurePage();
      setFont(bold, size);
      doc.setTextColor(...color);
      doc.text(t, centerX, y, { align: "center" });
      y += size * 1.2;
      doc.setTextColor(...colors.text);
    };

    const wrapText = (
      t: string,
      x: number,
      maxWidth: number,
      bold = false,
      size = 10,
      lineHeight = 1.4
    ) => {
      setFont(bold, size);
      const parts = doc.splitTextToSize(t, maxWidth);
      parts.forEach((p: string) => {
        ensurePage();
        doc.text(p, x, y);
        y += size * lineHeight;
      });
    };

    const sectionHeader = (title: string, icon = "") => {
      ensureSpace(30);
      y += 6;
      doc.setFillColor(...colors.primary);
      doc.rect(marginX, y - 14, contentWidth, 20, "F");
      setFont(true, 12);
      doc.setTextColor(255, 255, 255);
      doc.text(icon ? `${icon} ${title}` : title, marginX + 8, y);
      doc.setTextColor(...colors.text);
      y += 16;
    };

    const drawBox = (height: number, fillColor?: number[]) => {
      const startY = y;
      if (fillColor) {
        doc.setFillColor(...fillColor);
        doc.rect(marginX, startY, contentWidth, height, "F");
      }
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.5);
      doc.rect(marginX, startY, contentWidth, height, "S");
    };

    const tableRow = (
      label: string,
      value: string,
      labelWidth = 200,
      boldValue = true
    ) => {
      ensurePage();
      setFont(false, 10);
      doc.text(label, marginX + 8, y);
      setFont(boldValue, 10);
      doc.text(value, marginX + labelWidth, y);
      y += 12;
    };

    /* ===============================
       HEADER WITH LOGO & TITLE
    =============================== */

    let logoLoaded = false;
    try {
      const resp = await fetch("/pdflogo.png");
      if (resp.ok) {
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, "PNG", marginX, y, 40, 40);
        logoLoaded = true;
      }
    } catch {
      // ignore logo
    }

    if (logoLoaded) {
      const titleY = y + 15;
      setFont(true, 18);
      doc.setTextColor(...colors.primary);
      doc.text("JURY SELECTION ANALYSIS REPORT", marginX + 50, titleY);
      setFont(false, 9);
      doc.setTextColor(100, 100, 100);
      doc.text("Confidential Legal Document", marginX + 50, titleY + 16);
      doc.setTextColor(...colors.text);
      y += 50;
    } else {
      textCenter("JURY SELECTION ANALYSIS REPORT", true, 18, colors.primary);
      textCenter("Confidential Legal Document", false, 9, [100, 100, 100]);
    }

    y += 8;
    drawLine(colors.primary, 2);
    y += 4;

    /* ===============================
       DOCUMENT METADATA TABLE
    =============================== */

    const sessionName =
      session?.name || sessionStats?.session?.name || "Untitled Session";
    const caseName = session?.caseName || "—";
    const issued = new Date().toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });

    ensureSpace(60);
    const metaBoxStart = y;

    // Draw box background first
    doc.setFillColor(250, 250, 252);
    doc.rect(marginX, metaBoxStart, contentWidth, 60, "F");
    doc.setDrawColor(...colors.border);
    doc.rect(marginX, metaBoxStart, contentWidth, 60, "S");

    y += 8;

    // Then draw text on top
    tableRow("Session Name:", sessionName, 140);
    tableRow("Case:", caseName, 140);
    tableRow("Report Generated:", issued, 140);
    tableRow("Status:", session?.status || "Active", 140);

    y += 8;

    /* ===============================
       SESSION SUMMARY
    =============================== */

    sectionHeader("Executive Summary", "📋");
    y += 4;
    wrapText(
      session?.summary || "No session summary provided.",
      marginX + 8,
      contentWidth - 16,
      false,
      10,
      1.5
    );
    y += 8;

    /* ===============================
       KEY METRICS OVERVIEW
    =============================== */

    sectionHeader("Key Metrics", "📊");

    const ov = sessionStats?.overview || {};
    const perf = sessionStats?.performance || {};

    ensureSpace(80);
    const metricsBoxStart = y;

    // Draw box background first
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, metricsBoxStart, contentWidth, 80, "F");
    doc.setDrawColor(...colors.border);
    doc.rect(marginX, metricsBoxStart, contentWidth, 80, "S");

    y += 10;

    // Create a compact 2-column layout
    const col1X = marginX + 8;
    const col2X = marginX + contentWidth / 2 + 8;
    const colWidth = contentWidth / 2 - 16;

    const metrics = [
      ["Total Jurors", String(ov.totalJurors ?? 0)],
      ["Total Responses", String(ov.totalResponses ?? 0)],
      ["Total Assessments", String(ov.totalAssessments ?? 0)],
      ["Avg. Suitability", `${Math.round(perf.averageScore ?? 0)}%`],
      ["Completion Rate", `${Math.round(ov.completionRate ?? 0)}%`],
    ];

    metrics.forEach(([label, value], idx) => {
      const x = idx % 2 === 0 ? col1X : col2X;
      if (idx % 2 === 0 && idx > 0) y += 14;

      setFont(false, 9);
      doc.setTextColor(100, 100, 100);
      doc.text(label, x, y);
      setFont(true, 11);
      doc.setTextColor(...colors.primary);
      doc.text(value, x + 120, y);
      doc.setTextColor(...colors.text);
    });

    y += 14 + 8;

    /* ===============================
       PERFORMANCE DISTRIBUTION
    =============================== */

    sectionHeader("Performance Distribution", "📈");

    ensureSpace(70);
    const perfBoxStart = y;

    // Draw box background first
    doc.setFillColor(255, 255, 255);
    doc.rect(marginX, perfBoxStart, contentWidth, 70, "F");
    doc.setDrawColor(...colors.border);
    doc.rect(marginX, perfBoxStart, contentWidth, 70, "S");

    y += 10;

    const perfData = [
      {
        label: "Ideal for Case (80%+)",
        count: perf.highPerformers ?? 0,
        color: colors.success,
        icon: "✓",
      },
      {
        label: "Neutral (60-79%)",
        count: perf.mediumPerformers ?? 0,
        color: colors.warning,
        icon: "◐",
      },
      {
        label: "Recommend Strike (<60%)",
        count: perf.lowPerformers ?? 0,
        color: colors.accent,
        icon: "✗",
      },
    ];

    perfData.forEach((item) => {
      ensurePage();

      // Color indicator
      doc.setFillColor(...item.color);
      doc.circle(marginX + 12, y - 3, 4, "F");

      setFont(false, 10);
      doc.text(`${item.icon} ${item.label}`, marginX + 24, y);
      setFont(true, 11);
      doc.setTextColor(...item.color);
      doc.text(String(item.count), pageWidth - marginRight - 40, y);
      doc.setTextColor(...colors.text);

      y += 16;
    });

    y += 8;

    /* ===============================
       STRIKE RECOMMENDATIONS
    =============================== */

    if (strikeRecommendations) {
      sectionHeader("Strike Recommendations", "⚖️");

      const summary = strikeRecommendations.summary || {
        strikeForCause: 0,
        peremptoryStrike: 0,
        total: 0,
      };

      ensureSpace(40);
      const summaryBoxStart = y;

      // Draw box background first
      doc.setFillColor(255, 248, 248);
      doc.rect(marginX, summaryBoxStart, contentWidth, 38, "F");
      doc.setDrawColor(...colors.accent);
      doc.setLineWidth(1);
      doc.rect(marginX, summaryBoxStart, contentWidth, 38, "S");

      y += 10;

      setFont(false, 9);
      doc.setTextColor(100, 100, 100);
      doc.text("Strike for Cause:", marginX + 8, y);
      setFont(true, 11);
      doc.setTextColor(...colors.accent);
      doc.text(String(summary.strikeForCause), marginX + 120, y);

      setFont(false, 9);
      doc.setTextColor(100, 100, 100);
      doc.text("Peremptory Strikes:", marginX + 200, y);
      setFont(true, 11);
      doc.setTextColor(...colors.accent);
      doc.text(String(summary.peremptoryStrike), marginX + 320, y);

      setFont(false, 9);
      doc.setTextColor(100, 100, 100);
      doc.text("Total Reviewed:", marginX + 400, y);
      setFont(true, 11);
      doc.setTextColor(...colors.text);
      doc.text(String(summary.total), marginX + 490, y);

      y += 14 + 12;

      // Individual Strike Recommendations
      if (
        Array.isArray(strikeRecommendations.results) &&
        strikeRecommendations.results.length > 0
      ) {
        strikeRecommendations.results.forEach((rec: any, idx: number) => {
          ensureSpace(100);

          const recBoxStart = y;

          // Calculate approximate box height first
          const estimatedHeight = 120; // Base height for juror info

          // Draw box background first
          doc.setFillColor(252, 252, 253);
          doc.rect(marginX, recBoxStart, contentWidth, estimatedHeight, "F");
          doc.setDrawColor(...colors.border);
          doc.setLineWidth(0.5);
          doc.rect(marginX, recBoxStart, contentWidth, estimatedHeight, "S");

          y += 10;

          // Juror Header
          const jurorIdentifier =
            rec.panelPosition !== null && rec.panelPosition !== undefined
              ? `Panel #${rec.panelPosition}`
              : rec.jurorNumber
              ? `Juror #${rec.jurorNumber}`
              : "—";

          setFont(true, 11);
          doc.setTextColor(...colors.primary);
          doc.text(
            `${idx + 1}. ${rec.jurorName || "Unknown Juror"}`,
            marginX + 8,
            y
          );
          setFont(false, 9);
          doc.setTextColor(100, 100, 100);
          doc.text(`(${jurorIdentifier})`, marginX + 200, y);
          doc.setTextColor(...colors.text);
          y += 14;

          // Recommendation Badge
          const readable =
            rec.recommendation === "STRIKE_FOR_CAUSE"
              ? "STRIKE FOR CAUSE"
              : rec.recommendation === "PEREMPTORY_STRIKE"
              ? "PEREMPTORY STRIKE"
              : "NO STRIKE";

          const badgeColor =
            rec.recommendation === "STRIKE_FOR_CAUSE"
              ? [220, 53, 69]
              : rec.recommendation === "PEREMPTORY_STRIKE"
              ? [255, 193, 7]
              : [40, 167, 69];

          doc.setFillColor(...badgeColor);
          doc.roundedRect(marginX + 8, y - 10, 140, 16, 2, 2, "F");
          setFont(true, 9);
          doc.setTextColor(255, 255, 255);
          doc.text(readable, marginX + 78, y - 1, { align: "center" });
          doc.setTextColor(...colors.text);
          y += 12;

          // Reason
          setFont(true, 9);
          doc.text("Reason:", marginX + 8, y);
          y += 12;
          wrapText(
            rec.reason || "No reason provided.",
            marginX + 12,
            contentWidth - 24,
            false,
            9,
            1.4
          );
          y += 4;

          // Juror Notes
          if (Array.isArray(rec.jurorNotes) && rec.jurorNotes.length > 0) {
            ensureSpace(30);
            setFont(true, 9);
            doc.text("Notes:", marginX + 8, y);
            y += 12;
            rec.jurorNotes.forEach((n: any) => {
              wrapText(
                `• ${n.note} (${new Date(n.createdAt).toLocaleDateString()})`,
                marginX + 12,
                contentWidth - 24,
                false,
                8,
                1.3
              );
            });
            y += 4;
          }

          // Questions & Answers
          if (
            Array.isArray(rec.questionsAndAnswers) &&
            rec.questionsAndAnswers.length > 0
          ) {
            ensureSpace(40);
            setFont(true, 9);
            doc.text("Questions & Answers:", marginX + 8, y);
            y += 12;

            rec.questionsAndAnswers.forEach((qa: any, qaIdx: number) => {
              ensureSpace(25);

              // Question
              setFont(true, 9);
              doc.setTextColor(...colors.primary);
              wrapText(
                `Q${qaIdx + 1}: ${qa.question}`,
                marginX + 12,
                contentWidth - 24,
                true,
                9,
                1.3
              );

              // Answer
              setFont(false, 9);
              doc.setTextColor(...colors.text);
              wrapText(
                `A: ${qa.answer}`,
                marginX + 12,
                contentWidth - 24,
                false,
                9,
                1.3
              );

              if (qaIdx < rec.questionsAndAnswers.length - 1) {
                y += 4;
              }
            });
            y += 4;
          }

          // Draw final box with actual height
          const recBoxHeight = y - recBoxStart + 6;
          doc.setFillColor(252, 252, 253);
          doc.rect(marginX, recBoxStart, contentWidth, recBoxHeight, "F");
          doc.setDrawColor(...colors.border);
          doc.setLineWidth(0.5);
          doc.rect(marginX, recBoxStart, contentWidth, recBoxHeight, "S");

          y += 10;
        });
      } else {
        wrapText(
          "No strike recommendations available for this session.",
          marginX + 8,
          contentWidth - 16,
          false,
          10
        );
        y += 8;
      }
    }

    /* ===============================
       SELECTED JURORS FROM BOARD
    =============================== */

    if (Array.isArray(selectedJurors) && selectedJurors.length > 0) {
      ensureSpace(50);
      sectionHeader("Selected Jurors from Board", "✓");
      ensureSpace(20);
      setFont(false, 10);
      doc.setTextColor(80, 80, 80);
      wrapText(
        "The following jurors were selected for final jury selection from the courtroom grid.",
        marginX,
        contentWidth,
        false,
        10,
        1.4
      );
      doc.setTextColor(...colors.text);
      y += 16;

      selectedJurors.forEach((j: any, idx: number) => {
        ensureSpace(18);
        const ident =
          j.panelPosition != null
            ? `Panel #${j.panelPosition}`
            : j.jurorNumber
            ? `Juror #${j.jurorNumber}`
            : "";
        const line = `${idx + 1}. ${j.name || "Unknown Juror"}${
          ident ? ` (${ident})` : ""
        }`;
        doc.text(line, marginX + 8, y);
        y += 14;
      });
      y += 8;
    }

    /* ===============================
       FOOTER ON ALL PAGES
    =============================== */

    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.5);
      doc.line(
        marginX,
        pageHeight - 40,
        pageWidth - marginRight,
        pageHeight - 40
      );

      // Footer text
      setFont(false, 8);
      doc.setTextColor(120, 120, 120);
      doc.text("Generated by Jury AI", marginX, pageHeight - 25);
      doc.text(
        `Report Issued: ${new Date().toLocaleDateString("en-US", {
          dateStyle: "medium",
        })}`,
        centerX,
        pageHeight - 25,
        { align: "center" }
      );
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - marginRight,
        pageHeight - 25,
        { align: "right" }
      );
      doc.setTextColor(...colors.text);
    }

    /* ===============================
       SAVE DOCUMENT
    =============================== */

    const fileName = `Jury-Analysis-${sessionName.replace(
      /[^a-z0-9]/gi,
      "-"
    )}-${Date.now()}.pdf`;
    doc.save(fileName);
  } catch (err) {
    alert("PDF export requires 'jspdf'. Please install it and retry.");
    console.error("PDF export failed:", err);
  }
}
