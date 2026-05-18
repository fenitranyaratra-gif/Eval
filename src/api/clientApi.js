const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("customer_token");

export const clientApi = async (endpoint, method = "GET", body = null) => {
  const token = "9|GeNUGyLY5LnqwdQXvKboti8xaRt4LsXRsoKS9VtA65eae17b";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
};
