/** @type {import("jest").Config} */
module.exports = {
  rootDir: "./src",
  moduleDirectories: ["node_modules", "<rootDir>"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "^hooks/(.*)$": "<rootDir>/hooks/$1",
    "^utils/(.*)$": "<rootDir>/utils/$1",
    "^components/(.*)$": "<rootDir>/components/$1",
    "\\.(css|less|scss)$": "identity-obj-proxy"
  }
};
