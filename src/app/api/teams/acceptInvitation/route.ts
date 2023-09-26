import connect from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import Team from "@/models/teamModel";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { token } = reqBody;

    const team = await Team.findOne({
      "members.verifyToken": token,
      "members.verifyTokenExpiry": { $gt: Date.now() },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    await Team.findOneAndUpdate(
      { _id: team._id, "members.verifyToken": token },
      {
          "members.$.isVerified": true,
          "members.$.verifyToken":null,
        "members.$.verifyTokenExpiry":null,
      }
    );

    return NextResponse.json({
      message: "Invitation Accepted successfully",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
