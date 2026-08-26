import { NextRequest, NextResponse } from "next/server";

// Meta verifies that this webhook belongs to us
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_VERIFY_TOKEN
  ) {
    console.log("Webhook verified successfully!");

    return new NextResponse(challenge, {
      status: 200,
    });
  }

  return NextResponse.json(
    { error: "Verification failed" },
    { status: 403 }
  );
}

// Meta sends Instagram events here
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "Instagram webhook received:",
      JSON.stringify(body, null, 2)
    );

    // Get the first webhook entry
    const entry = body.entry?.[0];

    // Get the first change
    const change = entry?.changes?.[0];

    // Get the event data
    const value = change?.value;

    // Extract the comment text
    const commentText =
      value?.text ||
      value?.message ||
      value?.comment?.text ||
      "";

    console.log("Comment text:", commentText);

    // Check whether the comment contains our keyword
    if (commentText.toLowerCase().includes("website")) {
      console.log("🔥 WEBSITE KEYWORD DETECTED!");

      // Instagram DM functionality will be added here later
    }

    return NextResponse.json(
      { received: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}