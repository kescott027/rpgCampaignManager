// src/frontend/__mocks__/api.js

export const mockResponse = (data) => Promise.resolve({ data });

export default {
  get: jest.fn((url) => {
    if (url === "/api/config") {
      return mockResponse({ session_name: "Mock Session", developer_mode: true });
    }
    return mockResponse({});
  }),
  post: jest.fn((url, body) => {
    if (url === "/api/datastore/load-combat-queue") {
      return mockResponse([{ name: "Mock Character", initiative: 15 }]);
    }
    return mockResponse({});
  })
};
