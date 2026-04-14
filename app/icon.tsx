import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: "linear-gradient(to bottom right, #dfb14b, #f5d681)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "black",
                    borderRadius: "20%",
                    fontFamily: "sans-serif",
                    fontWeight: "bold",
                }}
            >
                TGI
            </div>
        ),
        { ...size }
    );
}
