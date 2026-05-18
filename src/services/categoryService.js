import { clientApi } from "@/api/clientApi";
import { adminApi } from "@/api/adminApi";

export const categorieService = {
  getAll() {
    return clientApi("/api/categories/tree");
  },

  getOne(id) {
    return adminApi(`/api/v1/admin/catalog/categories/${id}`);
  },

  create(data) {
    return adminApi("/api/v1/admin/catalog/categories", "POST", data);
  },

  async getAllCategories() {
    try {
      const response = await adminApi(
        "/api/v1/admin/catalog/categories",
        "GET",
      );
      return response.data?.data || [];
    } catch (error) {
      console.error("Erreur récupération catégories:", error);
      return [];
    }
  },

  async createCategory(categoryName) {
    const slug = categoryName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const attrsResponse = await adminApi(
      "/api/v1/admin/catalog/attributes?pagination=0",
      "GET",
    );
    const attributes =
      attrsResponse?.data
        ?.filter((attr) => attr.is_filterable === 1)
        ?.map((attr) => attr.id) || [];

    const payload = {
      locale: "fr",
      name: categoryName,
      slug: slug,
      position: 1,
      display_mode: "products_and_description",
      description: `Catégorie ${categoryName}`,
      status: 1,
      parent_id: 1,
      channels: [1],
      attributes: attributes,
    };

    console.log("Payload:", JSON.stringify(payload));
    const response = await adminApi(
      "/api/v1/admin/catalog/categories",
      "POST",
      payload,
    );
    console.log("Réponse:", JSON.stringify(response));

    if (response?.data?.id) return response.data;
    return null;
  },

  async getOrCreateCategory(categoryName) {
    if (!categoryName) return null;

    try {
      const categories = await this.getAllCategories();

      const existingCategory = categories.find(
        (cat) =>
          cat.name === categoryName ||
          cat.name?.toLowerCase() === categoryName.toLowerCase(),
      );

      if (existingCategory) {
        console.log(
          `Catégorie "${categoryName}" trouvée (ID: ${existingCategory.id})`,
        );
        return existingCategory.id;
      }

      console.log(`Création de la catégorie "${categoryName}"...`);
      const newCategory = await this.createCategory(categoryName);
      console.log("newCategory reçu:", newCategory); // ← ET ICI

      if (!newCategory || !newCategory.id) {
        throw new Error(`Impossible de créer la catégorie "${categoryName}"`);
      }

      console.log(`Catégorie "${categoryName}" créée (ID: ${newCategory.id})`);
      return newCategory.id;
    } catch (error) {
      console.error(`Erreur pour "${categoryName}":`, error);
      return null;
    }
  },
};
