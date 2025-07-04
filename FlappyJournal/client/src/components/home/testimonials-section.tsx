import React from "react";
import { Container } from "@/components/ui/container";

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background dark:bg-muted">
      <Container>
        <h2 className="font-heading text-3xl text-foreground text-center mb-12">
          Testimonials
        </h2>
        <div className="space-y-8 max-w-3xl mx-auto">
          <blockquote className="text-muted-foreground italic border-l-4 border-accent pl-4">
            “Flappy changed the way I journal—insights feel like they're written by a friend.”
          </blockquote>
          <cite className="block text-accent font-semibold">— Alex Doe</cite>
        </div>
      </Container>
    </section>
  );
}