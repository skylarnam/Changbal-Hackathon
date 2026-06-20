import { handleAnalyzeProductRequest } from "../src/extract-product.js";

export const config = {
  maxDuration: 60
};

export default Object.assign(handleAnalyzeProductRequest, { fetch: handleAnalyzeProductRequest });
