from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

Base = declarative_base()

# Reverted back to SQLite for easy local development
DATABASE_URL = "sqlite:///./pathfinder.db"

# connect_args={"check_same_thread": False} is required for SQLite in FastAPI
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True)
    branch = Column(String)
    cgpa = Column(Float)
    active_backlogs = Column(Integer, default=0)
    graduation_year = Column(Integer)
    resume_text = Column(Text, nullable=True)
    skills = Column(JSON, default=[])
    projects = Column(JSON, default=[])
    certifications = Column(JSON, default=[])
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class PlacementDrive(Base):
    __tablename__ = "placement_drives"
    id = Column(String, primary_key=True)
    company_name = Column(String, nullable=False)
    job_role = Column(String, nullable=False)
    jd_text = Column(Text, nullable=True)
    required_skills = Column(JSON, default=[])
    min_cgpa = Column(Float, default=6.0)
    max_backlogs = Column(Integer, default=0)
    eligible_branches = Column(JSON, default=[])
    location = Column(String, nullable=True)
    package_min = Column(Float, nullable=True)
    package_max = Column(Float, nullable=True)
    drive_date = Column(String, nullable=True)
    status = Column(String, default="active")  # active, closed, completed
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Application(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True)
    student_id = Column(String, nullable=False)
    drive_id = Column(String, nullable=False)
    policy_passed = Column(Boolean, nullable=True)
    policy_details = Column(JSON, default={})
    crs_score = Column(Float, nullable=True)
    semantic_score = Column(Float, nullable=True)
    project_score = Column(Float, nullable=True)
    completeness_score = Column(Float, nullable=True)
    matched_skills = Column(JSON, default=[])
    missing_skills = Column(JSON, default=[])
    status = Column(String, default="pending")  # pending, eligible, rejected, shortlisted
    shortlisted_by = Column(String, nullable=True)
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    student_id = Column(String, nullable=False)
    drive_id = Column(String, nullable=False)
    action = Column(String)  # APPLIED, POLICY_CHECKED, AI_SCORED, SHORTLISTED, REJECTED
    policy_check = Column(String, nullable=True)  # PASSED / FAILED
    policy_details = Column(JSON, default={})
    ai_score = Column(Float, nullable=True)
    missing_skills = Column(JSON, default=[])
    final_decision = Column(String, nullable=True)
    reasoning = Column(Text, nullable=True)
    actor = Column(String, default="SYSTEM")