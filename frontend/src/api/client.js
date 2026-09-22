const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('deenstar_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),

  // Products
  listProducts: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (slug) => request(`/products/${slug}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload, auth: true }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),

  // Categories
  listCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: payload, auth: true }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE', auth: true }),

  // Cart
  getCart: () => request('/cart', { auth: true }),
  addToCart: (product_id, quantity = 1) =>
    request('/cart', { method: 'POST', body: { product_id, quantity }, auth: true }),
  updateCartItem: (id, quantity) =>
    request(`/cart/${id}`, { method: 'PUT', body: { quantity }, auth: true }),
  removeCartItem: (id) => request(`/cart/${id}`, { method: 'DELETE', auth: true }),
  clearCart: () => request('/cart', { method: 'DELETE', auth: true }),

  // Orders
  placeOrder: (payload) => request('/orders', { method: 'POST', body: payload, auth: true }),
  listMyOrders: () => request('/orders', { auth: true }),
  getOrder: (id) => request(`/orders/${id}`, { auth: true }),
  listAllOrders: () => request('/orders/admin/all', { auth: true }),
  updateOrderStatus: (id, payload) => request(`/orders/${id}/status`, { method: 'PUT', body: payload, auth: true }),

  // Wishlist
  getWishlist: () => request('/wishlist', { auth: true }),
  addToWishlist: (product_id) => request('/wishlist', { method: 'POST', body: { product_id }, auth: true }),
  removeWishlistItem: (id) => request(`/wishlist/${id}`, { method: 'DELETE', auth: true })
};

export { getToken };
