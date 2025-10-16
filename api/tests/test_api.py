from __future__ import annotations

def auth_headers():
    return {"Authorization": "Bearer sk_test"}


def test_check_email_endpoint(client):
    client.app.state.cache.store["mx:example.com"] = "1"
    response = client.post(
        "/v1/check-email",
        json={"email": "user@example.com"},
        headers=auth_headers(),
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["classification"] == "ok"
    assert "mx_ok" in body["reasons"]


def test_check_bulk_limit(client):
    payload = {
        "emails": [{"email": f"user{i}@example.com"} for i in range(105)],
    }
    response = client.post("/v1/check-bulk", json=payload, headers=auth_headers())
    assert response.status_code == 400
    assert "batch size exceeds" in response.json()["detail"]


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_unauthorized_request(client):
    response = client.post("/v1/check-email", json={"email": "user@example.com"})
    assert response.status_code == 401
