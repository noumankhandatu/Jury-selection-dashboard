/* eslint-disable @typescript-eslint/no-explicit-any */

// Lazy import jsPDF to avoid bundling issues if not installed
export async function exportSessionReport({
  session,
  sessionStats,
  strikeRecommendations,
}: {
  session: any | null;
  sessionStats: any | null;
  strikeRecommendations:any |null
}) {

  try {
    const jsPDFMod: any = await import("jspdf");
    const jsPDF = jsPDFMod.default || jsPDFMod;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const marginX = 48; // 0.67in
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    let y = 56;

    const line = (yPos: number) => {
      doc.setDrawColor(220);
      doc.line(marginX, yPos, 595 - marginX, yPos);
    };

    const text = (
      t: string,
      x: number,
      yPos: number,
      size = 12,
      bold = false
    ) => {
      doc.setFont("Helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.text(t, x, yPos);
    };

    const textCenter = (t: string, yPos: number, size = 12, bold = false) => {
      doc.setFont("Helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.text(t, centerX, yPos, { align: "center" });
    };

    // Logo (optional)
    try {
      const resp = await fetch("/pdflogo.png");
      if (resp.ok) {
        const blob = await resp.blob();
        const dataUrl: string = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const logoW = 48;
        const logoH = 48;
        const logoX = centerX - logoW / 2;
        const logoY = 32;
        doc.addImage(dataUrl, "PNG", logoX, logoY, logoW, logoH);
        y = logoY + logoH + 20;
      }
    } catch {
      // ignore logo errors; continue without image
    }

    // Header
    textCenter("Session Summary Report", y, 20, true);
    y += 26;
    const sessionName = session?.name || sessionStats?.session?.name || "";
    textCenter(`Session: ${sessionName}`, y);
    y += 18;
    line(y);
    y += 18;

    // SESSION SUMMARY SECTION - ADDED
    text("Session Summary", marginX, y, 14, true);
    y += 18;
    
    const wrapText = (t: string, x: number, maxWidth: number) => {
      const parts = doc.splitTextToSize(t, maxWidth);
      parts.forEach((p: string) => {
        text(p, x, y);
        y += 16;
      });
    };

    // Get summary from session object
    const summaryNotes = session?.summary || "No summary added";
    wrapText(summaryNotes, marginX, 595 - marginX * 2);
    
    y += 12;
    line(y);
    y += 18;

    // Overview
    text("Overview", marginX, y, 14, true);
    y += 18;
    const ov = sessionStats?.overview || {};
    const perf = sessionStats?.performance || {};
    const avg = Math.round(Number(perf?.averageScore ?? 0));
    const completion = Math.round(Number(ov?.completionRate ?? 0));

    const overviewRows = [
      ["Total Jurors", String(ov?.totalJurors ?? 0)],
      ["Total Responses", String(ov?.totalResponses ?? 0)],
      ["Total Assessments", String(ov?.totalAssessments ?? 0)],
      ["Average Suitability", `${avg}%`],
      ["Completion Rate", `${completion}%`],
    ];

    overviewRows.forEach(([k, v]) => {
      text(k, marginX, y);
      text(v, 300, y, 12, true);
      y += 18;
    });

    y += 6;
    line(y);
    y += 18;

    // Performance Breakdown
    text("Performance Breakdown", marginX, y, 14, true);
    y += 18;
    const high = Number(perf?.highPerformers ?? 0);
    const mid = Number(perf?.mediumPerformers ?? 0);
    const low = Number(perf?.lowPerformers ?? 0);
    const bullets = [
      `Ideal for the Case — Score above 80%: ${high} Jurors`,
      `Neutral to the Case — Score between 60% and 79%: ${mid} Jurors`,
      `Recommended to Strike — Score below 60%: ${low} Jurors`,
    ];
    bullets.forEach((b) => {
      text(`• ${b}`, marginX, y);
      y += 18;
    });

    y += 6;
    text("Methodology", marginX, y, 14, true);
    y += 18;
    wrapText(
      "Suitability is calculated from AI assessments of juror responses and aggregated across questions.",
      marginX,
      595 - marginX * 2
    );
    wrapText(
      "Thresholds: Above 80% — Considered ideal for the case; 60% to 79% — Considered neutral to the case; Below 60% — Recommended to strike.",
      marginX,
      595 - marginX * 2
    );
    wrapText(
      "Scores are directional indicators and judgment.",
      marginX,
      595 - marginX * 2
    );
    y += 6;
    line(Math.min(y, 780));

   // ===============================
// STRIKE RECOMMENDATIONS SECTION
// ===============================

if (strikeRecommendations) {
  y += 24;

  text("Strike Recommendations", marginX, y, 14, true);
  y += 18;

  // Summary row
  const summary = strikeRecommendations.summary || {
    cause: 0,
    peremptory: 0,
    none: 0,
  };

  const summaryLine = `Strike for Cause: ${summary.cause}   |   Peremptory Strikes: ${summary.peremptory}   |   No Strike: ${summary.none}`;
  wrapText(summaryLine, marginX, 595 - marginX * 2);
  y += 12;

  if (Array.isArray(strikeRecommendations.evaluations) && strikeRecommendations.evaluations.length > 0) {
    strikeRecommendations.evaluations.forEach((rec: any, index: number) => {
      // Page break protection
      if (y > 720) {
        doc.addPage();
        y = 56;
      }

      text(`${index + 1}. ${rec.jurorName || "Unknown Juror"} (${rec.jurorNumber || "—"})`, marginX, y, 12, true);
      y += 16;

      const readableType =
        rec.strikeRecommendation === "STRIKE_FOR_CAUSE"
          ? "Strike for Cause"
          : rec.strikeRecommendation === "PEREMPTORY_STRIKE"
          ? "Peremptory Strike"
          : "No Strike Recommended";

      text(`Recommendation: ${readableType}`, marginX, y,12,true);
      y += 16;

      wrapText(`Reason: ${rec.strikeReason || "No reason provided."}`, marginX, 595 - marginX * 2);
      y += 10;

      // Notes
      if (rec.notes && rec.notes.length > 0) {
        wrapText("Notes:", marginX + 10, 595 - marginX * 2);
        rec.notes.forEach((note: string) => {
          wrapText(`- ${note}`, marginX + 20, 595 - marginX * 2);
        });
        y += 6;
      }

      // Influential Questions
      if (rec.influentialQuestions && rec.influentialQuestions.length > 0) {
        wrapText("Influential Questions:", marginX + 10, 595 - marginX * 2);
        rec.influentialQuestions.forEach((q: any) => {
          wrapText(`- ${q.question_text} (Answer: ${q.response})`, marginX + 20, 595 - marginX * 2);
        });
        y += 6;
      }

      doc.setDrawColor(230);
      doc.line(marginX, y, 595 - marginX, y);
      y += 14;
    });
  } else {
    wrapText("No jurors met the threshold for strike recommendations in this session.", marginX, 595 - marginX * 2);
    y += 10;
  }

  y += 6;
  line(Math.min(y, 780));
}

    
    // Footer with summary info
    const issued = new Date().toLocaleString();
    const summaryDate = session?.summary?.createdAt 
      ? new Date(session.summary.createdAt).toLocaleDateString()
      : "Not available";
    
    text("Generated by Elite Jury", marginX, 820);
    text(`Summary Date: ${summaryDate}`, centerX - 80, 820);
    text(`Report Issued: ${issued}`, 595 - marginX - 180, 820);

    const fileName = `session-report-${Date.now()}.pdf`;
    doc.save(fileName);
  } catch (err) {
    // Fallback: instruct to install dependency
    alert(
      "PDF export requires 'jspdf'. Please run: npm i jspdf --save, then retry."
    );
    console.error("Failed to export PDF:", err);
  }
}