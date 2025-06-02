const esmModules = [
  "react-markdown",
  "markdown-table",
  "remark-.*",
  "mdast-util-.*",
  "hast-util-.*",
  "micromark.*",
  "unist-.*",
  "vfile.*",
  "estree-util-.*",
  "property-information",
  "comma-separated-tokens",
  "space-separated-tokens",
  "escape-string-regexp",
  "decode-named-character-reference",
  "longest-streak",
  "trim-lines",
  "bail",
  "ccount",
  "trough",
  "zwitch",
  "devlop",
  "html-url-attributes",
  "unified",
  "is-plain-obj"
];

module.exports = {
  rootDir: "./src/",
  moduleDirectories: ["node_modules", "<rootDir>"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { configFile: "./babel.config.js" }]
  },
  transformIgnorePatterns: [`/node_modules/(?!(?:${esmModules.join("|")})/)`],
  moduleNameMapper: {
    "^utils/(.*)$": "<rootDir>/utils/$1",
    "^hooks/(.*)$": "<rootDir>/hooks/$1",
    "^components/(.*)$": "<rootDir>/components/$1",
    "\\.(css|less)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    "^react-markdown$": "<rootDir>/src/__mocks__/react-markdown.js",
    "^remark-gfm$": "<rootDir>/src/__mocks__/remark-gfm.js",
    // Optional catch-alls
    "\\.(css|less)$": "identity-obj-proxy"
  },
  moduleFileExtensions: ["js", "jsx", "json", "node"]
};
