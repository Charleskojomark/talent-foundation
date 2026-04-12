import { NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const APP_ID = process.env.AGORA_APP_ID || "";
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || "";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const channelName = searchParams.get("channelName");
        const uid = searchParams.get("uid") || "0";
        const role = searchParams.get("role") === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        if (!channelName) {
            return NextResponse.json({ error: "channelName is required" }, { status: 400 });
        }

        if (!APP_ID || !APP_CERTIFICATE) {
            console.warn("Agora credentials not set. Returning a dummy token for testing.");
            return NextResponse.json({
                token: "DUMMY_TOKEN_PLEASE_SET_AGORA_CREDENTIALS",
                appId: "DUMMY_APP_ID",
                warning: "AGORA_APP_ID and AGORA_APP_CERTIFICATE are not set in .env.local"
            });
        }

        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            parseInt(uid),
            role,
            privilegeExpiredTs,
            privilegeExpiredTs
        );

        return NextResponse.json({ token, appId: APP_ID });
    } catch (error: any) {
        console.error("Agora Token Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
