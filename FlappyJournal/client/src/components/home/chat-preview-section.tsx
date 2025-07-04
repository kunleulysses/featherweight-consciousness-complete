import React from "react";
import { Container } from "@/components/ui/container";

export function ChatPreviewSection() {
  return (
    <section className="py-24 bg-background dark:bg-muted">
      <Container className="text-center">
        <h2 className="font-heading text-3xl text-foreground mb-8">Sentient Chat</h2>
        <div className="bg-card dark:bg-popover rounded-lg p-8 max-w-2xl mx-auto space-y-4">
          <p>
            <span className="text-accent font-semibold">Flappy:</span>{' '}
            <span className="text-foreground">How are you feeling today?</span>
          </p>
          <p>
            <span className="text-accent font-semibold">You:</span>{' '}
            <span className="text-foreground">Reflective and hopeful.</span>
          </p>
        </div>
      </Container>
    </section>
  );
}