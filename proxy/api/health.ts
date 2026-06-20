import { handleHealthRequest } from "../src/responses-health.js";

export const config = {
  runtime: "nodejs22.x",
  maxDuration: 10
};

export default Object.assign(handleHealthRequest, { fetch: handleHealthRequest });
