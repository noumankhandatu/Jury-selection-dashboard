/* eslint-disable @typescript-eslint/no-explicit-any */

export async function exportSessionReportHTML({
  session,
  sessionStats,
  strikeRecommendations,
}: {
  session: any | null;
  sessionStats: any | null;
  strikeRecommendations: any | null;
}) {
  try {
    // Dynamically import html2pdf - handle both default and named exports
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    if (!html2pdf) {
      throw new Error("html2pdf.js failed to load");
    }

    const sessionName = session?.name || sessionStats?.session?.name || "Untitled Session";
    const caseName = session?.caseName || "—";
    const issued = new Date().toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const ov = sessionStats?.overview || {};
    const perf = sessionStats?.performance || {};

    const summary = strikeRecommendations?.summary || {
      strikeForCause: 0,
      peremptoryStrike: 0,
      total: 0,
    };

    // Generate HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jury AI  Analysis Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #212529;
      background: white;
    }

    .page {
      width: 210mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
    }

    /* Header Styles */
    .header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 3px solid #1f4e79;
    }

    .logo {
      width: 50px;
      height: 50px;
      background: #4169E1;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .header-content {
      flex: 1;
    }

    .header-title {
      font-size: 20pt;
      font-weight: bold;
      color: #1f4e79;
      margin-bottom: 3px;
    }

    .header-subtitle {
      font-size: 9pt;
      color: #6c757d;
    }

    /* Metadata Box */
    .metadata-box {
      background: #fafbfc;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 12px 15px;
      margin-bottom: 15px;
    }

    .metadata-row {
      display: flex;
      padding: 4px 0;
      font-size: 10pt;
    }

    .metadata-label {
      width: 140px;
      color: #6c757d;
      font-weight: normal;
    }

    .metadata-value {
      flex: 1;
      font-weight: bold;
      color: #212529;
    }

    /* Section Headers */
    .section-header {
      background: #1f4e79;
      color: white;
      padding: 8px 12px;
      font-size: 12pt;
      font-weight: bold;
      margin: 15px 0 10px 0;
      border-radius: 3px;
    }

    .section-header .icon {
      margin-right: 8px;
    }

    /* Content Boxes */
    .content-box {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 12px 15px;
      margin-bottom: 12px;
    }

    .summary-text {
      font-size: 10pt;
      line-height: 1.6;
      color: #495057;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 20px;
      padding: 8px 0;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 9pt;
      color: #6c757d;
    }

    .metric-value {
      font-size: 11pt;
      font-weight: bold;
      color: #1f4e79;
    }

    /* Performance Items */
    .performance-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .performance-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 10pt;
    }

    .performance-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .indicator-success { background: #28a745; }
    .indicator-warning { background: #ffc107; }
    .indicator-danger { background: #dc3545; }

    .performance-count {
      font-size: 11pt;
      font-weight: bold;
    }

    .count-success { color: #28a745; }
    .count-warning { color: #ffc107; }
    .count-danger { color: #dc3545; }

    /* Strike Summary */
    .strike-summary-box {
      background: #fff8f8;
      border: 2px solid #dc3545;
      border-radius: 4px;
      padding: 10px 15px;
      margin-bottom: 15px;
    }

    .strike-summary-grid {
      display: flex;
      gap: 30px;
      align-items: center;
    }

    .strike-summary-item {
      display: flex;
      gap: 8px;
      align-items: center;
      height: 80px;
    }

    .strike-summary-label {
      font-size: 9pt;
      color: #6c757d;
    }

    .strike-summary-value {
      font-size: 11pt;
      font-weight: bold;
      color: #dc3545;
    }

    .strike-summary-total {
      color: #212529;
    }

    /* Recommendation Card */
    .recommendation-card {
      background: #fcfcfd;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }

    .rec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .rec-juror-name {
      font-size: 11pt;
      font-weight: bold;
      color: #1f4e79;
    }

    .rec-juror-id {
      font-size: 9pt;
      color: #6c757d;
      margin-left: 8px;
    }

    .rec-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 3px;
      font-size: 8pt;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
      height: 40px;
    }

    .badge-strike-cause { background: #dc3545; }
    .badge-peremptory { background: #ffc107; color: #212529; }
    .badge-no-strike { background: #28a745; }

    .rec-section {
      margin: 10px 0;
    }

    .rec-section-title {
      font-size: 9pt;
      font-weight: bold;
      color: #495057;
      margin-bottom: 5px;
    }

    .rec-section-content {
      font-size: 9pt;
      color: #495057;
      line-height: 1.5;
      padding-left: 8px;
    }

    .rec-note-item {
      margin: 4px 0;
      padding-left: 12px;
      position: relative;
    }

    .rec-note-item:before {
      content: "•";
      position: absolute;
      left: 0;
    }

    .qa-item {
      margin: 8px 0;
      padding-left: 8px;
    }

    .qa-question {
      font-size: 9pt;
      font-weight: bold;
      color: #1f4e79;
      margin-bottom: 3px;
    }

    .qa-answer {
      font-size: 9pt;
      color: #495057;
      padding-left: 12px;
    }

    /* Footer */
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #6c757d;
    }

    /* Print Styles */
    @media print {
      .page {
        margin: 0;
        padding: 15mm;
      }
      
      .recommendation-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo">
      <img src="/pdflogo.png" alt="" srcset=""></div>
      <div class="header-content">
        <div class="header-title">JURY AI  ANALYSIS REPORT</div>
        <div class="header-subtitle">Confidential Legal Document</div>
      </div>
    </div>

    <!-- Metadata -->
    <div class="metadata-box">
      <div class="metadata-row">
        <span class="metadata-label">Session Name:</span>
        <span class="metadata-value">${sessionName}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Case:</span>
        <span class="metadata-value">${caseName}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Report Generated:</span>
        <span class="metadata-value">${issued}</span>
      </div>
      <div class="metadata-row">
        <span class="metadata-label">Status:</span>
        <span class="metadata-value">${session?.status || "Active"}</span>
      </div>
    </div>

    <!-- Executive Summary -->
    <div class="section-header">
      <span class="icon">📋</span>Executive Summary
    </div>
    <div class="content-box">
      <p class="summary-text">${session?.summary || "No session summary provided."}</p>
    </div>

    <!-- Key Metrics -->
    <div class="section-header">
      <span class="icon">📊</span>Key Metrics
    </div>
    <div class="content-box">
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-label">Total Jurors</span>
          <span class="metric-value">${ov.totalJurors ?? 0}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Total Responses</span>
          <span class="metric-value">${ov.totalResponses ?? 0}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Total Assessments</span>
          <span class="metric-value">${ov.totalAssessments ?? 0}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Avg. Suitability</span>
          <span class="metric-value">${Math.round(perf.averageScore ?? 0)}%</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Completion Rate</span>
          <span class="metric-value">${Math.round(ov.completionRate ?? 0)}%</span>
        </div>
      </div>
    </div>

    <!-- Performance Distribution -->
    <div class="section-header">
      <span class="icon">📈</span>Performance Distribution
    </div>
    <div class="content-box">
      <div class="performance-item">
        <div class="performance-label">
          <span class="performance-indicator indicator-success"></span>
          <span> Ideal for Case (80%+)</span>
        </div>
        <span class="performance-count count-success">${perf.highPerformers ?? 0}</span>
      </div>
      <div class="performance-item">
        <div class="performance-label">
          <span class="performance-indicator indicator-warning"></span>
          <span> Neutral (60-79%)</span>
        </div>
        <span class="performance-count count-warning">${perf.mediumPerformers ?? 0}</span>
      </div>
      <div class="performance-item">
        <div class="performance-label">
          <span class="performance-indicator indicator-danger"></span>
          <span> Recommend Strike (<60%)</span>
        </div>
        <span class="performance-count count-danger">${perf.lowPerformers ?? 0}</span>
      </div>
    </div>

    ${strikeRecommendations ? `
    <!-- Strike Recommendations -->
    <div class="section-header">
      <span class="icon">⚖️</span>Strike Recommendations
    </div>
    
    <div class="strike-summary-box">
      <div class="strike-summary-grid">
        <div class="strike-summary-item">
          <span class="strike-summary-label">Strike for Cause:</span>
          <span class="strike-summary-value">${summary.strikeForCause}</span>
        </div>
        <div class="strike-summary-item">
          <span class="strike-summary-label">Peremptory Strikes:</span>
          <span class="strike-summary-value">${summary.peremptoryStrike}</span>
        </div>
        <div class="strike-summary-item">
          <span class="strike-summary-label">Total Reviewed:</span>
          <span class="strike-summary-value strike-summary-total">${summary.total}</span>
        </div>
      </div>
    </div>

    ${Array.isArray(strikeRecommendations.results) && strikeRecommendations.results.length > 0
      ? strikeRecommendations.results.map((rec: any, idx: number) => {
          const jurorIdentifier =
            rec.panelPosition !== null && rec.panelPosition !== undefined
              ? `Panel #${rec.panelPosition}`
              : rec.jurorNumber
              ? `Juror #${rec.jurorNumber}`
              : "—";

          const readable =
            rec.recommendation === "STRIKE_FOR_CAUSE"
              ? "Strike for Cause"
              : rec.recommendation === "PEREMPTORY_STRIKE"
              ? "Peremptory Strike"
              : "No Strike";

          const badgeClass =
            rec.recommendation === "STRIKE_FOR_CAUSE"
              ? "badge-strike-cause"
              : rec.recommendation === "PEREMPTORY_STRIKE"
              ? "badge-peremptory"
              : "badge-no-strike";

          return `
    <div class="recommendation-card">
      <div class="rec-header">
        <div>
          <span class="rec-juror-name">${idx + 1}. ${rec.jurorName || "Unknown Juror"}</span>
          <span class="rec-juror-id">(${jurorIdentifier})</span>
        </div>
        <span class="rec-badge ${badgeClass}">${readable}</span>
      </div>

      <div class="rec-section">
        <div class="rec-section-title">Reason:</div>
        <div class="rec-section-content">${rec.reason || "No reason provided."}</div>
      </div>

      ${Array.isArray(rec.jurorNotes) && rec.jurorNotes.length > 0
        ? `
      <div class="rec-section">
        <div class="rec-section-title">Notes:</div>
        <div class="rec-section-content">
          ${rec.jurorNotes.map((n: any) => `
          <div class="rec-note-item">${n.note} (${new Date(n.createdAt).toLocaleDateString()})</div>
          `).join("")}
        </div>
      </div>
      ` : ""}

      ${Array.isArray(rec.questionsAndAnswers) && rec.questionsAndAnswers.length > 0
        ? `
      <div class="rec-section">
        <div class="rec-section-title">Questions & Answers:</div>
        <div class="rec-section-content">
          ${rec.questionsAndAnswers.map((qa: any, qaIdx: number) => `
          <div class="qa-item">
            <div class="qa-question">Q${qaIdx + 1}: ${qa.question}</div>
            <div class="qa-answer">A: ${qa.answer}</div>
          </div>
          `).join("")}
        </div>
      </div>
      ` : ""}
    </div>
          `;
        }).join("")
      : `<div class="content-box"><p class="summary-text">No strike recommendations available for this session.</p></div>`
    }
    ` : ""}

    <!-- Footer -->
    <div class="footer">
      <span>Generated by Jury AI</span>
      <span>Report Issued: ${new Date().toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
    </div>
  </div>
</body>
</html>
    `;

    // Create a temporary element
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    document.body.appendChild(element);

    // Configure PDF options
    const opt = {
      margin: 0,
      filename: `Jury-Analysis-${sessionName.replace(/[^a-z0-9]/gi, "-")}-${Date.now()}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    console.log("Starting PDF generation...");

    // Generate PDF
    await html2pdf().set(opt).from(element).save();

    console.log("PDF generated successfully!");

    // Clean up
    document.body.removeChild(element);
  } catch (err) {
    console.error("PDF export failed:", err);
    console.error("Error details:", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    alert(`PDF export failed: ${err instanceof Error ? err.message : String(err)}\n\nCheck the console for more details.`);
  }
}
