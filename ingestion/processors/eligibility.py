"""
Eligibility filter for entry-level and fresher jobs in India.
Applies conservative keywords and regex to eliminate obvious senior/managerial roles
while admitting freshers, internships, and entry-level positions across tech and business.
"""

import re
from typing import Tuple
from schemas import NormalizedJob

# Keywords explicitly indicating senior or managerial levels
EXCLUDED_PATTERNS = [
    r"\bsenior\b",
    r"\bsr\.\b",
    r"\bsr\b",
    r"\blead\b",
    r"\bprincipal\b",
    r"\barchitect\b",
    r"\bdirector\b",
    r"\bhead of\b",
    r"\bvp\b",
    r"\bvice president\b",
    r"\btech lead\b",
    r"\bengineering manager\b",
    r"\bteam lead\b",
    r"\bexpert\b",
    r"\bstaff\b",
    r"\b(sde|swe|engineer|scientist|developer|analyst)\s*(ii|iii|iv|v|vi|2|3|4|5)\b",
    r"\b(iii|iv|v|vi)\b",
    r"\b3\+\s*years\b",
    r"\b4\+\s*years\b",
    r"\b5\+\s*years\b",
    r"\b6\+\s*years\b",
    r"\b7\+\s*years\b",
    r"\b8\+\s*years\b",
    r"\b10\+\s*years\b",
]

# Patterns where 'manager' is part of an entry-level / fresher position
MANAGER_EXCEPTIONS = [
    r"\b(associate|junior|assistant)\s+(product|account|project|marketing|sales|brand)\s+manager\b",
    r"\bmanagement\s+trainee\b",
    r"\bapm\b",
]

# Keywords indicating positive fresher, entry, or internship qualification
INCLUDED_PATTERNS = [
    r"\bfresher\b",
    r"\bgraduate\b",
    r"\bentry\s*[-–]?\s*level\b",
    r"\bjunior\b",
    r"\bjr\.\b",
    r"\bjr\b",
    r"\bintern\b",
    r"\binternship\b",
    r"\btrainee\b",
    r"\bassociate\b",
    r"\bapprentice\b",
    r"\b0[-–]1\s*year\b",
    r"\b0[-–]2\s*years\b",
    r"\b0\s*years?\b",
    r"\b1\s*year\b",
    r"\bcollege\b",
    r"\bstudent\b",
    r"\bcampus\b",
    r"\bnew grad\b",
    r"\bnew-grad\b",
    r"\bearly career\b",
    r"\bearly-career\b",
    r"\bgraduate engineer trainee\b",
    r"\bget\b",
    r"\b(sde|swe|engineer|developer|analyst|qa)\s*(i|1)\b",
    # Specific entry-level roles across business & design
    r"\bcustomer support associate\b",
    r"\btechnical support associate\b",
    r"\bsales associate\b",
    r"\bmarketing associate\b",
    r"\bhr associate\b",
    r"\boperations associate\b",
    r"\bui/ux intern\b",
    r"\bdesign intern\b",
]


def check_fresher_eligibility(job: NormalizedJob) -> Tuple[bool, str]:
    """
    Evaluate whether a job listing is appropriate for freshers / entry-level candidates.
    Returns (is_eligible, reason).
    """
    title_lower = job.title.lower()
    desc_lower = job.description.lower()[:2000]

    # 1. Interns, trainees, and apprentices are always admitted regardless of senior phrasing
    is_intern_or_trainee = bool(
        re.search(r"\b(intern|internship|trainee|apprentice)\b", title_lower)
        or re.search(r"\b(intern|internship|trainee|apprentice)\b", desc_lower[:300])
    )

    if not is_intern_or_trainee:
        # Check manager exclusion with exceptions (e.g., Associate Product Manager)
        if re.search(r"\bmanager\b", title_lower):
            is_manager_exception = any(re.search(pat, title_lower) for pat in MANAGER_EXCEPTIONS)
            if not is_manager_exception:
                return False, "Job title matches senior/managerial exclusion pattern: manager"

        # Check other senior/managerial exclusions
        for pat in EXCLUDED_PATTERNS:
            if re.search(pat, title_lower):
                return False, f"Job title matches senior/managerial exclusion pattern: {pat}"

    # 2. Check for explicit fresher / entry-level indicators
    for pat in INCLUDED_PATTERNS:
        if re.search(pat, title_lower) or re.search(pat, desc_lower):
            return True, f"Matched fresher qualification pattern: {pat}"

    # 3. Check for experience requirement blocks in description
    if re.search(r"\b(3|4|5|6|7|8|9|10)\+?\s*years?\s*(of)?\s*experience\b", desc_lower):
        return False, "Description explicitly requests 3+ years of experience"

    # Retain as candidate for AI classification stage
    return True, "Eligible candidate (no senior indicators found)"
