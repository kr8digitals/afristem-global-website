"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Landmark, MessageCircle, PartyPopper, Receipt } from "lucide-react";
import { ReceiptUpload } from "@/components/forms/receipt-upload";
import type { RegistrationConfirmation } from "@/lib/types";
import { registrationTypeLabel, registrationWhatsAppMessage, whatsappLink } from "@/lib/whatsapp";

/**
 * The screen every registration ends on: "Step 1 of 2 complete".
 *
 * Step 1 is the form (done). Step 2 is proving payment, or asking the team to
 * confirm the registration — by WhatsApp, with the receipt box right here, and
 * the status page for checking progress later.
 */
export function RegistrationComplete({
  confirmation,
  confirmationSent = false,
}: {
  confirmation: RegistrationConfirmation;
  confirmationSent?: boolean;
}) {
  const [paymentStatus, setPaymentStatus] = useState(confirmation.paymentStatus);
  const pays = confirmation.paymentRequired;
  const underReview = paymentStatus === "under_review";
  const waLink = whatsappLink(
    confirmation.whatsapp,
    registrationWhatsAppMessage({
      reference: confirmation.reference,
      fullName: confirmation.fullName,
      phone: confirmation.phone,
      type: confirmation.type,
      registeredFor: confirmation.registeredFor,
      school: confirmation.school,
      payment: pays,
    }),
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sun-300 bg-gradient-to-br from-sun-50 to-white p-6 sm:p-10">
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sun-400/30 blur-3xl" aria-hidden />

      <div className="relative">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-sun-400 text-navy-950 shadow-glow">
          <PartyPopper className="size-7" />
        </span>

        <h3 className="mt-5 font-display text-2xl font-extrabold leading-tight text-navy-900 sm:text-3xl">
          Step 1 of 2 complete — we have received your registration.
        </h3>
        <p className="mt-3 max-w-2xl text-navy-800/70">
          Thank you, {confirmation.firstName || confirmation.fullName.split(" ")[0]}.{" "}
          {confirmationSent ? (
            <>A copy has been sent to <strong>{confirmation.email}</strong>. </>
          ) : null}
          {pays
            ? "Complete step 2 by paying the fee and sending us your receipt — everything is below."
            : "There is nothing to pay. Complete step 2 by asking our team to confirm your registration."}
        </p>

        {/* the facts */}
        <dl className="mt-6 grid gap-x-6 gap-y-4 rounded-2xl border border-navy-900/10 bg-white p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-navy-800/50">Your reference</dt>
            <dd className="font-display text-xl font-extrabold tracking-wider text-navy-900">{confirmation.reference}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-navy-800/50">Name</dt>
            <dd className="font-semibold text-navy-900">{confirmation.fullName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-navy-800/50">Registering for</dt>
            <dd className="font-semibold text-navy-900">{confirmation.registeredFor || "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-widest text-navy-800/50">Registering as</dt>
            <dd className="font-semibold text-navy-900">{registrationTypeLabel(confirmation.type)}</dd>
          </div>
          {confirmation.school ? (
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-widest text-navy-800/50">School</dt>
              <dd className="font-semibold text-navy-900">{confirmation.school}</dd>
            </div>
          ) : null}
        </dl>

        {/* step 2 */}
        {pays ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-navy-900/10 bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-extrabold text-navy-900">
                <Receipt className="size-4" /> Payment required
              </p>
              {confirmation.fee ? (
                <p className="mt-2 font-display text-lg font-bold text-navy-900">{confirmation.fee}</p>
              ) : null}
              {confirmation.paymentInstructions ? (
                <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-navy-800/75">
                  <Landmark className="mt-0.5 size-4 shrink-0 text-navy-700" />
                  <span>{confirmation.paymentInstructions}</span>
                </p>
              ) : null}
              <p className="mt-3 text-xs leading-relaxed text-navy-800/60">
                After paying, upload your receipt below or send it on WhatsApp. Your registration stays paused until we
                have checked it.
              </p>
            </div>

            {underReview ? (
              <div className="rounded-2xl border border-sky-300 bg-sky-50 p-5">
                <p className="flex items-center gap-2 text-sm font-extrabold text-sky-900">
                  <CheckCircle2 className="size-5" /> Payment proof received — under review
                </p>
                <p className="mt-2 text-sm leading-relaxed text-sky-900/80">
                  Thank you. Our team will check your receipt and confirm your registration. You can follow progress on
                  the status page below.
                </p>
              </div>
            ) : (
              <ReceiptUpload
                reference={confirmation.reference}
                email={confirmation.email}
                onUploaded={(status) => setPaymentStatus(status === "under_review" ? "under_review" : paymentStatus)}
              />
            )}

            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto">
              <MessageCircle className="size-4" /> Send payment proof on WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5">
              <p className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                <CheckCircle2 className="size-5" /> No payment needed
              </p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
                A team member will confirm your registration and give you your registration number. Tap the button below
                and your WhatsApp message will already include your details.
              </p>
            </div>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto">
              <MessageCircle className="size-4" /> Confirm my registration on WhatsApp
            </a>
          </div>
        )}

        {/* status + next steps */}
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-navy-900/10 pt-6">
          <Link href="/register/status" className="btn-navy">
            Check my registration <ArrowRight className="size-4" />
          </Link>
          <Link href="/programmes" className="btn-outline btn-sm">Explore more programmes</Link>
          <Link href="/events" className="btn-outline btn-sm">See upcoming events</Link>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-navy-800/60">
          Keep your reference safe. On <Link className="font-bold text-navy-900 underline underline-offset-4" href="/register/status">/register/status</Link>{" "}
          you enter your reference and this email address to see your progress, upload another receipt, or print your
          confirmation slip once you are approved.
        </p>
      </div>
    </div>
  );
}
