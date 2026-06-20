import { prepareAnalyzerImage } from "../../src/services/analyzer/imagePreprocessing";
import * as ImageManipulator from "expo-image-manipulator";

jest.mock("expo-image-manipulator", () => ({
  SaveFormat: {
    JPEG: "jpeg"
  },
  manipulateAsync: jest.fn()
}));

describe("image preprocessing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns compressed image under the per-image limit", async () => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: "file:///compressed.jpg",
      width: 1200,
      height: 900
    });
    global.fetch = jest.fn().mockResolvedValue({
      blob: async () => ({ size: 500_000, type: "image/jpeg" })
    }) as unknown as typeof fetch;

    const result = await prepareAnalyzerImage("file:///input.jpg", "ingredients");

    expect(result.sizeBytes).toBe(500_000);
    expect(result.type).toBe("image/jpeg");
  });

  test("retries with reduced dimensions when the first output is too large", async () => {
    (ImageManipulator.manipulateAsync as jest.Mock)
      .mockResolvedValueOnce({ uri: "file:///first.jpg", width: 2400, height: 1600 })
      .mockResolvedValueOnce({ uri: "file:///second.jpg", width: 1700, height: 1133 });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ blob: async () => ({ size: 2_000_000, type: "image/jpeg" }) })
      .mockResolvedValueOnce({ blob: async () => ({ size: 800_000, type: "image/jpeg" }) }) as unknown as typeof fetch;

    const result = await prepareAnalyzerImage("file:///input.jpg", "front");

    expect(result.uri).toBe("file:///second.jpg");
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2);
  });
});
