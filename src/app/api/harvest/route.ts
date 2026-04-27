import { NextRequest, NextResponse } from "next/server";
import { STRESS_DATA } from "@/lib/constants";

// Week = 40 hours. Burnout = 110%+ overall utilization (not billable %).
// Healthy billable = 75–80%. Burnout risk threshold = 82%+ sustained.
// Excluded from reports: Ben Hart, Gustavo Delgado, Moe Rice, Megan Cosgrove, Mary-Susan Fiedler
// Teams: Creative, Strategy, Projects, Accounts (Admin excluded server-side)
// Supports ?range=current|3m|6m

const EXCLUDED = ["Ben Hart", "Gustavo Delgado", "Moe Rice", "Megan Cosgrove", "Mary-Susan Fiedler"];

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get("range") || "current";

  if (!process.env.HARVEST_TOKEN || !process.env.HARVEST_ACCOUNT_ID) {
    return NextResponse.json({ source: "mock", range, excluded: EXCLUDED, stress: STRESS_DATA });
  }

  // TODO: implement live Harvest fetch
  // GET https://api.harvestapp.com/v2/reports/time/team
  // Headers: Authorization: Bearer ${HARVEST_TOKEN}, Harvest-Account-Id: ${HARVEST_ACCOUNT_ID}
  return NextResponse.json({ source: "mock", range, excluded: EXCLUDED, stress: STRESS_DATA });
}
