import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner component", () => {
  test("renders default spinner element structure with role='status'", () => {
    const element = LoadingSpinner({});
    expect(element).toBeDefined();
    expect(element.props.role).toBe("status");
    expect(element.props["aria-live"]).toBe("polite");
    expect(element.props.children[1].props.children).toBe("Loading...");
  });

  test("renders custom label in screen-reader container", () => {
    const element = LoadingSpinner({ label: "Loading test data..." });
    const srSpan = element.props.children[1];
    expect(srSpan.props.className).toBe("sr-only");
    expect(srSpan.props.children).toBe("Loading test data...");
  });

  test("renders overlay container when overlay is true", () => {
    const element = LoadingSpinner({ overlay: true });
    expect(element.props.className).toContain("fixed inset-0");
    expect(element.props.className).toContain("bg-gray-500/50");
  });

  test("renders different size classes accurately", () => {
    const smallEl = LoadingSpinner({ size: "small" });
    const normalEl = LoadingSpinner({ size: "normal" });
    const largeEl = LoadingSpinner({ size: "large" });
    const fallbackEl = LoadingSpinner({ size: "unknown" });

    expect(smallEl.props.children[0].props.className).toContain("h-6 w-6");
    expect(normalEl.props.children[0].props.className).toContain("h-12 w-12");
    expect(largeEl.props.children[0].props.className).toContain("h-16 w-16");
    expect(fallbackEl.props.children[0].props.className).toContain("h-12 w-12");
  });
});
