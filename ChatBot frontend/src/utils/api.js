const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");
const getGuestId = () => localStorage.getItem("guestId");

const setGuestId = (guestId) => {
  if (guestId) {
    localStorage.setItem("guestId", guestId);
  }
};

const buildHeaders = ({ includeAuth = true, includeGuest = true } = {}) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (includeGuest) {
    const guestId = getGuestId();
    if (guestId) {
      headers["x-guest-id"] = guestId;
    }
  }

  return headers;
};

const updateGuestIdFromResponse = (response) => {
  const guestId = response.headers.get("x-guest-id");
  if (guestId) {
    setGuestId(guestId);
  }
};

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  updateGuestIdFromResponse(response);
  return response;
};

export const api = {
  async login({ email, password }) {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: buildHeaders({ includeAuth: false, includeGuest: false }),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },
  async register({ name, email, password }) {
    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: buildHeaders({ includeAuth: false, includeGuest: true }),
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },
 async createSession(title = "New Chat") {
  const response = await apiFetch("/api/sessions", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ title }), // Dynamic title yahan se jayega
  });
  return response.json();
},
  async getSessions() {
    const response = await apiFetch("/api/sessions", {
      method: "GET",
      headers: buildHeaders(),
    });
    return response.json();
  },
  async deleteSession(sessionId) {
    const response = await apiFetch(`/api/sessions/${sessionId}`, {
      method: "DELETE",
      headers: buildHeaders(),
    });
    return response.json();
  },
  async getSessionMessages(sessionId) {
    const response = await apiFetch(`/api/sessions/${sessionId}/messages`, {
      method: "GET",
      headers: buildHeaders(),
    });
    return response.json();
  },
  async sendMessage({ sessionId, message }) {
    const response = await apiFetch("/api/chat/send", {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ sessionId, message }),
    });
    return response.json();
  },
  async updateTitle({sessionId,message}){
    const response = await apiFetch("/api/title",{
      method:"POST",
      headers: buildHeaders(),
      body: JSON.stringify({sessionId,title:message})
    })
    return response.json();
  }
};

export { API_BASE };
