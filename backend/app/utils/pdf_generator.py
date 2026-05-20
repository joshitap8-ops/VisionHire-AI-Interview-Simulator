import json
import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


# ─── Color palette ────────────────────────────────────────────────────────────
PRIMARY = colors.HexColor("#6366f1")      # Indigo
SECONDARY = colors.HexColor("#8b5cf6")    # Violet
ACCENT = colors.HexColor("#06b6d4")       # Cyan
DARK = colors.HexColor("#1e1b4b")
LIGHT_BG = colors.HexColor("#f5f3ff")
GREY = colors.HexColor("#6b7280")
WHITE = colors.white


def _score_color(score: float) -> colors.Color:
    if score >= 80:
        return colors.HexColor("#10b981")   # Green
    if score >= 60:
        return colors.HexColor("#f59e0b")   # Amber
    return colors.HexColor("#ef4444")        # Red


def generate_interview_pdf(interview, user) -> bytes:
    """
    Generate a comprehensive PDF report for a completed interview.
    Returns the PDF as raw bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Title styles ──────────────────────────────────────────────────────────
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontSize=24,
        textColor=PRIMARY,
        spaceAfter=4,
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=GREY,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    h2_style = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        fontName="Helvetica-Bold",
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        textColor=DARK,
        spaceAfter=4,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=styles["Normal"],
        fontSize=10,
        textColor=DARK,
        leftIndent=16,
        spaceAfter=3,
        bulletIndent=6,
    )

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph("VisionHire", title_style))
    story.append(Paragraph("AI-Powered Interview Intelligence Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=12))

    # ── Candidate & Interview Info ─────────────────────────────────────────────
    generated_date = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    info_data = [
        ["Candidate", user.full_name or user.username, "Report Date", generated_date],
        ["Role", interview.role, "Interview Type", interview.interview_type.upper()],
        ["Topic", interview.topic, "Difficulty", interview.difficulty.capitalize()],
        ["Duration", f"{interview.duration_minutes:.0f} min" if interview.duration_minutes else "N/A",
         "Questions", f"{interview.answered_questions}/{interview.total_questions}"],
    ]
    info_table = Table(info_data, colWidths=[3.5 * cm, 6.5 * cm, 3.5 * cm, 6.5 * cm])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BG),
        ("BACKGROUND", (2, 0), (2, -1), LIGHT_BG),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT_BG]),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 14))

    # ── Overall Score ──────────────────────────────────────────────────────────
    story.append(Paragraph("Performance Scores", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_BG, spaceAfter=8))

    score_fields = [
        ("Overall Score", interview.overall_score),
        ("Technical / Content", interview.technical_score),
        ("Communication", interview.communication_score),
        ("Confidence", interview.confidence_score),
        ("Eye Contact", interview.eye_contact_score),
        ("Speech Clarity", interview.speech_score),
        ("Emotion Score", interview.emotion_score),
    ]

    score_rows = []
    for label, value in score_fields:
        score = value or 0
        bar_fill = int((score / 100) * 20)
        bar = "█" * bar_fill + "░" * (20 - bar_fill)
        score_rows.append([label, f"{score:.1f}/100", bar])

    score_table = Table(score_rows, colWidths=[5 * cm, 2.5 * cm, 12.5 * cm])
    score_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (1, 0), (1, -1), PRIMARY),
        ("TEXTCOLOR", (2, 0), (2, -1), ACCENT),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#f3f4f6")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [WHITE, LIGHT_BG]),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 14))

    # ── AI Feedback ────────────────────────────────────────────────────────────
    if interview.ai_feedback:
        story.append(Paragraph("AI Overall Assessment", h2_style))
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_BG, spaceAfter=8))
        story.append(Paragraph(interview.ai_feedback, body_style))
        story.append(Spacer(1, 10))

    # ── Strengths & Weaknesses ─────────────────────────────────────────────────
    def parse_json_list(raw: str) -> list:
        if not raw:
            return []
        try:
            return json.loads(raw)
        except Exception:
            return [raw]

    strengths = parse_json_list(interview.strengths)
    weaknesses = parse_json_list(interview.weaknesses)
    suggestions = parse_json_list(interview.improvement_suggestions)

    if strengths or weaknesses:
        sw_data = []
        if strengths:
            sw_data += [["✅  " + s, ""] for s in strengths]
        if weaknesses:
            sw_data += [["", "⚠️  " + w] for w in weaknesses]

        story.append(Paragraph("Strengths & Areas for Improvement", h2_style))
        sw_table = Table(
            [["Strengths", "Weaknesses"]] + sw_data,
            colWidths=[9.5 * cm, 9.5 * cm],
        )
        sw_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), colors.HexColor("#d1fae5")),
            ("BACKGROUND", (1, 0), (1, 0), colors.HexColor("#fee2e2")),
            ("FONTNAME", (0, 0), (1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ]))
        story.append(sw_table)
        story.append(Spacer(1, 10))

    if suggestions:
        story.append(Paragraph("Improvement Suggestions", h2_style))
        for s in suggestions:
            story.append(Paragraph(f"• {s}", bullet_style))
        story.append(Spacer(1, 10))

    # ── Transcript ─────────────────────────────────────────────────────────────
    if interview.transcript:
        story.append(Paragraph("Interview Transcript", h2_style))
        story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_BG, spaceAfter=8))
        transcript_style = ParagraphStyle(
            "Transcript",
            parent=styles["Normal"],
            fontSize=8,
            textColor=DARK,
            spaceAfter=4,
            leading=12,
        )
        # Limit transcript to first 4000 chars to keep PDF manageable
        for line in interview.transcript[:4000].split("\n\n"):
            if line.strip():
                story.append(Paragraph(line.replace("&", "&amp;").replace("<", "&lt;"), transcript_style))

    # ── Footer ─────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=1, color=LIGHT_BG))
    story.append(Paragraph(
        f"Generated by VisionHire AI Interview Platform · {generated_date}",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8,
                       textColor=GREY, alignment=TA_CENTER),
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
