"use client";

import LandingNav from "./LandingNav";
import HeroSection from "./HeroSection";
// CountdownBanner removed Sprint 2B — fake-urgency styling killed per
// .claude/skills/lingona-design/09-anti-patterns/ai-generated-smell.md#2.
// Real launch date 09/07/2026 surfaces inline in Hero trust line + post-launch
// in Pricing waitlist context (Sprint 2D).
import SocialProofBar from "./SocialProofBar";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import PricingSection from "./PricingSection";
// TestimonialsSection hidden until real user reviews exist (no fake testimonials per
// 09-anti-patterns/fake-stats-ban.md).
// import TestimonialsSection from "./TestimonialsSection";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

/**
 * Landing page wrapper — Wave 6 Sprint 2B.
 *
 * Wrapper neutralized (no forced dark bg/text). Each section provides its own
 * surface. Hero now renders bg-cream (brand mode canonical) per Sprint 2B.
 * SocialProofBar / Features / HowItWorks / Pricing / FinalCTA / Footer / Nav
 * still render legacy dark surfaces and will be rebuilt in Sprint 2C/2D/2E.
 *
 * Visual mismatch (cream Hero ↑↑ dark remaining sections) is acknowledged as
 * intentional incremental-redesign cost during Sprint 2B → 2E transition.
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh" style={{ scrollBehavior: "smooth" }}>
      <LandingNav />
      <HeroSection />
      <SocialProofBar />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      {/* <TestimonialsSection /> — hidden until real user reviews */}
      <FinalCTA />
      <Footer />
    </div>
  );
}
