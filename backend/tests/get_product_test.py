import uuid


def test_get_product(client):
    sku = f"TEST-SKU-GET-{uuid.uuid4().hex[:8]}"

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

    assert response.status_code == 201   # expect to get a 201 Created response

    product_id = response.json()["id"]

    response = client.get(f"/api/products/{product_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product_id
    assert data["name"] == "Test Laptop"  # check is the data correct
    assert data["sku"] == sku