import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.TEST_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const commentText = "WEBSITE";
  const commentId = "TEST_COMMENT_ID";

  console.log("🧪 TEST COMMENT RECEIVED");
  console.log("Comment text:", commentText);
  console.log("Comment ID:", commentId);

  if (commentText.toLowerCase().includes("website")) {
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

    console.log("Instagram API status:", response.status);
    console.log(
      "Instagram API response:",
      JSON.stringify(result, null, 2)
    );

    return NextResponse.json({
      keywordDetected: true,
      instagramApiStatus: response.status,
      instagramApiResponse: result,
    });
  }

  return NextResponse.json({
    keywordDetected: false,
  });
}