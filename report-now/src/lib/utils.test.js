jest.mock("clsx", () => ({
  clsx: jest.fn((inputs) => inputs.filter(Boolean).join(" ")),
}));

jest.mock("tailwind-merge", () => ({
  twMerge: jest.fn((value) => `merged:${value}`),
}));

const { cn } = require("./utils");

describe("cn helper", () => {
  test("merges truthy class names and applies tailwind merge", () => {
    const result = cn("btn", null, "btn-primary", false, "w-full");
    expect(result).toBe("merged:btn btn-primary w-full");
  });
});
