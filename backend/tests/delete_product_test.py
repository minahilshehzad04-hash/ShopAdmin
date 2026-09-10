import uuid


def test_delete_product(client):
    sku = f"TEST-SKU-DELETE-{uuid.uuid4().hex[:8]}"

    response = client.post(
        "/api/products/",
        json={
            "name": "Delete Test Product",
            "description": "Product for delete test",
            "price": 1000,
            "stock": 5,
            "sku": sku,
            "image_url": None,
            "status": "Active",
            "category_id": 1,
        },
    )

    assert response.status_code == 201

    product_id = response.json()["id"]

    response = client.delete(
        f"/api/products/{product_id}"
    )

    assert response.status_code == 204

    response = client.get(
        f"/api/products/{product_id}"
    )

    assert response.status_code == 404