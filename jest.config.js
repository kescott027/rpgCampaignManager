module.exports = {
  rootDir: "./src/frontend/", // Important: this is where your components/hooks live
  moduleDirectories: ["node_modules", "<rootDir>"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  moduleNameMapper: {
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
    "^hooks/(.*)$": "<rootDir>/sr/hooks/$1",
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "\\.(css|less)$": "identity-obj-proxy"
  }
};
