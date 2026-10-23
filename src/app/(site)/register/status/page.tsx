export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { StatusCheck } from "@/components/forms/status-check";
import { Reveal } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Check my registration",
  description:
    "Check where your AFRISTEM registration stands: upload a payment receipt, see whether your payment is under review, and print your confirmation slip once you are approved.",
};

export default function RegistrationStatusPage() {
  return (
    <section className="relative overflow-hidden bg-navy-950 pb-24 pt-[calc(var(--header-h,12rem)+1.75rem)] noise">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full bg-sun-400/25 blur-[120px]" aria-hidden />
      <div className="container-x relative">
        <Reveal className="max-w-3xl text-white">
          <Link href="/register" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white">
            <ArrowLeft className="size-4" /> Back to registration
          </Link>
          <span className="eyebrow-dark mb-5">Step 2 of 2</span>
          <h1 className="h1">Check my <span className="text-gradient-sun">registration</span></h1>
          <p className="lead mt-5 text-white/75">
            Enter your registration reference and the email address you registered with. You can send your payment
            receipt here, see whether it is under review, and print your confirmation slip once you are approved.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sun-200">
            <ShieldCheck className="size-4" /> Your reference and email must both match — that keeps your details private.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 max-w-3xl">
          <StatusCheck />
        </Reveal>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-white/60">
          Paid by transfer but no receipt yet? Pay to the account on the programme page, then upload a photo of the
          transfer or send it to us on WhatsApp using the button on your confirmation screen.
        </p>
      </div>
    </section>
  );
}
