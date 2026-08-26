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

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const commentText =
      value?.text ||
      value?.message ||
      value?.comment?.text ||
      "";

    const commentId = value?.id;

    console.log("Comment text:", commentText);
    console.log("Comment ID:", commentId);

    if (
      commentText.toLowerCase().includes("website") &&
      commentId
    ) {
      console.log("🔥 WEBSITE KEYWORD DETECTED!");

      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
      const instagramUserId = process.env.INSTAGRAM_USER_ID;

      if (!accessToken || !instagramUserId) {
        console.error("❌ Missing Instagram environment variables");

        return NextResponse.json(
          { error: "Missing Instagram configuration" },
          { status: 500 }
        );
      }

      const response = await fetch(
        `https://graph.instagram.com/v23.0/${instagramUserId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            recipient: {
              comment_id: commentId,
            },
            message: {
              text:
                "Hey! 👋 Thanks for commenting WEBSITE. I'll send you the website information shortly.",
            },
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Instagram DM sent successfully!");
      } else {
        console.error("❌ Instagram DM failed!");
      }

      console.log("Instagram API status:", response.status);
      console.log(
        "Instagram API response:",
        JSON.stringify(result, null, 2)
      );
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