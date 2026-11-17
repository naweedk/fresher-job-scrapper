"""
Source Registry and Factory for all active and optional collectors.
"""

from typing import Dict, List
from collectors.base import BaseCollector
from collectors.arbeitnow import ArbeitnowCollector
from collectors.remotive import RemotiveCollector
from collectors.remoteok import RemoteOKCollector
from collectors.hasjob import HasjobCollector
from collectors.simplify_jobs import SimplifyJobsCollector
from collectors.greenhouse import GreenhouseCollector
from collectors.lever import LeverCollector
from collectors.github_india import GitHubIndiaInternshipsCollector
from collectors.jobicy import JobicyCollector
from collectors.naukri import NaukriCollector


COLLECTOR_REGISTRY: Dict[str, type[BaseCollector]] = {
    "arbeitnow": ArbeitnowCollector,
    "remotive": RemotiveCollector,
    "remoteok": RemoteOKCollector,
    "hasjob": HasjobCollector,
    "simplify_jobs": SimplifyJobsCollector,
    "greenhouse": GreenhouseCollector,
    "lever": LeverCollector,
    "github_india": GitHubIndiaInternshipsCollector,
    "jobicy": JobicyCollector,
    "naukri": NaukriCollector,
}


def get_collector(source_name: str) -> BaseCollector:
    """Instantiate a collector by registry key name."""
    normalized_key = source_name.lower().replace("-", "_").replace(" ", "_")
    collector_cls = COLLECTOR_REGISTRY.get(normalized_key)
    if not collector_cls:
        raise ValueError(
            f"No collector registered for '{source_name}'. "
            f"Available collectors: {list(COLLECTOR_REGISTRY.keys())}"
        )
    return collector_cls()


def get_all_collectors() -> List[BaseCollector]:
    """Return instances of all registered collectors."""
    return [cls() for cls in COLLECTOR_REGISTRY.values()]
