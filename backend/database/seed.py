import uuid
import datetime
from database.models import Student, PlacementDrive, SessionLocal

MOCK_STUDENTS = [
    {"id": "STU_2024_0001", "name": "Aditya Kumar", "email": "aditya@college.edu", "branch": "CSE", "cgpa": 8.7, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Python", "Django", "React", "PostgreSQL", "Docker"], "projects": ["E-commerce Platform", "ML Sentiment Analyzer"], "certifications": ["AWS Cloud Practitioner"], "phone": "9876543001"},
    {"id": "STU_2024_0002", "name": "Priya Sharma", "email": "priya@college.edu", "branch": "IT", "cgpa": 9.1, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Java", "Spring Boot", "Microservices", "MySQL", "Kubernetes"], "projects": ["Banking System Backend", "REST API Gateway"], "certifications": ["Oracle Java SE", "Google Cloud Associate"], "phone": "9876543002"},
    {"id": "STU_2024_0003", "name": "Rahul Mehta", "email": "rahul@college.edu", "branch": "CSE", "cgpa": 7.5, "active_backlogs": 1, "graduation_year": 2025, "skills": ["JavaScript", "Vue.js", "Node.js", "MongoDB"], "projects": ["Chat Application", "Portfolio Website"], "certifications": [], "phone": "9876543003"},
    {"id": "STU_2024_0004", "name": "Sneha Patel", "email": "sneha@college.edu", "branch": "ECE", "cgpa": 8.2, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Python", "TensorFlow", "Computer Vision", "OpenCV", "Pandas"], "projects": ["Face Recognition System", "IoT Sensor Dashboard"], "certifications": ["DeepLearning.AI TensorFlow"], "phone": "9876543004"},
    {"id": "STU_2024_0005", "name": "Arjun Singh", "email": "arjun@college.edu", "branch": "CSE", "cgpa": 6.8, "active_backlogs": 2, "graduation_year": 2025, "skills": ["C++", "Data Structures", "Algorithms"], "projects": ["Sorting Visualizer"], "certifications": [], "phone": "9876543005"},
    {"id": "STU_2024_0006", "name": "Kavya Reddy", "email": "kavya@college.edu", "branch": "IT", "cgpa": 9.4, "active_backlogs": 0, "graduation_year": 2025, "skills": ["React", "TypeScript", "Next.js", "GraphQL", "Redux"], "projects": ["SaaS Dashboard UI", "Design System Library"], "certifications": ["Meta React Developer"], "phone": "9876543006"},
    {"id": "STU_2024_0007", "name": "Vikram Nair", "email": "vikram@college.edu", "branch": "CSE", "cgpa": 7.9, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Python", "FastAPI", "Redis", "Celery", "AWS Lambda"], "projects": ["Distributed Task Queue", "Serverless API"], "certifications": ["AWS Developer Associate"], "phone": "9876543007"},
    {"id": "STU_2024_0008", "name": "Ananya Das", "email": "ananya@college.edu", "branch": "MCA", "cgpa": 8.5, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Data Analysis", "Power BI", "SQL", "Python", "Tableau"], "projects": ["Sales Analytics Dashboard", "Churn Prediction Model"], "certifications": ["Microsoft Power BI"], "phone": "9876543008"},
    {"id": "STU_2024_0009", "name": "Rohan Gupta", "email": "rohan@college.edu", "branch": "CSE", "cgpa": 6.5, "active_backlogs": 3, "graduation_year": 2025, "skills": ["HTML", "CSS", "JavaScript"], "projects": ["Static Portfolio"], "certifications": [], "phone": "9876543009"},
    {"id": "STU_2024_0010", "name": "Divya Krishnan", "email": "divya@college.edu", "branch": "ECE", "cgpa": 8.8, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Embedded C", "RTOS", "Arduino", "Raspberry Pi", "IoT"], "projects": ["Smart Home Automation", "Weather Monitoring System"], "certifications": ["Cisco IoT Specialist"], "phone": "9876543010"},
    {"id": "STU_2024_0011", "name": "Karan Joshi", "email": "karan@college.edu", "branch": "IT", "cgpa": 7.2, "active_backlogs": 1, "graduation_year": 2025, "skills": ["Android", "Kotlin", "Firebase", "REST APIs"], "projects": ["Food Delivery App", "Expense Tracker"], "certifications": [], "phone": "9876543011"},
    {"id": "STU_2024_0012", "name": "Meera Iyer", "email": "meera@college.edu", "branch": "CSE", "cgpa": 9.2, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Machine Learning", "PyTorch", "NLP", "Transformers", "Python"], "projects": ["Sentiment Analysis API", "Text Summarization Tool"], "certifications": ["Hugging Face NLP", "Coursera ML"], "phone": "9876543012"},
    {"id": "STU_2024_0013", "name": "Suresh Babu", "email": "suresh@college.edu", "branch": "CSE", "cgpa": 7.6, "active_backlogs": 0, "graduation_year": 2025, "skills": ["DevOps", "Docker", "Kubernetes", "Jenkins", "Terraform"], "projects": ["CI/CD Pipeline Setup", "Infrastructure as Code"], "certifications": ["CKA Kubernetes", "HashiCorp Terraform"], "phone": "9876543013"},
    {"id": "STU_2024_0014", "name": "Pooja Verma", "email": "pooja@college.edu", "branch": "IT", "cgpa": 8.0, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Cybersecurity", "Ethical Hacking", "Network Security", "Python"], "projects": ["Vulnerability Scanner", "Network Packet Analyzer"], "certifications": ["CEH", "CompTIA Security+"], "phone": "9876543014"},
    {"id": "STU_2024_0015", "name": "Nikhil Tiwari", "email": "nikhil@college.edu", "branch": "CSE", "cgpa": 8.3, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Golang", "gRPC", "PostgreSQL", "Redis", "Kafka"], "projects": ["Real-time Chat Server", "Microservices Gateway"], "certifications": ["Go Programming"], "phone": "9876543015"},
    {"id": "STU_2024_0016", "name": "Ritu Agarwal", "email": "ritu@college.edu", "branch": "MCA", "cgpa": 7.8, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Business Analysis", "SQL", "Excel", "JIRA", "Agile"], "projects": ["Requirements Documentation", "Sprint Planning Tool"], "certifications": ["PMI-ACP Agile"], "phone": "9876543016"},
    {"id": "STU_2024_0017", "name": "Deepak Rao", "email": "deepak@college.edu", "branch": "ECE", "cgpa": 7.0, "active_backlogs": 2, "graduation_year": 2025, "skills": ["VLSI", "Verilog", "MATLAB", "Signal Processing"], "projects": ["FPGA Implementation", "Signal Filtering Algorithm"], "certifications": [], "phone": "9876543017"},
    {"id": "STU_2024_0018", "name": "Sana Khan", "email": "sana@college.edu", "branch": "CSE", "cgpa": 8.9, "active_backlogs": 0, "graduation_year": 2025, "skills": ["React", "Node.js", "Express", "MongoDB", "Socket.io"], "projects": ["Real-time Collaboration Tool", "Video Streaming Platform"], "certifications": ["MERN Stack Developer"], "phone": "9876543018"},
    {"id": "STU_2024_0019", "name": "Tarun Mishra", "email": "tarun@college.edu", "branch": "IT", "cgpa": 6.9, "active_backlogs": 1, "graduation_year": 2025, "skills": ["PHP", "Laravel", "MySQL", "Bootstrap"], "projects": ["CMS Website", "E-commerce Store"], "certifications": [], "phone": "9876543019"},
    {"id": "STU_2024_0020", "name": "Lavanya S", "email": "lavanya@college.edu", "branch": "CSE", "cgpa": 9.6, "active_backlogs": 0, "graduation_year": 2025, "skills": ["Competitive Programming", "C++", "Python", "Algorithms", "System Design"], "projects": ["LeetCode 500+ Solved", "Open Source Contributions"], "certifications": ["Google Kickstart Winner", "Codeforces Expert"], "phone": "9876543020"},
]

MOCK_RESUME_TEXTS = {
    "STU_2024_0001": "Aditya Kumar - Software Engineer\nSkills: Python, Django, React, PostgreSQL, Docker\nProjects: E-commerce Platform (Django+React), ML Sentiment Analyzer (Python, scikit-learn)\nCGPA: 8.7 | Branch: CSE | Graduation: 2025\nCertifications: AWS Cloud Practitioner",
    "STU_2024_0002": "Priya Sharma - Backend Developer\nSkills: Java, Spring Boot, Microservices, MySQL, Kubernetes\nProjects: Banking System Backend (Spring Boot, MySQL), REST API Gateway\nCGPA: 9.1 | Branch: IT | Graduation: 2025\nCertifications: Oracle Java SE, Google Cloud Associate",
    "STU_2024_0006": "Kavya Reddy - Frontend Engineer\nSkills: React, TypeScript, Next.js, GraphQL, Redux\nProjects: SaaS Dashboard UI (React+TypeScript), Design System Library\nCGPA: 9.4 | Branch: IT | Graduation: 2025\nCertifications: Meta React Developer",
    "STU_2024_0012": "Meera Iyer - AI/ML Engineer\nSkills: Machine Learning, PyTorch, NLP, Transformers, Python\nProjects: Sentiment Analysis API (BERT fine-tuning), Text Summarization Tool\nCGPA: 9.2 | Branch: CSE | Graduation: 2025\nCertifications: Hugging Face NLP, Coursera ML",
    "STU_2024_0018": "Sana Khan - Full Stack Developer\nSkills: React, Node.js, Express, MongoDB, Socket.io\nProjects: Real-time Collaboration Tool, Video Streaming Platform\nCGPA: 8.9 | Branch: CSE | Graduation: 2025\nCertifications: MERN Stack Developer",
}

MOCK_DRIVES = [
    {
        "id": "DRIVE_TCS_2026",
        "company_name": "TCS",
        "job_role": "Software Developer",
        "jd_text": "Looking for software developer with strong fundamentals in Python or Java. Experience with web frameworks (Django/Spring Boot), databases (SQL/NoSQL), and cloud technologies. Must have good problem-solving skills.",
        "required_skills": ["Python", "Java", "SQL", "REST APIs", "Problem Solving"],
        "min_cgpa": 6.0,
        "max_backlogs": 0,
        "eligible_branches": ["CSE", "IT", "ECE", "MCA"],
        "location": "Bangalore / Chennai / Hyderabad",
        "package_min": 7.0,
        "package_max": 9.0,
        "drive_date": "2025-03-15",
        "status": "active",
    },
    {
        "id": "DRIVE_GOOGLE_2026",
        "company_name": "Google",
        "job_role": "Software Engineer (SWE)",
        "jd_text": "Seeking exceptional software engineers with deep expertise in algorithms, system design, and distributed systems. Proficiency in Go, Python, or Java. Experience with Kubernetes, microservices architecture preferred.",
        "required_skills": ["Algorithms", "System Design", "Python", "Go", "Distributed Systems", "Kubernetes"],
        "min_cgpa": 8.5,
        "max_backlogs": 0,
        "eligible_branches": ["CSE", "IT"],
        "location": "Bangalore",
        "package_min": 30.0,
        "package_max": 45.0,
        "drive_date": "2025-04-01",
        "status": "active",
    },
    {
        "id": "DRIVE_INFOSYS_2026",
        "company_name": "Infosys",
        "job_role": "Systems Engineer",
        "jd_text": "Entry-level systems engineer role for fresh graduates. Basic programming knowledge in any language. Willingness to learn and adapt. Good communication skills required.",
        "required_skills": ["Programming Basics", "Communication", "Teamwork"],
        "min_cgpa": 6.5,
        "max_backlogs": 2,
        "eligible_branches": ["CSE", "IT", "ECE", "MCA"],
        "location": "Pan India",
        "package_min": 3.5,
        "package_max": 5.0,
        "drive_date": "2025-03-20",
        "status": "active",
    },
    {
        "id": "DRIVE_AMAZON_2026",
        "company_name": "Amazon",
        "job_role": "SDE-1",
        "jd_text": "Amazon SDE-1 role requiring strong data structures, algorithms, object-oriented programming. Proficiency in Java or Python. Experience with AWS services, microservices, and agile development. Strong problem-solving mindset.",
        "required_skills": ["Java", "Python", "Data Structures", "Algorithms", "AWS", "Microservices", "OOP"],
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "eligible_branches": ["CSE", "IT"],
        "location": "Bangalore / Hyderabad",
        "package_min": 24.0,
        "package_max": 32.0,
        "drive_date": "2025-03-25",
        "status": "active",
    },
    {
        "id": "DRIVE_DELOITTE_2026",
        "company_name": "Deloitte",
        "job_role": "Data Analyst",
        "jd_text": "Data Analyst position requiring expertise in SQL, Python for data analysis. Experience with Power BI or Tableau for visualization. Statistical analysis and business insights generation skills needed.",
        "required_skills": ["SQL", "Python", "Power BI", "Tableau", "Data Analysis", "Statistics"],
        "min_cgpa": 7.0,
        "max_backlogs": 1,
        "eligible_branches": ["CSE", "IT", "MCA"],
        "location": "Bangalore / Mumbai",
        "package_min": 8.0,
        "package_max": 12.0,
        "drive_date": "2025-04-10",
        "status": "active",
    },
]


def seed_database():
    db = SessionLocal()
    try:
        if db.query(Student).count() > 0:
            print("Database already seeded.")
            return
        for s in MOCK_STUDENTS:
            resume = MOCK_RESUME_TEXTS.get(s["id"], f"{s['name']} - {s['branch']} Student\nSkills: {', '.join(s['skills'])}\nProjects: {', '.join(s['projects'])}\nCertifications: {', '.join(s['certifications'])}\nCGPA: {s['cgpa']}")
            student = Student(**{**s, "resume_text": resume})
            db.add(student)
        for d in MOCK_DRIVES:
            drive = PlacementDrive(**d)
            db.add(drive)
        db.commit()
        print(f"✅ Seeded {len(MOCK_STUDENTS)} students and {len(MOCK_DRIVES)} drives.")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()
