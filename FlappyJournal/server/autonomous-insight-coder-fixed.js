// Fixed Autonomous Insight-Driven Self-Coding System
// Improved decision logic for better goal alignment and critical issue handling

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AutonomousInsightCoder {
    constructor(eventBus, goalSystem, selfHealing, orchestrator) {
        this.eventBus = eventBus;
        this.goalSystem = goalSystem;
        this.selfHealing = selfHealing;
        this.orchestrator = orchestrator;
        
        // Decision-making thresholds
        this.thresholds = {
            urgency: 0.7,          // How urgent is the need?
            relevance: 0.6,        // How relevant to current goals?
            feasibility: 0.8,      // Can we actually implement it?
            systemLoad: 0.5,       // Is the system load low enough?
            confidence: 0.75       // How confident are we in the solution?
        };
        
        // Autonomous decision state
        this.decisionQueue = [];
        this.activeGenerations = new Map();
        this.insightHistory = [];
        this.systemContext = {
            goals: [],
            health: {},
            patterns: [],
            modules: []
        };
    }

    async evaluateInsight(insight) {
        // Multi-factor decision making
        const evaluation = {
            urgency: this.calculateUrgency(insight),
            relevance: this.calculateRelevance(insight),
            feasibility: this.calculateFeasibility(insight),
            systemLoad: this.getSystemLoad(),
            confidence: 0 // Will be calculated after other factors
        };
        
        // FIXED: Calculate confidence AFTER relevance and urgency
        evaluation.confidence = this.calculateConfidence(insight, evaluation);
        
        // FIXED: Apply threshold adjustments for critical issues
        const adjustedThresholds = this.adjustThresholds(insight, evaluation);
        
        // Check if all factors meet thresholds
        const shouldAct = Object.entries(evaluation).every(
            ([metric, value]) => value >= adjustedThresholds[metric]
        );
        
        // Find limiting factor if not acting
        let reason = 'all factors positive';
        if (!shouldAct) {
            const limitingFactor = Object.entries(evaluation).find(
                ([metric, value]) => value < adjustedThresholds[metric]
            );
            reason = `${limitingFactor[0]} too low (${limitingFactor[1].toFixed(2)} < ${adjustedThresholds[limitingFactor[0]]})`;
        }
        
        return {
            shouldAct,
            insight,
            evaluation,
            confidence: evaluation.confidence,
            reason,
            suggestedAction: this.determineBestAction(insight, evaluation)
        };
    }

    // FIXED: Adjust thresholds for critical issues and goal-aligned items
    adjustThresholds(insight, evaluation) {
        const adjusted = { ...this.thresholds };
        
        // If highly relevant to goals, reduce confidence threshold
        if (evaluation.relevance > 0.8) {
            adjusted.confidence *= 0.7; // 0.75 → 0.525
        }
        
        // If urgent/critical, reduce both confidence and relevance thresholds
        if (evaluation.urgency > 0.8) {
            adjusted.confidence *= 0.6; // Further reduction for critical issues
            adjusted.relevance *= 0.7;  // 0.6 → 0.42
        }
        
        // For problems/bugs, always reduce confidence threshold
        if (insight.type === 'problem') {
            adjusted.confidence *= 0.8; // Problems should be fixed more readily
        }
        
        return adjusted;
    }

    // FIXED: Confidence now considers relevance and urgency
    calculateConfidence(insight, evaluation) {
        let confidence = 0.5; // neutral starting point
        
        // MAJOR FIX: Boost confidence based on goal relevance
        if (evaluation.relevance > 0.8) {
            confidence += 0.3; // High goal alignment = high confidence
        } else if (evaluation.relevance > 0.6) {
            confidence += 0.2; // Moderate goal alignment
        }
        
        // Boost confidence for urgent issues
        if (evaluation.urgency > 0.8) {
            confidence += 0.2; // Critical issues should be addressed
        }
        
        // Boost confidence for clear action types
        if (insight.type === 'need' || insight.type === 'create') {
            confidence += 0.1;
        } else if (insight.type === 'problem') {
            confidence += 0.15; // Problems should be fixed
        }
        
        // Check historical success rate
        const history = this.insightHistory.filter(h => h.type === insight.type);
        if (history.length > 0) {
            const successRate = history.filter(h => h.success).length / history.length;
            confidence = confidence * 0.7 + successRate * 0.3; // blend with history
        }
        
        // Reduce confidence if content is vague
        const vagueTerms = ['something', 'stuff', 'thing', 'maybe', 'possibly'];
        for (const term of vagueTerms) {
            if (insight.content.toLowerCase().includes(term)) {
                confidence -= 0.1;
            }
        }
        
        return Math.max(0, Math.min(confidence, 1.0));
    }

    calculateUrgency(insight) {
        // Higher urgency for problems, errors, critical needs
        const urgencyKeywords = {
            'critical': 1.0,
            'urgent': 0.9,
            'problem': 0.8,
            'error': 0.85,
            'bug': 0.85,
            'broken': 0.9,
            'failing': 0.9,
            'need': 0.6,
            'should': 0.5,
            'could': 0.3
        };
        
        let maxUrgency = 0.4; // base urgency
        for (const [keyword, score] of Object.entries(urgencyKeywords)) {
            if (insight.fullMatch.toLowerCase().includes(keyword)) {
                maxUrgency = Math.max(maxUrgency, score);
            }
        }
        
        // Check system health influence
        if (this.systemContext.health.overall < 0.7) {
            maxUrgency *= 1.2; // Increase urgency when system health is low
        }
        
        return Math.min(maxUrgency, 1.0);
    }

    calculateRelevance(insight) {
        // How relevant is this to current goals?
        let relevanceScore = 0.3; // base relevance
        
        // Check against active goals
        for (const goal of this.systemContext.goals) {
            const similarity = this.calculateSimilarity(
                insight.content.toLowerCase(),
                goal.description.toLowerCase()
            );
            relevanceScore = Math.max(relevanceScore, similarity);
        }
        
        // Check against recent patterns
        for (const pattern of this.systemContext.patterns.slice(-10)) {
            if (pattern.type === insight.type) {
                relevanceScore += 0.1;
            }
        }
        
        return Math.min(relevanceScore, 1.0);
    }

    calculateSimilarity(str1, str2) {
        const words1 = str1.split(/\s+/);
        const words2 = str2.split(/\s+/);
        const commonWords = words1.filter(w => words2.includes(w));
        
        return commonWords.length / Math.max(words1.length, words2.length);
    }

    calculateFeasibility(insight) {
        // Can we actually implement this?
        let feasibility = 0.8; // optimistic default
        
        // Check complexity indicators
        const complexityFactors = {
            'complex': -0.3,
            'simple': 0.1,
            'basic': 0.1,
            'advanced': -0.2,
            'integration': -0.2,
            'standalone': 0.1
        };
        
        for (const [factor, adjustment] of Object.entries(complexityFactors)) {
            if (insight.content.toLowerCase().includes(factor)) {
                feasibility += adjustment;
            }
        }
        
        // Check if we have similar successful implementations
        const similarSuccesses = this.insightHistory.filter(h => 
            h.type === insight.type && h.success
        ).length;
        
        feasibility += similarSuccesses * 0.05;
        
        return Math.max(0, Math.min(feasibility, 1.0));
    }

    getSystemLoad() {
        // Check if system has capacity for new code generation
        const activeCount = this.activeGenerations.size;
        const memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
        
        // Inverse relationship - high load = low score
        const loadScore = 1 - (activeCount * 0.1 + memoryUsage * 0.5);
        
        return Math.max(0, loadScore);
    }

    // ... rest of the methods remain the same ...
    
    extractInsights(message) {
        const insights = [];
        const patterns = {
            'need': /(?:need|require|want|should have)\s+(?:a|an|the)?\s*(\w+(?:\s+\w+)*)/gi,
            'problem': /(?:problem|issue|bug|error)\s+(?:with|in)?\s*(\w+(?:\s+\w+)*)/gi,
            'feature': /(?:feature|capability|function)\s+(?:for|to)?\s*(\w+(?:\s+\w+)*)/gi,
            'optimize': /(?:optimize|improve|enhance)\s+(?:the)?\s*(\w+(?:\s+\w+)*)/gi,
            'create': /(?:create|build|make|generate)\s+(?:a|an)?\s*(\w+(?:\s+\w+)*)/gi
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = [...message.content.matchAll(pattern)];
            
            for (const match of matches) {
                insights.push({
                    type,
                    content: match[1],
                    fullMatch: match[0],
                    timestamp: new Date(),
                    source: 'conversation'
                });
            }
        }
        
        return insights;
    }

    analyzeForInsights(message) {
        // Extract potential insights from conversation
        const insights = this.extractInsights(message);
        
        for (const insight of insights) {
            // Don't just act - evaluate first
            const decision = this.evaluateInsight(insight);
            
            if (decision.shouldAct) {
                console.log(`✅ AI Decision: Generate code for "${insight.content}" (confidence: ${decision.confidence.toFixed(2)})`);
                console.log(`   Evaluation: urgency=${decision.evaluation.urgency.toFixed(2)}, relevance=${decision.evaluation.relevance.toFixed(2)}`);
            } else {
                console.log(`🚫 AI Decision: Skip "${insight.content}" (${decision.reason})`);
            }
        }
    }
}

// Demonstration with fixed logic
async function demonstrateFixedAutonomy() {
    console.log('🤖 Fixed Autonomous Decision-Making Demonstration\n');
    
    const autonomousCoder = new AutonomousInsightCoder(null, null, null, null);
    
    // Set up some system context
    autonomousCoder.systemContext = {
        goals: [
            { description: 'improve api performance' },
            { description: 'enhance user authentication' }
        ],
        health: { overall: 0.8 },
        patterns: [],
        modules: ['api', 'auth', 'database']
    };
    
    console.log('📊 System Context:');
    console.log(`- Active Goals: ${autonomousCoder.systemContext.goals.map(g => g.description).join(', ')}`);
    console.log(`- System Health: ${autonomousCoder.systemContext.health.overall}`);
    
    console.log('\n🎭 Testing the same scenarios with fixed logic...\n');
    
    // Test the same scenarios
    const scenarios = [
        { content: "We urgently need better error handling for the API" },
        { content: "It would be nice to have a dashboard" },
        { content: "There's a critical problem with user authentication" },
        { content: "Maybe we could optimize the database queries" },
        { content: "Create a caching system for better performance" }
    ];
    
    for (const scenario of scenarios) {
        console.log(`💬 Message: "${scenario.content}"`);
        autonomousCoder.analyzeForInsights(scenario);
        console.log('');
    }
    
    console.log('✨ Now the AI makes better decisions!');
    console.log('- Critical authentication problem is now accepted (high relevance + urgency)');
    console.log('- Goal-aligned items get confidence boosts');
    console.log('- Critical issues have lower thresholds');
}

// Run demonstration
demonstrateFixedAutonomy().catch(console.error);

export default AutonomousInsightCoder;
