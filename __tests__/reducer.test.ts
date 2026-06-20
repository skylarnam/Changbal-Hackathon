import { createProductFromExtraction } from "../src/domain/productAnalysis";
import { defaultAppState } from "../src/services/storage/appStorage";
import { appReducer, demoProfile } from "../src/state/appReducer";
import { sampleExtractions } from "../src/data/sampleProducts";

describe("app reducer", () => {
  test("adds, updates, deletes, and finishes products", () => {
    const product = createProductFromExtraction(sampleExtractions.hydration, demoProfile, "product-1");
    const withProfile = appReducer(defaultAppState, { type: "saveProfile", profile: demoProfile });
    const added = appReducer(withProfile, { type: "addProduct", product });
    expect(added.products).toHaveLength(1);

    const updated = appReducer(added, { type: "updateProduct", product: { ...product, name: "수정 제품" } });
    expect(updated.products[0]?.name).toBe("수정 제품");

    const finished = appReducer(updated, { type: "toggleFinished", productId: product.id });
    expect(finished.products[0]?.status).toBe("finished");

    const deleted = appReducer(finished, { type: "deleteProduct", productId: product.id });
    expect(deleted.products).toHaveLength(0);
  });

  test("prevents duplicate product add by brand and name", () => {
    const product = createProductFromExtraction(sampleExtractions.hydration, demoProfile, "product-1");
    const state = appReducer(defaultAppState, { type: "addProduct", product });
    const duplicate = appReducer(state, { type: "addProduct", product: { ...product, id: "product-2" } });
    expect(duplicate.products).toHaveLength(1);
  });
});
