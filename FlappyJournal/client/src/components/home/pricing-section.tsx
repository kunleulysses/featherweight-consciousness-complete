import React from "react";
import { Container } from "@/components/ui/container";

export function PricingSection() {
  return (
    <section className="py-24 bg-background dark:bg-muted">
      <Container>
        <h2 className="font-heading text-3xl text-foreground text-center mb-12">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card dark:bg-popover border border-border rounded-lg p-8 space-y-4 text-center shadow">
            <h3 className="font-heading text-xl text-foreground">Free</h3>
            <p className="text-muted-foreground">Basic journaling features</p>
            <p className="font-heading text-4xl text-foreground">$0</p>
            <button className="mt-4 px-6 py-2 bg-accent text-accent-foreground rounded-full font-semibold hover:bg-accent/90 transition">
              Get Started
            </button>
          </div>
          <div className="bg-card dark:bg-popover border border-border rounded-lg p-8 space-y-4 text-center shadow-lg">
            <h3 className="font-heading text-xl text-foreground">Premium</h3>
            <p className="text-muted-foreground">Full AI-driven insights</p>
            <p className="font-heading text-4xl text-foreground">
              $9<span className="text-sm text-muted-foreground">/mo</span>
            </p>
            <button className="mt-4 px-6 py-2 bg-accent text-accent-foreground rounded-full font-semibold hover:bg-accent/90 transition">
              Upgrade Now
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}