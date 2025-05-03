/** @type {import("jest").Config} */
module.exports = {
  rootDir: "./src",
  moduleDirectories: ["node_modules", "<rootDir>/frontend"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/frontend/setupTests.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "^hooks/(.*)$": "<rootDir>frontend/src/hooks/$1",
    "^utils/(.*)$": "<rootDir>frontend/src/utils/$1",
    "^components/(.*)$": "<rootDir>/frontend/src/components/$1",
    "\\.(css|less|scss)$": "identity-obj-proxy"
  }
};
