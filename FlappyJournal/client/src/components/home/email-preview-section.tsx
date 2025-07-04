import React from "react";
import { Container } from "@/components/ui/container";

export function EmailPreviewSection() {
  return (
    <section className="py-24 bg-background dark:bg-muted">
      <Container>
        <h2 className="font-heading text-3xl text-foreground text-center mb-8">
          Daily Inspiration via Email
        </h2>
        <div className="bg-card dark:bg-popover p-6 rounded-lg max-w-lg mx-auto">
          <p className="text-muted-foreground font-medium">
            Subject: ✨ Today’s Cosmic Reflection
          </p>
          <hr className="border-border my-4" />
          <p className="text-foreground">
            Good morning! Today the stars whisper about the infinite potential within you...
          </p>
        </div>
      </Container>
    </section>
  );
}