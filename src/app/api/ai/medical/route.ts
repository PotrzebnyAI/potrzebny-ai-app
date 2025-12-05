import { NextRequest, NextResponse } from "next/server";
import {
  searchMedicalLiterature,
  getClinicalDecisionSupport,
  checkDrugInteractions,
  generateEvidenceSummary,
  verifyMedicalLicense,
  getAldehydeResearch,
  generateAldehydeToxicityReport,
} from "@/lib/ai/medical-panel";
import { checkRateLimit } from "@/lib/security/rate-limit";

// Medical API - requires license verification for full access
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const { allowed, remaining } = checkRateLimit(ip, "/api/ai/medical");

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();
    const { action, licenseNumber, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Public actions (no license required)
    const publicActions = ["verify_license", "aldehyde_research", "aldehyde_report"];

    // For non-public actions, license verification would be checked
    // In production, this would verify against stored verified licenses
    if (!publicActions.includes(action) && !licenseNumber) {
      return NextResponse.json(
        {
          error: "Medical license number required for this action",
          message: "This endpoint is restricted to verified healthcare professionals."
        },
        { status: 403 }
      );
    }

    let result;
    switch (action) {
      case "verify_license":
        if (!params.licenseData) {
          return NextResponse.json(
            { error: "License data is required" },
            { status: 400 }
          );
        }
        result = await verifyMedicalLicense(
          params.licenseData.licenseNumber,
          params.licenseData.country,
          params.licenseData.type
        );
        break;

      case "search_literature":
        if (!params.query) {
          return NextResponse.json(
            { error: "Query is required for literature search" },
            { status: 400 }
          );
        }
        result = await searchMedicalLiterature({
          query: params.query,
          filters: params.filters || {},
          maxResults: params.maxResults || 20,
        });
        break;

      case "clinical_decision":
        if (!params.patientCase) {
          return NextResponse.json(
            { error: "Patient case is required" },
            { status: 400 }
          );
        }
        result = await getClinicalDecisionSupport(params.patientCase);
        break;

      case "drug_interactions":
        if (!params.drugs || !Array.isArray(params.drugs)) {
          return NextResponse.json(
            { error: "Drugs array is required" },
            { status: 400 }
          );
        }
        result = await checkDrugInteractions(params.drugs);
        break;

      case "evidence_summary":
        if (!params.topic) {
          return NextResponse.json(
            { error: "Topic is required" },
            { status: 400 }
          );
        }
        result = await generateEvidenceSummary(params.topic, params.context || {});
        break;

      case "aldehyde_research":
        result = await getAldehydeResearch(params.subtopic || "metabolism");
        break;

      case "aldehyde_report":
        result = await generateAldehydeToxicityReport();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      ...result,
      disclaimer: "This information is for educational purposes only and does not replace professional medical advice.",
    });
  } catch (error) {
    console.error("Medical API error:", error);
    return NextResponse.json(
      { error: "Failed to process medical request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: "Medical Panel API for Healthcare Professionals",
    note: "Most endpoints require verified medical license",
    publicEndpoints: {
      verify_license: "Verify medical license",
      aldehyde_research: "Research on aldehyde metabolism and toxicity",
      aldehyde_report: "Generate aldehyde toxicity report",
    },
    restrictedEndpoints: {
      search_literature: "Search medical literature with AI synthesis",
      clinical_decision: "Clinical decision support system",
      drug_interactions: "Check drug interactions",
      evidence_summary: "Generate evidence-based summary (PICO)",
    },
    disclaimer: "This API provides educational information only. Not for clinical decision-making without professional oversight.",
  });
}
