import { clientApi } from "@/api/clientApi";
import { adminApi } from "@/api/adminApi";
import { backAPI } from "@/api/backAPI";

export const productService = {
  getAll() {
    return clientApi("/api/products");
  },
  getByCategory(categoryId) {
    return clientApi(`/api/products?category_id=${categoryId}`);
  },
  getOne(id) {
    return adminApi(`/api/v1/admin/catalog/products/${id}`);
  },
  create(data) {
    return adminApi("/api/v1/admin/catalog/products", "POST", data);
  },
  update(id, data) {
    return adminApi(`/api/v1/admin/catalog/products/${id}`, "PUT", data);
  },
  delete(id) {
    return adminApi(`/api/v1/admin/catalog/products/${id}`, "DELETE");
  },
  addStock(id, data) {
    return adminApi(
      `/api/v1/admin/catalog/products/${id}/inventories`,
      "POST",
      data,
    );
  },
  getStock(productId) {
    return backAPI(`/product-stock/${productId}`);
  },
};
