import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Brain, Check, ChevronRight, Compass, HeartHandshake, Lightbulb, MessageCircle, Orbit, PencilRuler, ShieldCheck, Sparkles, Target, Telescope, UsersRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { InquiryForm } from "@/components/inquiry-form";
import { Reveal } from "@/components/reveal";

const subjects = [
  { icon: PencilRuler, title: "Mathematics", text: "Make tricky concepts feel clear, step by step." },
  { icon: BookOpen, title: "English & writing", text: "Build strong reading, writing, and communication skills." },
  { icon: Orbit, title: "Science", text: "Connect ideas across biology, chemistry, physics, and more." },
  { icon: Target, title: "Exam preparation", text: "Turn revision into a steady plan you can stick to." },
  { icon: Brain, title: "Learning support", text: "Get patient help with the topics that need more time." },
  { icon: Telescope, title: "Stretch & explore", text: "Follow curiosity into deeper ideas and new challenges." },
];
const faqs = [
  ["Who can learn with Wisey Tutors?", "Learners looking for a clearer explanation, more practice, or a new challenge. Share the learner’s age group and location in your request so our team can confirm what is available."],
  ["How do you find the right tutor?", "We start with the learner’s subject, goals, preferred format, schedule, and teaching style. Our team will talk through a suitable match before sessions begin."],
  ["Are sessions online or in person?", "The available formats depend on your location and tutor availability. Select your preference in the enquiry form and we’ll confirm the options."],
  ["How much do sessions cost?", "Rates depend on the subject, format, and schedule. We’ll share current pricing and any package options in our follow-up."],
  ["Is my request a confirmed booking?", "Your request starts a conversation with the Wisey team. A session is only confirmed after you agree on a tutor, time, format, and price."],
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="eyebrow"><span className="eyebrow-dot" /> A better kind of learning support</span>
                <h1>Find your rhythm.<br />Build your <span className="accent">confidence.</span></h1>
                <p className="hero-lede">Good tutoring is more than getting through the next question. It’s a patient guide, a plan that fits, and the feeling that you can do this.</p>
                <div className="hero-actions"><Link className="button" href="#contact">Find your fit <ArrowRight aria-hidden="true" /></Link><Link className="button button-secondary" href="#approach">How Wisey works <ArrowDown aria-hidden="true" /></Link></div>
                <div className="hero-proof"><span><ShieldCheck />Thoughtful tutor matching</span><span><HeartHandshake />Support at your pace</span><span><Sparkles />Small wins matter</span></div>
              </div>
              <div className="hero-visual" aria-label="Illustration of a personalized learning plan">
                <div className="visual-orbit"><span className="orbit-node one" /><span className="orbit-node two" /></div>
                <div className="learning-card">
                  <div className="learning-card-top"><span>Learning plan</span><span className="card-live">Made for you</span></div>
                  <h2>Progress, one clear step at a time.</h2>
                  <p>A flexible plan shaped around the learner—not the other way around.</p>
                  <div className="lesson-progress"><span className="progress-ring"><b>✓</b></span><div className="progress-copy"><strong>Start with what matters</strong><small>Goals · strengths · next steps</small></div><ChevronRight size={16} /></div>
                  <div className="lesson-list">
                    <div className="lesson-item"><span className="lesson-check"><Check /></span><div><strong>Understand the goal</strong><small>Know where you want to go</small></div><Check /></div>
                    <div className="lesson-item"><span className="lesson-check"><Compass /></span><div><strong>Find your kind of click</strong><small>Learn in the way that fits</small></div><ChevronRight /></div>
                    <div className="lesson-item"><span className="lesson-check"><Sparkles /></span><div><strong>Notice the progress</strong><small>Make every step count</small></div><ChevronRight /></div>
                  </div>
                </div>
                <span className="visual-caption">A little support. A lot of possibility.</span>
              </div>
            </div>
            <div className="hero-bottom">
              <article><UsersRound /><div><strong>One-to-one guidance</strong><small>Make space for every question</small></div></article>
              <article><Compass /><div><strong>Flexible formats</strong><small>Explore the options that fit</small></div></article>
              <article><Target /><div><strong>A plan around you</strong><small>Start with your goals</small></div></article>
              <article><Lightbulb /><div><strong>Progress worth noticing</strong><small>Keep the momentum going</small></div></article>
            </div>
          </div>
        </section>

        <section className="section subjects-section" id="subjects">
          <div className="wrap">
            <div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> Room to grow</span><h2>Support for the subject.<br /><em>Confidence for what’s next.</em></h2></div><p>From a tricky topic to a bigger goal, find thoughtful support to help learning move forward.</p></div>
            <div className="subject-grid">
              {subjects.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * .045}><Link className="subject-card" href="#contact"><span className="subject-icon"><Icon /></span><h3>{title}</h3><p>{text}</p><ArrowUpRight className="subject-arrow" /></Link></Reveal>)}
            </div>
            <p className="form-status" style={{ marginTop: 18 }}>Subjects and tutor availability can vary by location. Tell us what you need and we’ll confirm the options.</p>
          </div>
        </section>

        <section className="section approach-section" id="approach">
          <div className="wrap approach-grid">
            <Reveal><div className="approach-visual" aria-label="A graphic showing different parts of a learner's journey"><div className="approach-core">w</div><span className="approach-tag tag-one"><MessageCircle />Ask anything</span><span className="approach-tag tag-two"><Target />Your goals</span><span className="approach-tag tag-three"><Sparkles />Little wins</span></div></Reveal>
            <div className="approach-copy"><span className="eyebrow"><span className="eyebrow-dot" /> The Wisey way</span><h2 className="section-heading" style={{ display: "block", margin: "15px 0 10px" }}>Make learning feel like <em>yours.</em></h2><p>Some learners want a fresh explanation. Others need a steady routine or room to try something harder. We start by listening.</p>
              <div className="steps-list">
                <div className="step-row"><span className="step-index">01</span><div><h3>Get to know the learner</h3><p>Share what feels easy, what feels difficult, and what you’d like to change.</p></div></div>
                <div className="step-row"><span className="step-index">02</span><div><h3>Find a thoughtful match</h3><p>We’ll talk through tutor fit, schedule, subject, and learning format.</p></div></div>
                <div className="step-row"><span className="step-index">03</span><div><h3>Build momentum together</h3><p>Start with a clear next step, then grow the plan as the learner grows.</p></div></div>
              </div>
              <Link className="link-arrow" href="#contact">Let’s find a good fit <ArrowRight /></Link>
            </div>
          </div>
        </section>

        <section className="match-section" id="match">
          <div className="wrap"><div className="match-panel">
            <div className="match-copy"><span className="eyebrow"><span className="eyebrow-dot" /> Warm people. Clear explanations.</span><h2>A good tutor helps the learner feel <em>seen.</em></h2><p>Patient listeners. Clear explainers. People who make it easier to ask the question you’ve been holding onto. Tell us what your learner needs and we’ll talk through the next step.</p><Link className="button" href="#contact">Meet your match <ArrowRight /></Link></div>
            <div className="match-points"><div className="match-point"><span><HeartHandshake /></span><div><strong>A supportive space</strong><small>Questions are always welcome here.</small></div></div><div className="match-point"><span><BookOpen /></span><div><strong>Clear, subject-focused help</strong><small>Make sense of the ideas that matter.</small></div></div><div className="match-point"><span><Sparkles /></span><div><strong>Room to grow</strong><small>Build confidence one step at a time.</small></div></div></div>
          </div></div>
        </section>

        <section className="section" id="faq"><div className="wrap faq-grid">
          <div className="faq-intro"><span className="eyebrow"><span className="eyebrow-dot" /> Good to know</span><h2 className="section-heading" style={{ display: "block", margin: "15px 0" }}>A few things you might <em>wonder.</em></h2><p>Have another question? Send it with your request. We’ll be happy to talk it through.</p><Link className="link-arrow" href="#contact">Ask us directly <ArrowRight /></Link></div>
          <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </div></section>

        <section className="section contact-section" id="contact"><div className="wrap contact-grid">
          <div className="contact-intro"><span className="eyebrow"><span className="eyebrow-dot" /> Your next chapter starts here</span><h2>Tell us what you’re <em>working toward.</em></h2><p>Share a little about the learner and what would help. The Wisey team will follow up to discuss subject fit, availability, format, and pricing.</p><p>Submitting this form starts a conversation. It doesn’t confirm a booked session.</p></div>
          <InquiryForm />
        </div></section>
      </main>
      <footer className="site-footer"><div className="wrap"><div className="footer-main"><div><span className="brand"><span className="brand-mark">w</span><span className="brand-name">Wisey<small>TUTORS</small></span></span><p>Learning that feels like it belongs to you.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link href="#subjects">Subjects</Link><Link href="#approach">How it works</Link><Link href="#faq">FAQs</Link><Link href="#contact">Contact</Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Wisey Tutors. Made for curious minds.</span><Link className="admin-link" href="/admin/login">Staff sign in</Link></div></div></footer>
    </>
  );
}

