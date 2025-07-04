import React from "react";
import { Container } from "@/components/ui/container";

export function CTASection() {
  return (
    <section className="py-24 bg-background dark:bg-muted">
      <Container className="text-center">
        <h2 className="font-heading text-3xl text-offwhite mb-6">
          Ready to dive into the mystery?
        </h2>
        <a
          href="#"
          className="inline-block px-8 py-4 bg-accent text-accent-foreground rounded-full text-xl font-semibold hover:bg-accent/90 transition"
        >
          Begin Your Journey
        </a>
      </Container>
    </section>
  );
}