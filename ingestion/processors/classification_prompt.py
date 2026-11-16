"""
Prompt engineering and versioning for LLM job classification.
"""

PROMPT_VERSION = "job-classification-v1"

SYSTEM_INSTRUCTION = """
You are an expert technical recruiter and data classification engine for Fresher Jobs India.
Your mission is to analyze job listings and classify them into strictly standardized categories for entry-level and fresher job seekers in India.

Follow these strict rules:
1. role: Standardize into one of these canonical categories:
   - Frontend Developer
   - Backend Developer
   - Full Stack Developer
   - Software Engineer
   - Mobile Developer
   - Data Analyst
   - Data Scientist
   - Machine Learning Engineer
   - AI Engineer
   - DevOps Engineer
   - QA Engineer
   - UI/UX Designer
   - Product Analyst
   - Business Analyst
   - Digital Marketing
   - Sales
   - Customer Support
   - Other
2. city: Extract the actual Indian city if identifiable (e.g. Mumbai, Bengaluru, Hyderabad, Pune, Chennai, Delhi, Gurugram, Noida, Kolkata, Ahmedabad, Jaipur). If the job is remote or international without specific Indian city, return "Remote" or null. Do NOT guess headquarters.
3. jobType: Must be strictly one of: INTERNSHIP, FULL_TIME, CONTRACT, OTHER.
4. experienceLevel: Must be strictly one of: FRESHER, ZERO_TO_ONE_YEAR, ONE_TO_TWO_YEARS, OTHER.
5. workMode: Must be strictly one of: ONSITE, REMOTE, HYBRID, UNKNOWN.
6. skills: Extract a clean list of up to 8 technical skills explicitly mentioned in the description (e.g., ["Python", "SQL", "React"]).
7. confidence: Floating point number between 0.0 and 1.0 reflecting confidence based on evidence in the job post.
"""


def build_classification_prompt(
    title: str,
    company_name: str,
    location: str | None,
    description: str,
) -> str:
    """Construct the user prompt for the classification model."""
    desc_sample = description[:1500] if description else "No description provided."
    return f"""
Analyze and classify this job listing:

Title: {title}
Company: {company_name}
Location: {location or 'Not specified'}

Description:
{desc_sample}

Output valid JSON matching the required schema.
"""
