import { backAPI } from "@/api/backAPI";
const BASE_URL = import.meta.env.VITE_API_URL;

const apiWithToken = async (
  endpoint,
  method = "GET",
  body = null,
  token = null,
) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
};

const parseCSV = (text) => {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const row = {};
    const regex = /(".*?"|[^,]+)(?=,|$)/g;
    const values = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      values.push(match[1].replace(/^"|"$/g, "").trim());
    }
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
};

const parseAchat = (achat) => {
  const items = [];
  const cleaned = achat.replace(/[{}]/g, "").trim();
  const matches = cleaned.matchAll(/\[([^\]]+)\]/g);
  for (const match of matches) {
    const parts = match[1].split(";");
    if (parts.length === 2) {
      const sku = parts[0].replace(/"/g, "").trim();
      const qty = parseInt(parts[1].trim());
      if (sku && qty) items.push({ sku, qty });
    }
  }
  return items;
};

const loginCustomer = async (email, password) => {
  const response = await apiWithToken("/api/v1/customer/login", "POST", {
    email,
    password,
    device_name: "import",
  });
  return response?.token || null;
};

const getProductIdBySku = async (sku, adminToken) => {
  const response = await apiWithToken(
    `/api/v1/admin/catalog/products?sku=${sku}`,
    "GET",
    null,
    adminToken,
  );
  const product = response?.data?.find((p) => p.sku === sku);
  return product?.id || null;
};

export const csvOrderImportService = {
  parse(text) {
    return parseCSV(text);
  },

  async importOrders(rows, adminToken, customerPasswords, onProgress) {
    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      onProgress?.(i + 1, rows.length, row.client);

      try {
        const password = customerPasswords[row.client];
        if (!password) {
          results.push({
            ref: `${row.date} ${row.client}`,
            status: "error",
            message: `Mot de passe manquant pour ${row.client}`,
          });
          continue;
        }

        const customerToken = await loginCustomer(row.client, password);
        if (!customerToken) {
          results.push({
            ref: `${row.date} ${row.client}`,
            status: "error",
            message: `Login échoué pour ${row.client}`,
          });
          continue;
        }

        const items = parseAchat(row.achat);
        if (!items.length) {
          results.push({
            ref: `${row.date} ${row.client}`,
            status: "error",
            message: "Aucun produit valide dans achat",
          });
          continue;
        }

        try {
          await apiWithToken(
            "/api/v1/customer/cart/remove",
            "DELETE",
            null,
            customerToken,
          );
        } catch (e) {}

        let cartOk = true;
        for (const item of items) {
          const productId = await getProductIdBySku(item.sku, adminToken);
          console.log("SKU:", item.sku, "→ ProductID:", productId);

          if (!productId) {
            results.push({
              ref: `${row.date} ${row.client}`,
              status: "error",
              message: `Produit SKU "${item.sku}" introuvable`,
            });
            cartOk = false;
            break;
          }

          const added = await apiWithToken(
            `/api/v1/customer/cart/add/${productId}`,
            "POST",
            {
              product_id: productId,
              quantity: item.qty,
              is_buy_now: 0,
            },
            customerToken,
          );
          console.log("Ajout panier:", JSON.stringify(added));

          if (!added?.data) {
            results.push({
              ref: `${row.date} ${row.client}`,
              status: "error",
              message: `Ajout panier échoué pour SKU "${item.sku}" : ${added?.message}`,
            });
            cartOk = false;
            break;
          }
        }
        if (!cartOk) continue;

        // 5. Adresse
        const addrResponse = await apiWithToken(
          "/api/v1/customer/checkout/save-address",
          "POST",
          {
            billing: {
              first_name: row.client.split("@")[0],
              last_name: "Import",
              email: row.client,
              phone: "0000000000",
              address: ["Import CSV"],
              city: "Antananarivo",
              state: "Analamanga",
              country: "MG",
              postcode: "101",
              use_for_shipping: true,
            },
            shipping: {
              first_name: row.client.split("@")[0],
              last_name: "Import",
              email: row.client,
              phone: "0000000000",
              address: ["Import CSV"],
              city: "Antananarivo",
              state: "Analamanga",
              country: "MG",
              postcode: "101",
            },
          },
          customerToken,
        );
        console.log("Adresse:", JSON.stringify(addrResponse));

        if (!addrResponse?.data) {
          results.push({
            ref: `${row.date} ${row.client}`,
            status: "error",
            message: "Adresse échouée : " + (addrResponse?.message || ""),
          });
          continue;
        }

        // 6. Livraison
        const shippingMethods = addrResponse?.data?.rates;
        const shippingCode =
          shippingMethods?.[1]?.rates?.[0]?.method || "free_free";
        await apiWithToken(
          "/api/v1/customer/checkout/save-shipping",
          "POST",
          {
            shipping_method: shippingCode,
          },
          customerToken,
        );

        // 7. Paiement
        await apiWithToken(
          "/api/v1/customer/checkout/save-payment",
          "POST",
          {
            payment: { method: "cashondelivery" },
          },
          customerToken,
        );

        // 8. Placer la commande
        const order = await apiWithToken(
          "/api/v1/customer/checkout/save-order",
          "POST",
          {},
          customerToken,
        );
        console.log("Order:", JSON.stringify(order));

        if (order?.data?.order?.id) {
          const orderId = order.data.order.id;
          if (row.date) {
            const [day, month, year] = row.date.split("/");
            const [hour, minute] = (row.heure || "00:00").split(":");
            const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:00`;

            await backAPI(`/update-order-date/${orderId}`, "POST", {
              date: formattedDate,
            });
          }

          // 9. Si statut completed → créer facture + shipment
          if (row.status === "processing" || row.status === "completed") {
            const orderDetails = await apiWithToken(
              `/api/v1/admin/sales/orders/${orderId}`,
              "GET",
              null,
              adminToken,
            );

            const invoiceItems = {};
            const shipmentItems = {};

            orderDetails?.data?.items?.forEach((item) => {
              invoiceItems[item.id] = item.qty_ordered;
              shipmentItems[item.id] = { 1: item.qty_ordered };
            });

            // Créer la facture pour processing ET completed
            const invoice = await apiWithToken(
              `/api/v1/admin/sales/invoices/${orderId}`,
              "POST",
              { invoice: { items: invoiceItems } },
              adminToken,
            );
            console.log("Invoice:", JSON.stringify(invoice));

            // Créer le shipment SEULEMENT pour completed
            if (row.status === "completed") {
              const shipment = await apiWithToken(
                `/api/v1/admin/sales/shipments/${orderId}`,
                "POST",
                {
                  shipment: {
                    carrier_title: "Import",
                    track_number: "",
                    source: 1,
                    total_qty: orderDetails?.data?.total_qty_ordered,
                    items: shipmentItems,
                  },
                },
                adminToken,
              );
              console.log("Shipment:", JSON.stringify(shipment));
            }
          }
          results.push({
            ref: `${row.date} ${row.client}`,
            status: "success",
            id: orderId,
          });
        } else {
          results.push({
            ref: `${row.date} ${row.client}`,
            status: "error",
            message:
              "Commande échouée : " + (order?.message || JSON.stringify(order)),
          });
        }
      } catch (e) {
        results.push({
          ref: `${row.date} ${row.client}`,
          status: "error",
          message: e.message,
        });
      }
    }

    return results;
  },
};
