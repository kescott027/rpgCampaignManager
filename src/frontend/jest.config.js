module.exports = {
  rootDir: "./src/", // Important: this is where your components/hooks live
  moduleDirectories: ["node_modules", "<rootDir>"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "^utils/(.*)$": "<rootDir>/utils/$1",
    "^hooks/(.*)$": "<rootDir>/hooks/$1",
    "^components/(.*)$": "<rootDir>/components/$1",
    "\\.(css|less)$": "identity-obj-proxy"
  }
};
