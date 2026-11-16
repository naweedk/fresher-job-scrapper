"""
Eligibility filter for entry-level and fresher jobs in India.
Applies conservative keywords and regex to eliminate obvious senior/managerial roles
while admitting freshers, internships, and entry-level positions.
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
    r"\bmanager\b",
    r"\bhead of\b",
    r"\bvp\b",
    r"\bvice president\b",
    r"\btech lead\b",
    r"\bengineering manager\b",
    r"\bteam lead\b",
    r"\bexpert\b",
    r"\b3\+\s*years\b",
    r"\b4\+\s*years\b",
    r"\b5\+\s*years\b",
]

# Keywords indicating positive fresher, entry, or internship qualification
INCLUDED_PATTERNS = [
    r"\bfresher\b",
    r"\bgraduate\b",
    r"\bentry\s*level\b",
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
    r"\bcollege\b",
    r"\bstudent\b",
    r"\bcampus\b",
    r"\bnew grad\b",
    r"\bnew-grad\b",
]


def check_fresher_eligibility(job: NormalizedJob) -> Tuple[bool, str]:
    """
    Evaluate whether a job listing is appropriate for freshers / entry-level candidates.
    Returns (is_eligible, reason).
    """
    title_lower = job.title.lower()
    desc_lower = job.description.lower()[:1500]  # Examine first 1500 chars

    # 1. Reject clear senior titles unless accompanied by 'intern' or 'trainee'
    is_intern_or_trainee = bool(re.search(r"\b(intern|internship|trainee|apprentice)\b", title_lower))

    if not is_intern_or_trainee:
        for pat in EXCLUDED_PATTERNS:
            if re.search(pat, title_lower):
                return False, f"Job title matches senior/managerial exclusion pattern: {pat}"

    # 2. Check for explicit fresher indicators
    for pat in INCLUDED_PATTERNS:
        if re.search(pat, title_lower) or re.search(pat, desc_lower):
            return True, f"Matched fresher qualification pattern: {pat}"

    # 3. If neither strongly excluded nor explicitly matched in title,
    # default to eligible for roles under 2 years experience (conservative retention)
    # Check for experience blocks in description
    if re.search(r"\b(3|4|5|6|7|8|9|10)\+?\s*years?\s*(of)?\s*experience\b", desc_lower):
        return False, "Description explicitly requests 3+ years of experience"

    # Retain as candidate for AI classification stage
    return True, "Eligible candidate (no senior indicators found)"
