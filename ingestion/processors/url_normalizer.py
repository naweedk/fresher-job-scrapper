"""
URL normalization utilities.
Strips marketing and analytics tracking parameters, normalizes protocol, host, and slashes.
"""

from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

# Common query tracking parameters to strip
TRACKING_PARAMS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
    "mc_cid",
    "mc_eid",
    "ref",
    "source",
    "affiliate",
    "trk",
    "mid",
}


def normalize_url(url: str) -> str:
    """
    Produce a canonical, tracking-free URL string.
    
    1. Trims whitespace.
    2. Lowercases protocol and domain name.
    3. Strips query parameters matching known analytics tracking tags.
    4. Strips fragment (#...).
    5. Normalizes redundant trailing slashes on root domains.
    """
    if not url:
        return ""

    url = url.strip()
    try:
        parsed = urlparse(url)
    except Exception:
        return url

    # Default to https if scheme missing
    scheme = parsed.scheme.lower() if parsed.scheme else "https"
    netloc = parsed.netloc.lower()

    # Clean query parameters
    query_tuples = parse_qsl(parsed.query, keep_blank_values=False)
    filtered_query = [
        (k, v) for k, v in query_tuples
        if k.lower() not in TRACKING_PARAMS
    ]
    # Sort remaining parameters for deterministic canonical output
    filtered_query.sort(key=lambda x: x[0])
    new_query = urlencode(filtered_query)

    # Normalize path (remove double slashes)
    path = parsed.path
    if path == "":
        path = "/"
    elif len(path) > 1 and path.endswith("/"):
        path = path.rstrip("/")

    # Reconstruct without fragment
    canonical = urlunparse((scheme, netloc, path, parsed.params, new_query, ""))
    return canonical
