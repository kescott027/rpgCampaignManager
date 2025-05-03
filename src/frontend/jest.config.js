/** @type {import("jest").Config} */
module.exports = {
  rootDir: ".",
  moduleDirectories: ["node_modules", "<rootDir>"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "\\.(css|less|scss)$": "identity-obj-proxy"
  }
};
