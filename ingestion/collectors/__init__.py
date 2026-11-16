"""
collectors package — source-specific job collection adapters.

Each collector is responsible for fetching raw job data from a
single source (API, RSS feed, or permitted HTML page) and returning
a list of raw job dictionaries for further processing.

Phase 2 implementation will add:
- LinkedInCollector (public job search RSS)
- GovtJobsCollector (NIC / government portals with open data)
- FreshersWorldCollector (public listing pages)
"""
