// src/frontend/utils/api.js

export async function get(url, options = {}) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: options.credentials || "same-origin", // Optional override
    ...options
  });
  return handleResponse(response);
}

export async function post(url, data = {}, options = {}) {
  const isFormData = data instanceof FormData;

  const fetchOptions = {
    ...options,
    method: "POST",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    },
    body: isFormData ? data : JSON.stringify(data)
  };

  const response = await fetch(url, fetchOptions);
  return handleResponse(response);
}

export async function patch(url, data = {}, options = {}) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: JSON.stringify(data),
    credentials: options.credentials || "same-origin",
    ...options
  });
  return handleResponse(response);
}

export async function deleteRequest(url, data = {}, options = {}) {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: JSON.stringify(data),
    credentials: options.credentials || "same-origin",
    ...options
  });
  return handleResponse(response);
}

async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  const isJSON = contentType && contentType.includes("application/json");

  if (!response.ok) {
    const errorBody = isJSON ? await response.json() : await response.text();
    throw new Error(
      `API Error ${response.status}: ${JSON.stringify(errorBody)}`
    );
  }

  return isJSON ? response.json() : response.text();
}
