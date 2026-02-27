"""
Governance Audit Logger
Immutable, timestamped decision log for every action in the system.
Supports export to JSON and CSV.
"""
import uuid
import datetime
import json
import csv
import io
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from database.models import AuditLog
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet


def create_log(
    db: Session,
    student_id: str,
    drive_id: str,
    action: str,
    policy_check: Optional[str] = None,
    policy_details: Optional[Dict] = None,
    ai_score: Optional[float] = None,
    missing_skills: Optional[List[str]] = None,
    final_decision: Optional[str] = None,
    reasoning: Optional[str] = None,
    actor: str = "SYSTEM",
) -> AuditLog:
    """Write a new immutable audit log entry."""
    log = AuditLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.datetime.utcnow(),
        student_id=student_id,
        drive_id=drive_id,
        action=action,
        policy_check=policy_check,
        policy_details=policy_details or {},
        ai_score=ai_score,
        missing_skills=missing_skills or [],
        final_decision=final_decision,
        reasoning=reasoning,
        actor=actor,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_logs(
    db: Session,
    student_id: Optional[str] = None,
    drive_id: Optional[str] = None,
    limit: int = 100,
) -> List[AuditLog]:
    """Query audit logs with optional filters."""
    q = db.query(AuditLog)
    if student_id:
        q = q.filter(AuditLog.student_id == student_id)
    if drive_id:
        q = q.filter(AuditLog.drive_id == drive_id)
    return q.order_by(AuditLog.timestamp.desc()).limit(limit).all()


def export_logs_json(logs: List[AuditLog]) -> str:
    """Serialize logs to JSON string."""
    data = []
    for log in logs:
        data.append({
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "student_id": log.student_id,
            "drive_id": log.drive_id,
            "action": log.action,
            "policy_check": log.policy_check,
            "policy_details": log.policy_details,
            "ai_score": log.ai_score,
            "missing_skills": log.missing_skills,
            "final_decision": log.final_decision,
            "reasoning": log.reasoning,
            "actor": log.actor,
        })
    return json.dumps(data, indent=2)


def export_logs_csv(logs: List[AuditLog]) -> str:
    """Serialize logs to CSV string."""
    output = io.StringIO()
    fieldnames = [
        "id", "timestamp", "student_id", "drive_id", "action",
        "policy_check", "ai_score", "missing_skills", "final_decision", "reasoning", "actor"
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for log in logs:
        writer.writerow({
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else "",
            "student_id": log.student_id,
            "drive_id": log.drive_id,
            "action": log.action,
            "policy_check": log.policy_check or "",
            "ai_score": log.ai_score or "",
            "missing_skills": "|".join(log.missing_skills) if log.missing_skills else "",
            "final_decision": log.final_decision or "",
            "reasoning": log.reasoning or "",
            "actor": log.actor or "SYSTEM",
        })
    return output.getvalue()


def export_logs_pdf(logs: List[AuditLog]) -> bytes:
    """Generate a formatted PDF for audit logs and return raw bytes."""
    buffer = io.BytesIO()
    styles = getSampleStyleSheet()
    normal = styles["BodyText"]
    normal.fontSize = 9

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=30,
        rightMargin=30,
        topMargin=30,
        bottomMargin=30,
    )

    data = [[
        "ID",
        "Timestamp",
        "Student ID",
        "Action",
        "Decision",
    ]]

    for log in logs:
        data.append([
            Paragraph(str(log.id or "N/A"), normal),
            Paragraph(log.timestamp.isoformat() if log.timestamp else "N/A", normal),
            Paragraph(str(log.student_id or "N/A"), normal),
            Paragraph(str(log.action or "N/A"), normal),
            Paragraph(str(log.final_decision or "N/A"), normal),
        ])

    table = Table(
        data,
        repeatRows=1,
        colWidths=[130, 130, 100, 110, 90],
    )
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 10),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.lightgrey]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))

    doc.build([table])
    buffer.seek(0)
    return buffer.getvalue()
