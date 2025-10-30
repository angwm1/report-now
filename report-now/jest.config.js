const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  collectCoverageFrom: [
    "src/app/api/**/*.js",
    "src/lib/**/*.js",
    "!src/app/api/**/route.test.js",
  ],
  coverageDirectory: "<rootDir>/coverage",
  clearMocks: true,
};

module.exports = createJestConfig(customJestConfig);
