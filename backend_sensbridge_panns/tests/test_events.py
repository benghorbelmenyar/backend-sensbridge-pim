"""Tests for events and settings endpoints."""
import pytest


@pytest.mark.asyncio
async def test_events_list_and_latest(client):
    r = await client.get("/v1/sound/events?limit=10")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    r2 = await client.get("/v1/sound/events/latest?limit=5")
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)


@pytest.mark.asyncio
async def test_settings_get_put(client):
    r = await client.get("/v1/sound/settings")
    assert r.status_code == 200
    data = r.json()
    assert "global_threshold" in data
    assert data["global_threshold"] == 0.85
    r2 = await client.put(
        "/v1/sound/settings",
        json={"global_threshold": 0.9, "per_type_thresholds": {"baby_cry": 0.88}},
    )
    assert r2.status_code == 200
    assert r2.json()["global_threshold"] == 0.9
    assert r2.json()["per_type_thresholds"]["baby_cry"] == 0.88
