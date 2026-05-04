import { NextResponse } from "next/server";
import { PRODUCT_CATEGORIES } from "@/models/products";
import {
  listFirstAddedStorefrontProducts,
  listStorefrontProducts,
} from "@/lib/storefrontProducts";

/** Public product list for the storefront (no admin cookie). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const firstAddedRaw = searchParams.get("firstAdded");
    let products;
    if (
      firstAddedRaw !== null &&
      firstAddedRaw !== "" &&
      /^\d+$/.test(firstAddedRaw)
    ) {
      const n = Number.parseInt(firstAddedRaw, 10);
      products = await listFirstAddedStorefrontProducts(
        Number.isFinite(n) ? n : 5
      );
    } else {
      products = await listStorefrontProducts();
    }
    return NextResponse.json(
      {
        products,
        categories: [...PRODUCT_CATEGORIES],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Could not load products." },
      { status: 500 }
    );
  }
}
