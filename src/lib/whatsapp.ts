import { formatNoWa } from "./utils";

export interface NotifConfig {
  konfirmasiAktif?: boolean;
  reminderAktif?: boolean;
  templateKonfirmasi?: string;
  templateReminder?: string;
}

export const DEFAULT_TEMPLATE_KONFIRMASI =
  "Halo {nama}, pendaftaran Anda di *{event}* berhasil!\n\nTanggal: {tanggal}\nLokasi: {lokasi}\n\nSimpan No WhatsApp ini untuk check-in saat hari-H.";

export const DEFAULT_TEMPLATE_REMINDER =
  "Halo {nama}, pengingat: *{event}* akan berlangsung besok.\n\nTanggal: {tanggal}\nLokasi: {lokasi}\n\nJangan lupa hadir dan siapkan No WhatsApp Anda untuk check-in.";

export function isWahaConfigured(): boolean {
  return Boolean(process.env.WAHA_API_URL);
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

export async function sendWhatsAppMessage(noWa: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const apiUrl = process.env.WAHA_API_URL;
  if (!apiUrl) {
    console.warn("[WAHA] WAHA_API_URL belum diset, pesan tidak dikirim:", text.slice(0, 80));
    return { ok: false, error: "WAHA_API_URL belum dikonfigurasi" };
  }

  const session = process.env.WAHA_SESSION || "default";
  const chatId = `${formatNoWa(noWa)}@c.us`;

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WAHA_API_KEY ? { "X-Api-Key": process.env.WAHA_API_KEY } : {}),
      },
      body: JSON.stringify({ chatId, text, session }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[WAHA] Gagal kirim:", res.status, body);
      return { ok: false, error: `WAHA error ${res.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[WAHA] Error:", error);
    return { ok: false, error: "Tidak dapat terhubung ke WAHA" };
  }
}
