"use client";

import LandingNav from "./LandingNav";
import HeroSection from "./HeroSection";
import CountdownBanner from "./CountdownBanner";
import SocialProofBar from "./SocialProofBar";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import PricingSection from "./PricingSection";
import TestimonialsSection from "./TestimonialsSection";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div
      className="min-h-dvh text-white"
      style={{
        backgroundColor: "#0A0F1E",
        scrollBehavior: "smooth",
      }}
    >
      <LandingNav />
      <HeroSection />
      <CountdownBanner />
      <SocialProofBar />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
