/* eslint-disable @typescript-eslint/no-explicit-any */

export async function exportSessionReport({
  session,
  sessionStats,
  strikeRecommendations,
}: {
  session: any | null;
  sessionStats: any | null;
  strikeRecommendations: any | null;
}) {
  try {
    const jsPDFMod: any = await import("jspdf");
    const jsPDF = jsPDFMod.default || jsPDFMod;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    /* ===============================
       PAGE CONSTANTS
    =============================== */
    const PAGE_TOP = 56;
    const PAGE_BOTTOM = 760;
    const marginX = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    let y = PAGE_TOP;

    /* ===============================
       HELPERS (FONT-SAFE)
    =============================== */

    const ensurePage = () => {
      if (y > PAGE_BOTTOM) {
        doc.addPage();
        y = PAGE_TOP;
      }
    };

    const ensureSpace = (space = 40) => {
      if (y + space > PAGE_BOTTOM) {
        doc.addPage();
        y = PAGE_TOP;
      }
    };

    const setFont = (bold = false, size = 12) => {
      doc.setFont("Helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
    };

    const line = () => {
      ensurePage();
      doc.setDrawColor(220);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 14;
    };

    const text = (t: string, x: number, bold = false, size = 12) => {
      ensurePage();
      setFont(bold, size);
      doc.text(t, x, y);
      y += 16;
      setFont(false); // 🔑 reset
    };

    const textCenter = (t: string, bold = false, size = 12) => {
      ensurePage();
      setFont(bold, size);
      doc.text(t, centerX, y, { align: "center" });
      y += 16;
      setFont(false); // 🔑 reset
    };

    const wrapText = (
      t: string,
      x: number,
      maxWidth: number,
      bold = false
    ) => {
      setFont(bold, 12);
      const parts = doc.splitTextToSize(t, maxWidth);
      parts.forEach((p: string) => {
        ensurePage();
        doc.text(p, x, y);
        y += 16;
      });
      setFont(false); // 🔑 reset
    };

    /* ===============================
       HEADER / LOGO
    =============================== */

    try {
      const resp = await fetch("/pdflogo.png");
      if (resp.ok) {
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(dataUrl, "PNG", centerX - 24, y, 48, 48);
        y += 64;
      }
    } catch {
      // ignore logo
    }

    textCenter("Session Summary Report", true, 20);
    textCenter(
      `Session: ${session?.name || sessionStats?.session?.name || "—"}`
    );
    line();

    /* ===============================
       SESSION SUMMARY
    =============================== */

    ensureSpace(60);
    text("Session Summary", marginX, true, 14);
    wrapText(
      session?.summary || "No session summary provided.",
      marginX,
      pageWidth - marginX * 2
    );
    line();

    /* ===============================
       OVERVIEW
    =============================== */

    ensureSpace(80);
    text("Overview", marginX, true, 14);

    const ov = sessionStats?.overview || {};
    const perf = sessionStats?.performance || {};

    const overviewRows = [
      ["Total Jurors", ov.totalJurors ?? 0],
      ["Total Responses", ov.totalResponses ?? 0],
      ["Total Assessments", ov.totalAssessments ?? 0],
      ["Average Suitability", `${Math.round(perf.averageScore ?? 0)}%`],
      ["Completion Rate", `${Math.round(ov.completionRate ?? 0)}%`],
    ];

    overviewRows.forEach(([label, value]) => {
      ensurePage();
      setFont(false);
      doc.text(String(label), marginX, y);
      setFont(true);
      doc.text(String(value), marginX + 260, y);
      y += 16;
      setFont(false);
    });

    line();

    /* ===============================
       PERFORMANCE BREAKDOWN
    =============================== */

    ensureSpace(80);
    text("Performance Breakdown", marginX, true, 14);

    const bullets = [
      `Ideal for the Case (80%+): ${perf.highPerformers ?? 0} Jurors`,
      `Neutral (60–79%): ${perf.mediumPerformers ?? 0} Jurors`,
      `Recommended to Strike (<60%): ${perf.lowPerformers ?? 0} Jurors`,
    ];

    bullets.forEach((b) =>
      wrapText(`• ${b}`, marginX, pageWidth - marginX * 2)
    );

    line();

    /* ===============================
       STRIKE RECOMMENDATIONS
    =============================== */

    if (strikeRecommendations) {
      ensureSpace(80);
      text("Strike Recommendations", marginX, true, 14);

      const summary = strikeRecommendations.summary || {
        strikeForCause: 0,
        peremptoryStrike: 0,
        total: 0,
      };

      wrapText(
        `Strike for Cause: ${summary.strikeForCause}   |   Peremptory Strikes: ${summary.peremptoryStrike}   |   Total Reviewed: ${summary.total}`,
        marginX,
        pageWidth - marginX * 2
      );

      if (Array.isArray(strikeRecommendations.results)) {
        strikeRecommendations.results.forEach((rec: any, idx: number) => {
          ensureSpace(140);

          // Format juror identifier: prioritize panelPosition, then jurorNumber
          const jurorIdentifier = rec.panelPosition !== null && rec.panelPosition !== undefined
            ? `Panel #${rec.panelPosition}`
            : rec.jurorNumber
            ? `#${rec.jurorNumber}`
            : "—";
          
          text(
            `${idx + 1}. ${rec.jurorName || "Unknown Juror"} (${jurorIdentifier})`,
            marginX,
            true
          );

          const readable =
            rec.recommendation === "STRIKE_FOR_CAUSE"
              ? "Strike for Cause"
              : rec.recommendation === "PEREMPTORY_STRIKE"
              ? "Peremptory Strike"
              : "No Strike Recommended";

          text(`Recommendation: ${readable}`, marginX, true);

          wrapText(
            `Reason: ${rec.reason || "No reason provided."}`,
            marginX,
            pageWidth - marginX * 2
          );

          // Juror Notes
          if (Array.isArray(rec.jurorNotes) && rec.jurorNotes.length > 0) {
            ensureSpace(40);
            text("Juror Notes:", marginX + 10, true);
            rec.jurorNotes.forEach((n: any) => {
              wrapText(
                `- ${n.note} (${new Date(n.createdAt).toLocaleDateString()})`,
                marginX + 20,
                pageWidth - marginX * 2
              );
            });
          }

          // Questions & Answers
          if (
            Array.isArray(rec.questionsAndAnswers) &&
            rec.questionsAndAnswers.length > 0
          ) {
            ensureSpace(60);
            text("Questions & Answers:", marginX + 10, true);
            rec.questionsAndAnswers.forEach((qa: any, qaIdx: number) => {
              // Question number and question text
              wrapText(
                `${qaIdx + 1}. ${qa.question}`,
                marginX + 20,
                pageWidth - marginX * 2,
                true // bold
              );
              // Answer on next line
              wrapText(
                `   Answer: ${qa.answer}`,
                marginX + 20,
                pageWidth - marginX * 2
              );
              // Add spacing between Q&A pairs
              if (qaIdx < rec.questionsAndAnswers.length - 1) {
                y += 8;
              }
            });
          }

          line();
        });
      } else {
        wrapText(
          "No strike recommendations available for this session.",
          marginX,
          pageWidth - marginX * 2
        );
      }
    }

    /* ===============================
       FOOTER
    =============================== */

    const issued = new Date().toLocaleString();
    setFont(false, 10);
    doc.text("Generated by Elite Jury", marginX, 820);
    doc.text(`Report Issued: ${issued}`, pageWidth - marginX - 200, 820);

    doc.save(`session-report-${Date.now()}.pdf`);
  } catch (err) {
    alert("PDF export requires 'jspdf'. Please install it and retry.");
    console.error("PDF export failed:", err);
  }
}
