import { handleAnalyzeProductRequest } from "../src/extract-product.js";

export const config = {
  runtime: "nodejs22.x",
  maxDuration: 60
};

export default Object.assign(handleAnalyzeProductRequest, { fetch: handleAnalyzeProductRequest });
