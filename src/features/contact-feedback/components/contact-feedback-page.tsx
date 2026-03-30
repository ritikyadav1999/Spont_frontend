"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Mail, Phone, SendHorizontal } from "lucide-react";
import { AppPageHeader } from "@/components/layout/app-page-header";
import { useSubmitFeedback } from "@/features/feedback/hooks/use-feedback";
import { getApiErrorMessage } from "@/lib/utils/api-response";

const inquiryTypeOptions = [
  { value: "FEEDBACK", label: "Feedback" },
  { value: "BUG_REPORT", label: "Bug Report" },
  { value: "REQUEST_FEATURE", label: "Feature Request" },
  { value: "REPORT_USER", label: "Report User" },
  { value: "GENERAL_QUERY", label: "General Query" },
] as const;

const inquiryTypeGuidance = [
  {
    title: "Feedback",
    description: "Share what feels great, what feels confusing, and what would make Spont more delightful.",
  },
  {
    title: "Bug Report",
    description: "Tell us what broke, where it happened, and what you expected instead so we can fix it faster.",
  },
  {
    title: "Feature Request",
    description: "Suggest a workflow, improvement, or idea you want to see in future releases.",
  },
  {
    title: "Report User",
    description: "Flag behavior or activity that should be reviewed by our team for safety and trust.",
  },
  {
    title: "General Query",
    description: "Use this for anything else, from support questions to partnership or account-related conversations.",
  },
] as const;

export function ContactFeedbackPage() {
  const submitFeedbackMutation = useSubmitFeedback();
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "FEEDBACK",
    message: "",
  });

  const updateField =
    (field: keyof typeof formValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    submitFeedbackMutation.mutate(formValues, {
      onSuccess: () => {
        setFormValues({
          name: "",
          email: "",
          phone: "",
          inquiryType: "FEEDBACK",
          message: "",
        });
      },
    });
  };

  return (
    <div className="ui-page-shell ui-page-shell--medium pb-20">
      <AppPageHeader
        description="Help us shape the next version of Spont. Share feedback, report friction, or reach our team directly."
        title={
          <>
            Connect & <span className="text-primary">Feedback</span>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[1.8rem] bg-surface-container p-6">
            <div className="absolute -right-12 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-on-surface-variant">Direct Channels</p>

            <div className="mt-6 space-y-4">
              <a
                className="flex items-center gap-4 rounded-[1.35rem] bg-surface-container-low p-4 transition-colors hover:bg-surface-container-high"
                href="tel:+1800SPONTUI"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Call our Concierge</p>
                  <p className="mt-1 text-base font-bold text-on-surface">+1 (800) SPONT-UI</p>
                </div>
              </a>

              <a
                className="flex items-center gap-4 rounded-[1.35rem] bg-surface-container-low p-4 transition-colors hover:bg-surface-container-high"
                href="mailto:hello@spont.io"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Send an Email</p>
                  <p className="mt-1 text-base font-bold text-on-surface">hello@spont.io</p>
                </div>
              </a>
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-surface-container p-6">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-on-surface-variant">Choose the Right Inquiry</p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Reach out anytime. Whether you found friction, need help, or have an idea worth building, your input helps us
              improve Spont for everyone.
            </p>

            <div className="mt-5 space-y-3">
              {inquiryTypeGuidance.map((item) => (
                <div className="rounded-[1.25rem] bg-surface-container-high px-4 py-3" key={item.title}>
                  <p className="text-sm font-bold text-on-surface">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-on-surface-variant">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] bg-surface-container-low p-6 shadow-[0_28px_80px_-50px_rgba(0,0,0,0.95)] sm:p-8 lg:p-10">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Send a Message</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Tell us what is working, what feels off, or what you want us to build next. Clear, honest feedback helps us
            make Spont sharper, faster, and more useful.
          </p>

          {submitFeedbackMutation.isSuccess ? (
            <div className="mt-6 rounded-[1.4rem] bg-primary/12 px-4 py-3 text-sm font-medium text-primary">
              {submitFeedbackMutation.data}
            </div>
          ) : null}

          {submitFeedbackMutation.isError ? (
            <div className="mt-6 rounded-[1.4rem] bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {getApiErrorMessage(submitFeedbackMutation.error, "Unable to submit feedback right now.")}
            </div>
          ) : null}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="ml-1 block text-sm font-medium text-on-surface-variant" htmlFor="feedback-name">
                  Name (Optional)
                </label>
                <input
                  className="w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/45 focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  id="feedback-name"
                  onChange={updateField("name")}
                  placeholder="Julian Voss"
                  type="text"
                  value={formValues.name}
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 block text-sm font-medium text-on-surface-variant" htmlFor="feedback-email">
                  Email (Optional)
                </label>
                <input
                  className="w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/45 focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  id="feedback-email"
                  onChange={updateField("email")}
                  placeholder="julian@voss.com"
                  type="email"
                  value={formValues.email}
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 block text-sm font-medium text-on-surface-variant" htmlFor="feedback-phone">
                  Phone (Optional)
                </label>
                <input
                  className="w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/45 focus:ring-1 focus:ring-primary/40 focus:outline-none"
                  id="feedback-phone"
                  onChange={updateField("phone")}
                  placeholder="+1 800 555 0199"
                  type="tel"
                  value={formValues.phone}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant" htmlFor="feedback-type">
                Inquiry Type
              </label>
              <select
                className="w-full rounded-xl bg-surface-container-highest px-4 py-3.5 text-on-surface focus:ring-1 focus:ring-primary/40 focus:outline-none"
                id="feedback-type"
                onChange={updateField("inquiryType")}
                value={formValues.inquiryType}
              >
                {inquiryTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="ml-1 block text-sm font-medium text-on-surface-variant" htmlFor="feedback-message">
                Message
              </label>
              <textarea
                className="min-h-44 w-full resize-none rounded-[1.2rem] bg-surface-container-highest px-4 py-4 text-on-surface placeholder:text-on-surface-variant/45 focus:ring-1 focus:ring-primary/40 focus:outline-none"
                id="feedback-message"
                onChange={updateField("message")}
                placeholder="How can we help you today?"
                required
                value={formValues.message}
              />
            </div>

            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-7 py-4 font-headline text-base font-extrabold text-on-primary-container transition-transform hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
              disabled={submitFeedbackMutation.isPending}
              type="submit"
            >
              <span>{submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}</span>
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-10 rounded-[1.5rem] bg-surface-container px-5 py-4">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary">What Happens Next</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
              We review every submission carefully and usually respond within 24 to 48 business hours. If your message is
              urgent, use the phone or email options on the left for a faster response.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
