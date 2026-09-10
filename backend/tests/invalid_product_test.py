


def test_invalid_product(client):
    response = client.post(
        "/api/products/",
        json={
            "name": "",
            "description": "Invalid product",
            "price": -500,
            "stock": 10,
            "sku": "INVALID-SKU",
            "image_url": None,
            "status": "Active",
            "category_id": 1
        }
    )

    assert response.status_code == 422