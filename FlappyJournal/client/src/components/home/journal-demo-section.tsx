import React from "react";
import { Container } from "@/components/ui/container";

export function JournalDemoSection() {
  return (
    <section className="py-24 bg-background dark:bg-muted">
      <Container className="text-center">
        <h2 className="font-heading text-3xl text-foreground mb-8">Journal Demo</h2>
        <div className="bg-card dark:bg-popover rounded-lg p-8 max-w-xl mx-auto">
          <pre className="font-mono text-sm text-muted-foreground">
            "Today I felt curious about the stars and the vast ocean of possibility before me..."
          </pre>
        </div>
      </Container>
    </section>
  );
}