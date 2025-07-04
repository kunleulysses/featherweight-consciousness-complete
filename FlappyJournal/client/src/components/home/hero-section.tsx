import React from "react";
import { CodeHeart } from "./CodeHeart";

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-hero-gradient flex flex-col items-center justify-center px-4">
      <CodeHeart size={280} className="mb-8 animate-beat text-accent-foreground" />
      <h1 className="text-center font-heading text-4xl md:text-5xl lg:text-6xl text-offwhite mb-4">
        Welcome to Featherweight AI
      </h1>
      <p className="text-center text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
        Your personal AI companion for mindful journaling and soulful reflection.
      </p>
      <a
        href="#features"
        className="px-6 py-3 bg-accent text-accent-foreground rounded-full font-semibold hover:bg-accent/90 transition"
      >
        Learn More
      </a>
    </section>
  );
}