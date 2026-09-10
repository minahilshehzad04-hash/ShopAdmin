import uuid


def test_create_product(client):
    sku = f"TEST-SKU-CREATE-{uuid.uuid4().hex[:8]}"

    response = client.post(
        "/api/products/",
        json={
            "name": "Test Laptop",
            "description": "Test product",
            "price": 150000,
            "stock": 10,
            "sku": sku,
            "image_url": None,
            "status": "Active",
            "category_id": 1,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Test Laptop"
    assert data["sku"] == sku
    assert data["price"] == "150000.00"

    assert isinstance(data["id"], int)