"""
India Location and Work-Mode Eligibility Processor.

Evaluates job listings for India eligibility and work mode:
- VERIFIED_INDIAN: Onsite in Indian city, Hybrid in Indian city, or Remote explicitly open to India.
- INTERNATIONAL: Located outside India or remote restricted to non-India countries.
- AMBIGUOUS: Worldwide remote without India confirmation, unknown remote eligibility, or missing location.
"""

import re
from dataclasses import dataclass
from typing import List, Optional, Tuple
from schemas import IndiaEligibilityEnum, WorkModeEnum


@dataclass
class IndiaLocationResult:
    eligibility: IndiaEligibilityEnum
    work_mode: WorkModeEnum
    country_code: Optional[str]
    city: Optional[str]
    remote_scope: Optional[str]
    reason: str


# Canonical mappings for Indian Tech Hubs & Cities
INDIAN_CITY_MAP = {
    # Bangalore / Bengaluru
    "bengaluru": "Bengaluru",
    "bangalore": "Bengaluru",
    "blr": "Bengaluru",
    # Mumbai / Bombay / MMR
    "mumbai": "Mumbai",
    "bombay": "Mumbai",
    "navi mumbai": "Navi Mumbai",
    "thane": "Thane",
    # Delhi / NCR
    "delhi": "Delhi",
    "new delhi": "New Delhi",
    "noida": "Noida",
    "greater noida": "Greater Noida",
    "gurgaon": "Gurugram",
    "gurugram": "Gurugram",
    "faridabad": "Faridabad",
    "ghaziabad": "Ghaziabad",
    # Hyderabad
    "hyderabad": "Hyderabad",
    "secunderabad": "Hyderabad",
    # Pune
    "pune": "Pune",
    "pcmc": "Pune",
    # Chennai / Madras
    "chennai": "Chennai",
    "madras": "Chennai",
    # Kolkata / Calcutta
    "kolkata": "Kolkata",
    "calcutta": "Kolkata",
    # Gujarat
    "ahmedabad": "Ahmedabad",
    "gandhinagar": "Gandhinagar",
    "vadodara": "Vadodara",
    "baroda": "Vadodara",
    "surat": "Surat",
    "rajkot": "Rajkot",
    # Rajasthan
    "jaipur": "Jaipur",
    "jodhpur": "Jodhpur",
    "udaipur": "Udaipur",
    # Kerala
    "kochi": "Kochi",
    "cochin": "Kochi",
    "thiruvananthapuram": "Thiruvananthapuram",
    "trivandrum": "Thiruvananthapuram",
    "calicut": "Kozhikode",
    "kozhikode": "Kozhikode",
    # Tamil Nadu (other)
    "coimbatore": "Coimbatore",
    "madurai": "Madurai",
    "trichy": "Tiruchirappalli",
    "tiruchirappalli": "Tiruchirappalli",
    # Punjab / Haryana / Chandigarh
    "chandigarh": "Chandigarh",
    "mohali": "Mohali",
    "panchkula": "Panchkula",
    "ludhiana": "Ludhiana",
    "amritsar": "Amritsar",
    "jalandhar": "Jalandhar",
    # Madhya Pradesh
    "indore": "Indore",
    "bhopal": "Bhopal",
    "gwalior": "Gwalior",
    "jabalpur": "Jabalpur",
    # Maharashtra (other)
    "nagpur": "Nagpur",
    "nashik": "Nashik",
    "aurangabad": "Chhatrapati Sambhajinagar",
    # Andhra Pradesh / Telangana (other)
    "visakhapatnam": "Visakhapatnam",
    "vizag": "Visakhapatnam",
    "vijayawada": "Vijayawada",
    "guntur": "Guntur",
    "warangal": "Warangal",
    # Uttar Pradesh (other)
    "lucknow": "Lucknow",
    "kanpur": "Kanpur",
    "agra": "Agra",
    "varanasi": "Varanasi",
    "prayagraj": "Prayagraj",
    "allahabad": "Prayagraj",
    "meerut": "Meerut",
    # Bihar / Jharkhand / Odisha
    "patna": "Patna",
    "ranchi": "Ranchi",
    "jamshedpur": "Jamshedpur",
    "bhubaneswar": "Bhubaneswar",
    "cuttack": "Cuttack",
    # Karnataka (other)
    "mysore": "Mysuru",
    "mysuru": "Mysuru",
    "mangalore": "Mangaluru",
    "mangaluru": "Mangaluru",
    "hubli": "Hubli",
    # Goa / Uttarakhand / Assam / Other
    "goa": "Goa",
    "panaji": "Panaji",
    "panjim": "Panaji",
    "dehradun": "Dehradun",
    "guwahati": "Guwahati",
    "raipur": "Raipur",
    "shimla": "Shimla",
    "jammu": "Jammu",
    "srinagar": "Srinagar",
}

INDIAN_STATES = {
    "karnataka", "maharashtra", "tamil nadu", "telangana", "andhra pradesh",
    "kerala", "gujarat", "rajasthan", "uttar pradesh", "haryana", "punjab",
    "west bengal", "madhya pradesh", "bihar", "odisha", "assam", "delhi",
    "goa", "uttarakhand", "jharkhand", "himachal pradesh", "chhattisgarh",
    "jammu and kashmir", "jammu & kashmir"
}

# Regex for matching explicit India remote positions
REMOTE_INDIA_PATTERNS = [
    r"remote\s*[-–,]\s*india\b",
    r"remote\s+within\s+india\b",
    r"remote\s+in\s+india\b",
    r"remote\s*\(\s*india\s*\)",
    r"remote\s*\(\s*in\s*\)",
    r"\bindia\s*[-–,]\s*remote\b",
    r"\bindia\s*\(\s*remote\s*\)",
    r"work\s+from\s+home\s*[-–,]\s*india\b",
    r"work\s+from\s+anywhere\s+in\s+india\b",
    r"anywhere\s+in\s+india\b",
]

# Regex for matching explicit non-India remote positions
REMOTE_INTERNATIONAL_PATTERNS = [
    r"remote\s*[-–,]\s*(us\s+only|usa\s+only|us|usa|united\s+states)\b",
    r"remote\s*\(\s*(us\s+only|usa\s+only|us|usa|united\s+states)\s*\)",
    r"remote\s*[-–,]\s*(canada\s+only|canada|can)\b",
    r"remote\s*\(\s*(canada\s+only|canada|can)\s*\)",
    r"remote\s*[-–,]\s*(uk\s+only|uk|united\s+kingdom|britain|gb)\b",
    r"remote\s*[-–,]\s*(europe|eu|emea|latam|latin\s+america)\b",
    r"canada\s*[-–,]\s*remote\b",
    r"us\s*[-–,]\s*remote\b",
    r"usa\s*[-–,]\s*remote\b",
]

# Common International Locations & Indicators
INTERNATIONAL_INDICATORS = [
    # Countries
    r"\b(usa|united states|u\.s\.a?\b)",
    r"\b(canada)\b",
    r"\b(united kingdom|uk|great britain|england|scotland)\b",
    r"\b(germany|deutschland)\b",
    r"\b(netherlands|holland)\b",
    r"\b(france)\b",
    r"\b(australia)\b",
    r"\b(new zealand)\b",
    r"\b(ireland)\b",
    r"\b(switzerland)\b",
    r"\b(sweden|norway|denmark|finland)\b",
    r"\b(singapore|japan|china|israel|brazil|mexico)\b",
    # Major Cities
    r"\b(london|bristol|cambridge|manchester|edinburgh|birmingham)\b",
    r"\b(toronto|vancouver|ottawa|montreal|calgary|edmonton|waterloo|markham)\b",
    r"\b(berlin|munich|frankfurt|memmingen|hamburg|cologne|stuttgart)\b",
    r"\b(amsterdam|rotterdam|utrecht)\b",
    r"\b(paris|lyon)\b",
    r"\b(sydney|melbourne|brisbane)\b",
    r"\b(dublin)\b",
    r"\b(san jose|san francisco|sf|nyc|new york|seattle|austin|chicago)\b",
    r"\b(palo alto|santa clara|mountain view|sunnyvale|boston|dallas|redmond)\b",
    r"\b(san diego|atlanta|milpitas|los angeles|la|washington|pittsburgh)\b",
    r"\b(cincinnati|houston|huntsville|denver|miami|phoenix|philadelphia)\b",
    r"\b(salt lake city|detroit|tampa|columbus|charlotte|nashville)\b",
    # State suffixes with comma
    r",\s*(ca|ny|wa|tx|il|ma|ga|co|nc|fl|oh|pa|mi|va|az|tn|mo|md|wi|mn|or|ut|nv|ia|sc|al|ky|in)\b",
    # Explicit US states
    r"\b(california|texas|florida|indiana|indianapolis|ohio|illinois|virginia|pennsylvania|michigan|georgia|massachusetts)\b",
]


def detect_work_mode(text: str) -> WorkModeEnum:
    """Determine work mode (ONSITE, HYBRID, REMOTE) from text."""
    lower = text.lower()
    if "hybrid" in lower:
        return WorkModeEnum.HYBRID
    if any(k in lower for k in ["remote", "work from home", "wfh", "anywhere", "telecommute"]):
        return WorkModeEnum.REMOTE
    if any(k in lower for k in ["onsite", "on-site", "in-office", "in office", "office-based"]):
        return WorkModeEnum.ONSITE
    return WorkModeEnum.UNKNOWN


def evaluate_india_eligibility(
    location: Optional[str],
    title: str = "",
    description: str = "",
) -> IndiaLocationResult:
    """
    Evaluates a job listing for India location & work-mode eligibility.
    Returns IndiaLocationResult.
    """
    loc_raw = (location or "").strip()
    title_raw = title.strip()
    full_text = f"{loc_raw} {title_raw}"
    loc_lower = loc_raw.lower()
    full_lower = full_text.lower()

    # 1. Check for Missing / Empty Location
    if not loc_raw or loc_lower in ["unknown", "n/a", "none", "null"]:
        # If title mentions an Indian city, extract it
        for city_alias, canonical in INDIAN_CITY_MAP.items():
            if re.search(rf"\b{re.escape(city_alias)}\b", title_raw.lower()):
                wmode = detect_work_mode(full_text)
                if wmode == WorkModeEnum.UNKNOWN:
                    wmode = WorkModeEnum.ONSITE
                return IndiaLocationResult(
                    eligibility=IndiaEligibilityEnum.VERIFIED_INDIAN,
                    work_mode=wmode,
                    country_code="IN",
                    city=canonical,
                    remote_scope=None,
                    reason=f"Indian city '{canonical}' detected in title despite missing location",
                )
        return IndiaLocationResult(
            eligibility=IndiaEligibilityEnum.AMBIGUOUS,
            work_mode=WorkModeEnum.UNKNOWN,
            country_code=None,
            city=None,
            remote_scope=None,
            reason="Missing location",
        )

    # 2. Check for Explicit Remote India
    for pat in REMOTE_INDIA_PATTERNS:
        if re.search(pat, loc_lower) or re.search(pat, full_lower):
            return IndiaLocationResult(
                eligibility=IndiaEligibilityEnum.VERIFIED_INDIAN,
                work_mode=WorkModeEnum.REMOTE,
                country_code="IN",
                city=None,
                remote_scope="INDIA",
                reason=f"Explicit remote position in India matching '{pat}'",
            )

    # 3. Check for Explicit Remote International Exclusions
    for pat in REMOTE_INTERNATIONAL_PATTERNS:
        if re.search(pat, loc_lower) or re.search(pat, full_lower):
            return IndiaLocationResult(
                eligibility=IndiaEligibilityEnum.INTERNATIONAL,
                work_mode=WorkModeEnum.REMOTE,
                country_code=None,
                city=None,
                remote_scope="NON_INDIA",
                reason=f"Remote position explicitly restricted outside India matching '{pat}'",
            )

    # 4. Check for Worldwide Remote or Generic Remote without India confirmation
    is_pure_remote = bool(
        re.search(r"^(remote|work from home|anywhere|worldwide|worldwide remote)$", loc_lower)
        or "worldwide remote" in loc_lower
        or "remote with unknown" in loc_lower
    )
    if is_pure_remote:
        # Check if description explicitly confirms residency or eligibility in India
        desc_lower = description.lower()[:2000]
        has_india_in_desc = bool(
            re.search(r"\b(residing in india|based in india|open to india|located in india|candidates in india)\b", desc_lower)
        )
        if has_india_in_desc:
            return IndiaLocationResult(
                eligibility=IndiaEligibilityEnum.VERIFIED_INDIAN,
                work_mode=WorkModeEnum.REMOTE,
                country_code="IN",
                city=None,
                remote_scope="INDIA",
                reason="Remote role with explicit India eligibility confirmed in description",
            )
        return IndiaLocationResult(
            eligibility=IndiaEligibilityEnum.AMBIGUOUS,
            work_mode=WorkModeEnum.REMOTE,
            country_code=None,
            city=None,
            remote_scope="WORLDWIDE_OR_UNKNOWN",
            reason="Remote position without explicit India eligibility confirmation",
        )

    # 5. Check for Indian Cities & States
    detected_city = None
    for city_alias, canonical in INDIAN_CITY_MAP.items():
        if re.search(rf"\b{re.escape(city_alias)}\b", loc_lower):
            detected_city = canonical
            break

    detected_state = False
    if not detected_city:
        for state in INDIAN_STATES:
            if re.search(rf"\b{re.escape(state)}\b", loc_lower):
                detected_state = True
                break

    # Guard: Check for false positives like "Indianapolis", "Indiana" or US state suffix ", in"
    if re.search(r"\b(indianapolis|indiana)\b", loc_lower) or re.search(r",\s*in\b", loc_lower):
        if not re.search(r"\b(india)\b", loc_lower) and not detected_city:
            return IndiaLocationResult(
                eligibility=IndiaEligibilityEnum.INTERNATIONAL,
                work_mode=detect_work_mode(full_text),
                country_code="US",
                city=None,
                remote_scope=None,
                reason="Location matches US Indiana / Indianapolis state abbreviation",
            )

    has_india_mention = bool(
        re.search(r"\b(india)\b", loc_lower)
        or loc_lower.endswith("/ in")
        or "(in)" in loc_lower
    )

    if detected_city or detected_state or has_india_mention:
        # If no specific city detected yet, check title for specific Indian city
        if not detected_city:
            for city_alias, canonical in INDIAN_CITY_MAP.items():
                if re.search(rf"\b{re.escape(city_alias)}\b", title_raw.lower()):
                    detected_city = canonical
                    break

        # Determine work mode
        wmode = detect_work_mode(full_text)
        if wmode == WorkModeEnum.UNKNOWN:
            wmode = WorkModeEnum.ONSITE

        # If it's a remote position within India
        r_scope = "INDIA" if wmode == WorkModeEnum.REMOTE else None

        return IndiaLocationResult(
            eligibility=IndiaEligibilityEnum.VERIFIED_INDIAN,
            work_mode=wmode,
            country_code="IN",
            city=detected_city,
            remote_scope=r_scope,
            reason=f"Verified Indian position in {detected_city or 'India'} ({wmode.value})",
        )

    # 6. Check for Explicit International Indicators
    for pat in INTERNATIONAL_INDICATORS:
        if re.search(pat, loc_lower):
            wmode = detect_work_mode(full_text)
            if wmode == WorkModeEnum.UNKNOWN:
                wmode = WorkModeEnum.ONSITE
            return IndiaLocationResult(
                eligibility=IndiaEligibilityEnum.INTERNATIONAL,
                work_mode=wmode,
                country_code=None,
                city=None,
                remote_scope=None,
                reason=f"International location indicator matched: '{pat}'",
            )

    # 7. Unmatched / Ambiguous
    wmode = detect_work_mode(full_text)
    return IndiaLocationResult(
        eligibility=IndiaEligibilityEnum.AMBIGUOUS,
        work_mode=wmode,
        country_code=None,
        city=None,
        remote_scope=None,
        reason=f"Unrecognized or ambiguous location: '{loc_raw}'",
    )
