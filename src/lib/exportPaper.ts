import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface ExportQuestion {
  questionNumber: number;
  text: string;
  marks: number;
  unit: string;
}

interface PaperHeader {
  collegeName: string;
  subjectName: string;
  subjectCode?: string;
  examType: string;
  duration: string;
  maxMarks: number;
  instructions?: string;
  watermark?: string;
}

const instructions = `
1. Answer ALL questions.
2. Figures to the right indicate full marks.
3. Assume suitable data wherever necessary.
4. Write legibly and clearly.
`.trim();

function buildTextContent(header: PaperHeader, questions: ExportQuestion[], setLabel?: string): string {
  let lines: string[] = [];
  lines.push(header.collegeName || "University Name");
  if (setLabel) lines.push(`Set: ${setLabel}`);
  lines.push(`Subject: ${header.subjectName}${header.subjectCode ? ` (${header.subjectCode})` : ""}`);
  lines.push(`Exam: ${header.examType || "Examination"} | Duration: ${header.duration || "3 Hours"} | Max Marks: ${header.maxMarks}`);
  lines.push("");
  lines.push("Instructions:");
  lines.push(header.instructions || instructions);
  lines.push("");

  const sectionA = questions.filter(q => q.marks === 2);
  const sectionB = questions.filter(q => q.marks === 5);
  const sectionC = questions.filter(q => q.marks === 10);

  if (sectionA.length > 0) {
    lines.push(`SECTION A (${sectionA.length} × 2 = ${sectionA.length * 2} Marks)`);
    lines.push("-".repeat(50));
    sectionA.forEach((q, i) => lines.push(`${i + 1}. ${q.text} [${q.marks}M]`));
    lines.push("");
  }

  if (sectionB.length > 0) {
    lines.push(`SECTION B (${sectionB.length} × 5 = ${sectionB.length * 5} Marks)`);
    lines.push("-".repeat(50));
    sectionB.forEach((q, i) => lines.push(`${sectionA.length + i + 1}. ${q.text} [${q.marks}M]`));
    lines.push("");
  }

  if (sectionC.length > 0) {
    lines.push(`SECTION C (${sectionC.length} × 10 = ${sectionC.length * 10} Marks)`);
    lines.push("-".repeat(50));
    sectionC.forEach((q, i) => lines.push(`${sectionA.length + sectionB.length + i + 1}. ${q.text} [${q.marks}M]`));
  }

  if (header.watermark) {
    lines.push("");
    lines.push(`--- ${header.watermark} ---`);
  }

  return lines.join("\n");
}

export function exportAsTxt(header: PaperHeader, questions: ExportQuestion[], setLabel?: string) {
  const content = buildTextContent(header, questions, setLabel);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, `${header.subjectName.replace(/\s+/g, "_")}_paper${setLabel ? `_Set${setLabel}` : ""}.txt`);
}

export function exportAsPdf(header: PaperHeader, questions: ExportQuestion[], setLabel?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(header.collegeName || "University Name", pageWidth / 2, y, { align: "center" });
  y += 8;

  if (setLabel) {
    doc.setFontSize(12);
    doc.text(`Set: ${setLabel}`, pageWidth / 2, y, { align: "center" });
    y += 7;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Subject: ${header.subjectName}${header.subjectCode ? ` (${header.subjectCode})` : ""}`, pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text(`${header.examType || "Examination"} | Duration: ${header.duration || "3 Hours"} | Max Marks: ${header.maxMarks}`, pageWidth / 2, y, { align: "center" });
  y += 8;

  // Line
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  // Instructions
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const instrLines = (header.instructions || instructions).split("\n");
  instrLines.forEach(line => {
    doc.text(line, 15, y);
    y += 4;
  });
  y += 4;

  doc.setLineWidth(0.3);
  doc.line(15, y, pageWidth - 15, y);
  y += 8;

  const sections = [
    { label: "SECTION A", marks: 2, qs: questions.filter(q => q.marks === 2) },
    { label: "SECTION B", marks: 5, qs: questions.filter(q => q.marks === 5) },
    { label: "SECTION C", marks: 10, qs: questions.filter(q => q.marks === 10) },
  ];

  let qNum = 1;
  sections.forEach(section => {
    if (section.qs.length === 0) return;

    if (y > 260) { doc.addPage(); y = 20; }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${section.label} (${section.qs.length} × ${section.marks} = ${section.qs.length * section.marks} Marks)`, 15, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    section.qs.forEach(q => {
      if (y > 270) { doc.addPage(); y = 20; }
      const text = `${qNum}. ${q.text}`;
      const splitText = doc.splitTextToSize(text, pageWidth - 55);
      splitText.forEach((line: string) => {
        doc.text(line, 18, y);
        y += 5;
      });
      doc.setFont("helvetica", "bold");
      doc.text(`[${q.marks}M]`, pageWidth - 20, y - 5, { align: "right" });
      doc.setFont("helvetica", "normal");
      y += 3;
      qNum++;
    });
    y += 5;
  });

  // Watermark
  if (header.watermark) {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(header.watermark, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  }

  doc.save(`${header.subjectName.replace(/\s+/g, "_")}_paper${setLabel ? `_Set${setLabel}` : ""}.pdf`);
}

export async function exportAsZip(
  header: PaperHeader,
  variants: ExportQuestion[][],
  format: "pdf" | "txt" = "pdf"
) {
  const zip = new JSZip();
  const labels = ["A", "B", "C", "D", "E"];

  variants.forEach((questions, i) => {
    const label = labels[i] || `${i + 1}`;
    if (format === "txt") {
      const content = buildTextContent(header, questions, label);
      zip.file(`Set_${label}.txt`, content);
    } else {
      // For PDF in ZIP, we generate text fallback
      const content = buildTextContent(header, questions, label);
      zip.file(`Set_${label}.txt`, content);
    }
  });

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${header.subjectName.replace(/\s+/g, "_")}_all_sets.zip`);
}
