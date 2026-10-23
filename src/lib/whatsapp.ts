/**
 * WhatsApp buttons on the confirmation screen and the status page.
 *
 * The number always comes from Admin → Brand & contact (site_settings.whatsapp),
 * never from the code, so changing it in the dashboard changes every button.
 * Safe to import from client components: no server-only code here.
 */
import { registrationTypes } from "@/content/data";

/** "+234 810 554 1242" -> "2348105541242" (what wa.me expects). */
export function whatsappDigits(number: string | undefined | null): string {
  return (number ?? "").replace(/\D/g, "").replace(/^0+/, "");
}

/** A wa.me link that opens the chat with the message already typed. */
export function whatsappLink(number: string | undefined | null, message: string): string {
  const digits = whatsappDigits(number);
  const text = encodeURIComponent(message);
  return digits ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function registrationTypeLabel(type: string | undefined | null): string {
  return registrationTypes.find((t) => t.value === type)?.label ?? (type ?? "");
}

export type WhatsAppDetails = {
  reference: string;
  fullName: string;
  phone: string;
  type?: string;
  registeredFor?: string;
  school?: string;
  /** true when this registration needs payment proof */
  payment: boolean;
};

/**
 * The pre-filled message. It always carries everything the office needs to
 * find the registration without asking: reference, name, phone, how they
 * registered, what for, and the school when there is one.
 */
export function registrationWhatsAppMessage(d: WhatsAppDetails): string {
  const lines = [
    d.payment ? "I have made payment — my receipt is attached" : "Please confirm my registration",
    "",
    `Reference: ${d.reference}`,
    `Full name: ${d.fullName}`,
    `Phone: ${d.phone}`,
    `Registering as: ${registrationTypeLabel(d.type)}`,
  ];
  if (d.registeredFor) lines.push(`Registering for: ${d.registeredFor}`);
  if (d.school) lines.push(`School: ${d.school}`);
  lines.push("", "Thank you!");
  return lines.join("\n");
}
