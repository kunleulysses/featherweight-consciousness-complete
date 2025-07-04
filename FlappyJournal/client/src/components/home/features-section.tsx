import React from "react";
import { Container } from "@/components/ui/container";
import { Database, GitBranch, FileText, Zap } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Deep Memory",
    description: "Your journal is stored securely and contextually.",
  },
  {
    icon: GitBranch,
    title: "Adaptive Insights",
    description: "AI evolves with your growth and patterns.",
  },
  {
    icon: Zap,
    title: "Instant Assistance",
    description: "Ask questions and get guidance in real-time.",
  },
  {
    icon: FileText,
    title: "Seamless Export",
    description: "Export your data whenever you need it.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background dark:bg-muted">
      <Container>
        <h2 className="text-center font-heading text-3xl text-foreground mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center space-y-4 p-6 bg-card rounded-lg shadow"
            >
              <div className="p-3 bg-popover rounded-full inline-block">
                <Icon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl text-foreground">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}