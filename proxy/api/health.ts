import { handleHealthRequest } from "../src/responses-health.js";

export const config = {
  maxDuration: 10
};

export default Object.assign(handleHealthRequest, { fetch: handleHealthRequest });
