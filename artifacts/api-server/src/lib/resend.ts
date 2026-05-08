import { Resend } from "resend";

let cachedClient: Resend | null = null;
let cachedKey: string | null = null;

export async function getResendClient(): Promise<Resend> {
  try {
    const resp = await fetch(
      "https://replit.com/api/v1/replit-connect/connectors/resend/connections",
      {
        headers: {
          Authorization: `Bearer ${process.env.REPLIT_CONNECT_TOKEN ?? ""}`,
        },
      },
    );
    if (resp.ok) {
      const data = (await resp.json()) as { connections?: { settings?: { api_key?: string } }[] };
      const key = data.connections?.[0]?.settings?.api_key;
      if (key && key !== cachedKey) {
        cachedKey = key;
        cachedClient = new Resend(key);
      }
    }
  } catch {
    // fall through to env var
  }

  if (!cachedClient) {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      cachedClient = new Resend(key);
    } else {
      throw new Error("No Resend API key available");
    }
  }

  return cachedClient;
}

export const FROM_EMAIL = "pastor@elkhartlife.com";
export const FROM_NAME = "Elkhart Life Church";
