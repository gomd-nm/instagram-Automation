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