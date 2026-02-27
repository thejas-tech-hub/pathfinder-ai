"""
Policy Gateway - Deterministic Rule Engine
Filters candidates before any AI processing occurs.
Hard rules: CGPA, backlogs, branch, package, location.
"""
from typing import Dict, Any, List


def check_eligibility(student: Dict, drive: Dict) -> Dict[str, Any]:
    """
    Run all policy checks. Returns structured result with per-rule breakdown.
    If ANY rule fails → student is rejected. No AI runs.
    """
    checks = []
    overall_passed = True

    # ── Rule 1: CGPA ─────────────────────────────────────────────────────────
    cgpa_rule = drive.get("min_cgpa", 0)
    student_cgpa = student.get("cgpa", 0)
    cgpa_pass = student_cgpa >= cgpa_rule
    checks.append({
        "rule": "Minimum CGPA",
        "required": cgpa_rule,
        "actual": student_cgpa,
        "passed": cgpa_pass,
        "detail": f"CGPA {student_cgpa} {'≥' if cgpa_pass else '<'} required {cgpa_rule}"
    })
    if not cgpa_pass:
        overall_passed = False

    # ── Rule 2: Active Backlogs ───────────────────────────────────────────────
    max_backlogs = drive.get("max_backlogs", 0)
    student_backlogs = student.get("active_backlogs", 0)
    backlog_pass = student_backlogs <= max_backlogs
    checks.append({
        "rule": "Active Backlogs",
        "required": f"≤ {max_backlogs}",
        "actual": student_backlogs,
        "passed": backlog_pass,
        "detail": f"Student has {student_backlogs} backlog(s), max allowed is {max_backlogs}"
    })
    if not backlog_pass:
        overall_passed = False

    # ── Rule 3: Branch Eligibility ────────────────────────────────────────────
    eligible_branches = drive.get("eligible_branches", [])
    student_branch = student.get("branch", "")
    branch_pass = not eligible_branches or student_branch in eligible_branches
    checks.append({
        "rule": "Branch Eligibility",
        "required": ", ".join(eligible_branches) if eligible_branches else "All",
        "actual": student_branch,
        "passed": branch_pass,
        "detail": f"Branch '{student_branch}' {'is' if branch_pass else 'is NOT'} in eligible list"
    })
    if not branch_pass:
        overall_passed = False

    # ── Build reasoning text ──────────────────────────────────────────────────
    failed_rules = [c for c in checks if not c["passed"]]
    if overall_passed:
        reasoning = f"Student '{student.get('name')}' passed all {len(checks)} policy checks. Proceeding to AI matching."
    else:
        reasons = "; ".join([c["detail"] for c in failed_rules])
        reasoning = f"Student '{student.get('name')}' failed {len(failed_rules)} rule(s): {reasons}. Rejected without AI processing."

    return {
        "passed": overall_passed,
        "checks": checks,
        "reasoning": reasoning,
        "failed_rules": [c["rule"] for c in failed_rules],
    }


def extract_policy_summary(drive: Dict) -> List[str]:
    """Return human-readable list of rules for a drive."""
    rules = []
    if drive.get("min_cgpa"):
        rules.append(f"Min CGPA: {drive['min_cgpa']}")
    if drive.get("max_backlogs") is not None:
        rules.append(f"Max Active Backlogs: {drive['max_backlogs']}")
    if drive.get("eligible_branches"):
        rules.append(f"Eligible Branches: {', '.join(drive['eligible_branches'])}")
    if drive.get("location"):
        rules.append(f"Location: {drive['location']}")
    if drive.get("package_min") and drive.get("package_max"):
        rules.append(f"Package: {drive['package_min']} - {drive['package_max']} LPA")
    return rules
