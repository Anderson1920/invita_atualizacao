import QRCode from "qrcode";

export async function createQrDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    margin: 1,
    width: 360,
    color: {
      dark: "#32115f",
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
}

export function invitationUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}/convite/${encodeURIComponent(token)}`;
}
