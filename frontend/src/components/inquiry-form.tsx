"use client";
import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";

export function InquiryForm() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback(null);
    const form = event.currentTarget;
    const values = new FormData(form);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const payload = {
      contactName: String(values.get("contactName") ?? "").trim(),
      email: String(values.get("email") ?? "").trim(),
      phone: String(values.get("phone") ?? "").trim(),
      learnerAgeGroup: String(values.get("learnerAgeGroup") ?? "PREFER_NOT_TO_SAY"),
      subjectInterest: String(values.get("subjectInterest") ?? "").trim(),
      mode: String(values.get("mode") ?? "EITHER"),
      timezone,
      message: String(values.get("message") ?? "").trim(),
      privacyConsent: values.get("privacyConsent") === "on",
      website: String(values.get("website") ?? ""),
    };
    try {
      await apiRequest("/booking-requests", { method: "POST", body: payload });
      form.reset();
      setFeedback({ type: "success", text: "Your request is on its way. Our team will follow up with you soon." });
    } catch (error) {
      setFeedback({ type: "error", text: error instanceof ApiError ? error.message : "We couldn't send your request. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="form-field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="contactName" autoComplete="name" minLength={2} maxLength={120} placeholder="How should we address you?" required /></div>
        <div className="form-field"><label htmlFor="contact-email">Email address</label><input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" required /></div>
        <div className="form-field"><label htmlFor="contact-phone">Phone <span>(optional)</span></label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="A number we can reach you on" /></div>
        <div className="form-field"><label htmlFor="learner-age">Learner age group</label><select id="learner-age" name="learnerAgeGroup" defaultValue="PREFER_NOT_TO_SAY" required><option value="PREFER_NOT_TO_SAY">Prefer not to say</option><option value="CHILD">Child</option><option value="TEEN">Teen</option><option value="ADULT">Adult</option></select></div>
        <div className="form-field"><label htmlFor="subject-interest">What would you like help with?</label><select id="subject-interest" name="subjectInterest" defaultValue="" required><option value="" disabled>Choose a subject</option><option>Mathematics</option><option>English</option><option>Science</option><option>Exam preparation</option><option>Study skills</option><option>Something else</option></select></div>
        <div className="form-field"><label htmlFor="session-mode">Preferred format</label><select id="session-mode" name="mode" defaultValue="EITHER"><option value="EITHER">Open to either</option><option value="ONLINE">Online</option><option value="IN_PERSON">In person</option></select></div>
        <div className="form-field full"><label htmlFor="message">Anything else we should know? <span>(optional)</span></label><textarea id="message" name="message" maxLength={3000} placeholder="Share a goal, a question, or a little context to help us get started." /></div>
        <div className="honeypot" aria-hidden="true"><label htmlFor="company-website">Website</label><input id="company-website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <label className="consent-row form-field full"><span><input type="checkbox" name="privacyConsent" required /> I agree that Wisey Tutors may use these details to respond to my tutoring request.</span></label>
      </div>
      <div className="submit-row"><p className={`form-status${feedback ? ` ${feedback.type}` : ""}`} aria-live="polite">{feedback?.text ?? "Your details are only used to follow up about this request."}</p><button className="button" type="submit" disabled={pending}>{pending ? <>Sending <LoaderCircle className="spin" /></> : <>Request a conversation <ArrowRight /></>}</button></div>
    </form>
  );
}
