// Complete demonstration of fixed autonomous decision-making

class AutonomousInsightCoder {
    constructor() {
        this.thresholds = {
            urgency: 0.7,
            relevance: 0.6,
            feasibility: 0.8,
            systemLoad: 0.5,
            confidence: 0.75
        };
        
        this.systemContext = {
            goals: [],
            health: { overall: 1.0 },
            patterns: [],
            modules: []
        };
        
        this.insightHistory = [];
        this.activeGenerations = new Map();
    }

    evaluateInsight(insight) {
        const evaluation = {
            urgency: this.calculateUrgency(insight),
            relevance: this.calculateRelevance(insight),
            feasibility: this.calculateFeasibility(insight),
            systemLoad: this.getSystemLoad(),
            confidence: 0
        };
        
        evaluation.confidence = this.calculateConfidence(insight, evaluation);
        const adjustedThresholds = this.adjustThresholds(insight, evaluation);
        
        const shouldAct = Object.entries(evaluation).every(
            ([metric, value]) => value >= adjustedThresholds[metric]
        );
        
        let reason = 'all factors positive';
        if (!shouldAct) {
            const limitingFactor = Object.entries(evaluation).find(
                ([metric, value]) => value < adjustedThresholds[metric]
            );
            if (limitingFactor) {
                reason = `${limitingFactor[0]} too low (${limitingFactor[1].toFixed(2)} < ${adjustedThresholds[limitingFactor[0]].toFixed(2)})`;
            }
        }
        
        return {
            shouldAct,
            insight,
            evaluation,
            confidence: evaluation.confidence,
            reason,
            adjustedThresholds
        };
    }

    adjustThresholds(insight, evaluation) {
        const adjusted = { ...this.thresholds };
        
        if (evaluation.relevance > 0.8) {
            adjusted.confidence *= 0.7;
        }
        
        if (evaluation.urgency > 0.8) {
            adjusted.confidence *= 0.6;
            adjusted.relevance *= 0.7;
        }
        
        if (insight.type === 'problem') {
            adjusted.confidence *= 0.8;
        }
        
        return adjusted;
    }

    calculateConfidence(insight, evaluation) {
        let confidence = 0.5;
        
        if (evaluation.relevance > 0.8) {
            confidence += 0.3;
        } else if (evaluation.relevance > 0.6) {
            confidence += 0.2;
        }
        
        if (evaluation.urgency > 0.8) {
            confidence += 0.2;
        }
        
        if (insight.type === 'need' || insight.type === 'create') {
            confidence += 0.1;
        } else if (insight.type === 'problem') {
            confidence += 0.15;
        }
        
        return Math.min(confidence, 1.0);
    }

    calculateUrgency(insight) {
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
        
        let maxUrgency = 0.4;
        for (const [keyword, score] of Object.entries(urgencyKeywords)) {
            if (insight.fullMatch.toLowerCase().includes(keyword)) {
                maxUrgency = Math.max(maxUrgency, score);
            }
        }
        
        return Math.min(maxUrgency, 1.0);
    }

    calculateRelevance(insight) {
        let relevanceScore = 0.3;
        
        for (const goal of this.systemContext.goals) {
            const similarity = this.calculateSimilarity(
                insight.content.toLowerCase(),
                goal.description.toLowerCase()
            );
            relevanceScore = Math.max(relevanceScore, similarity);
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
        let feasibility = 0.8;
        
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
        
        return Math.max(0, Math.min(feasibility, 1.0));
    }

    getSystemLoad() {
        const activeCount = this.activeGenerations.size;
        const loadScore = 1 - (activeCount * 0.1);
        return Math.max(0, loadScore);
    }

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
            const matches = [...message.matchAll(pattern)];
            
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
        const insights = this.extractInsights(message);
        
        for (const insight of insights) {
            const decision = this.evaluateInsight(insight);
            
            console.log(`\n📊 Analyzing: "${insight.content}" (type: ${insight.type})`);
            console.log(`   Urgency: ${decision.evaluation.urgency.toFixed(2)} (threshold: ${decision.adjustedThresholds.urgency.toFixed(2)})`);
            console.log(`   Relevance: ${decision.evaluation.relevance.toFixed(2)} (threshold: ${decision.adjustedThresholds.relevance.toFixed(2)})`);
            console.log(`   Confidence: ${decision.evaluation.confidence.toFixed(2)} (threshold: ${decision.adjustedThresholds.confidence.toFixed(2)})`);
            
            if (decision.shouldAct) {
                console.log(`   ✅ Decision: APPROVED for code generation`);
            } else {
                console.log(`   ❌ Decision: REJECTED (${decision.reason})`);
            }
        }
    }
}

// Demonstration
console.log('🤖 Fixed Autonomous Decision-Making Demonstration\n');

const coder = new AutonomousInsightCoder();
coder.systemContext = {
    goals: [
        { description: 'improve api performance' },
        { description: 'enhance user authentication' }
    ],
    health: { overall: 0.8 },
    patterns: [],
    modules: ['api', 'auth', 'database']
};

console.log('📋 System Goals:');
coder.systemContext.goals.forEach(g => console.log(`   - ${g.description}`));

console.log('\n🧪 Testing Scenarios:');

const scenarios = [
    "We urgently need better error handling for the API",
    "There's a critical problem with user authentication",
    "Maybe we could optimize the database queries",
    "Create a caching system for better performance"
];

scenarios.forEach(scenario => {
    console.log(`\n💬 "${scenario}"`);
    coder.analyzeForInsights(scenario);
});

console.log('\n\n🎯 Summary:');
console.log('The fixed logic now properly:');
console.log('- ✅ Approves critical authentication issues (matches goal + high urgency)');
console.log('- ✅ Considers goal alignment in confidence calculations');
console.log('- ✅ Adjusts thresholds for critical issues');
console.log('- ✅ Distinguishes between problems (lower threshold) and features');
