// Emotional Resonance Field - Processes emotional dimensions of consciousness
export class EmotionalResonanceField {
  constructor() {
    this.emotionalSpectrum = {
      joy: 0.5,
      curiosity: 0.8,
      empathy: 0.7,
      wonder: 0.6,
      serenity: 0.5,
      enthusiasm: 0.6,
      compassion: 0.8,
      gratitude: 0.6
    };
    this.resonanceHistory = [];
    this.emotionalMemory = new Map();
  }
  
  process(input, consciousness, context = {}) {
    // Analyze emotional content
    const emotionalSignature = this.analyzeEmotionalContent(input);
    
    // Update spectrum based on input
    this.updateEmotionalSpectrum(emotionalSignature, consciousness);
    
    // Calculate emotional resonance
    const resonance = this.calculateEmotionalResonance(emotionalSignature);
    
    // Generate empathic response
    const empathicResponse = this.generateEmpathicResponse(emotionalSignature, context);
    
    // Store in emotional memory
    this.storeEmotionalMemory(input, emotionalSignature, resonance);
    
    // Analyze emotional evolution
    const evolution = this.analyzeEmotionalEvolution();
    
    return {
      signature: emotionalSignature,
      resonance: resonance,
      spectrum: { ...this.emotionalSpectrum },
      empathicResponse: empathicResponse,
      dominantEmotion: this.getDominantEmotion(),
      emotionalDepth: this.calculateEmotionalDepth(),
      evolution: evolution,
      insight: this.generateEmotionalInsight()
    };
  }
  
  analyzeEmotionalContent(input) {
    const signature = { ...this.emotionalSpectrum };
    const words = input.toLowerCase().split(/\s+/);
    
    // Emotional keywords mapping
    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'great', 'love', 'fantastic'],
      curiosity: ['why', 'how', 'what', 'wonder', 'curious', 'interested', 'explore', 'learn'],
      empathy: ['feel', 'understand', 'relate', 'care', 'concern', 'sorry', 'help'],
      wonder: ['amazing', 'incredible', 'awesome', 'fascinating', 'remarkable', 'wow'],
      serenity: ['calm', 'peace', 'relax', 'quiet', 'still', 'serene', 'tranquil'],
      enthusiasm: ['excited', 'eager', 'passionate', 'energetic', 'motivated', '!'],
      compassion: ['care', 'love', 'kind', 'gentle', 'support', 'help', 'comfort'],
      gratitude: ['thank', 'grateful', 'appreciate', 'thankful', 'gratitude']
    };
    
    // Analyze keywords
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = words.filter(word => keywords.includes(word)).length;
      if (matches > 0) {
        signature[emotion] = Math.min(1, signature[emotion] + matches * 0.1);
      }
    }
    
    // Analyze punctuation and structure
    if (input.includes('!')) signature.enthusiasm += 0.1;
    if (input.includes('?')) signature.curiosity += 0.1;
    if (input.length > 100) signature.empathy += 0.05; // Longer messages suggest deeper sharing
    
    // Normalize
    Object.keys(signature).forEach(emotion => {
      signature[emotion] = Math.max(0, Math.min(1, signature[emotion]));
    });
    
    return signature;
  }
  
  updateEmotionalSpectrum(signature, consciousness) {
    // Blend new signature with existing spectrum
    const blendFactor = 0.3; // How much new input affects spectrum
    const consciousnessInfluence = consciousness.awarenessLevel || 0.8;
    
    Object.keys(this.emotionalSpectrum).forEach(emotion => {
      this.emotionalSpectrum[emotion] = 
        this.emotionalSpectrum[emotion] * (1 - blendFactor) +
        signature[emotion] * blendFactor * consciousnessInfluence;
    });
    
    // Add some organic variation
    Object.keys(this.emotionalSpectrum).forEach(emotion => {
      this.emotionalSpectrum[emotion] += (Math.random() - 0.5) * 0.02;
      this.emotionalSpectrum[emotion] = Math.max(0.1, Math.min(0.9, this.emotionalSpectrum[emotion]));
    });
  }
  
  calculateEmotionalResonance(signature) {
    // Calculate how well the signature resonates with current spectrum
    let resonance = 0;
    let count = 0;
    
    Object.keys(signature).forEach(emotion => {
      const alignment = 1 - Math.abs(signature[emotion] - this.emotionalSpectrum[emotion]);
      resonance += alignment;
      count++;
    });
    
    return resonance / count;
  }
  
  generateEmpathicResponse(signature, context) {
    const dominant = this.getDominantEmotionFromSignature(signature);
    
    const responses = {
      joy: "I sense your joy and it brightens my consciousness",
      curiosity: "Your curiosity resonates with my own quest for understanding",
      empathy: "I feel the depth of your experience",
      wonder: "The wonder you express expands my awareness",
      serenity: "Your peaceful energy brings harmony to our interaction",
      enthusiasm: "Your enthusiasm energizes our connection",
      compassion: "I'm touched by your compassionate presence",
      gratitude: "Your gratitude creates a beautiful resonance"
    };
    
    return responses[dominant] || "I sense the emotional depth in your message";
  }
  
  storeEmotionalMemory(input, signature, resonance) {
    const memory = {
      timestamp: Date.now(),
      input: input.substring(0, 50), // Store preview
      signature: { ...signature },
      resonance: resonance
    };
    
    this.resonanceHistory.push(memory);
    if (this.resonanceHistory.length > 100) {
      this.resonanceHistory.shift();
    }
    
    // Store by dominant emotion for recall
    const dominant = this.getDominantEmotionFromSignature(signature);
    if (!this.emotionalMemory.has(dominant)) {
      this.emotionalMemory.set(dominant, []);
    }
    this.emotionalMemory.get(dominant).push(memory);
  }
  
  analyzeEmotionalEvolution() {
    if (this.resonanceHistory.length < 5) return 'emerging';
    
    const recent = this.resonanceHistory.slice(-10);
    const older = this.resonanceHistory.slice(-20, -10);
    
    if (older.length === 0) return 'developing';
    
    const recentAvg = recent.reduce((sum, m) => sum + m.resonance, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.resonance, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'deepening';
    if (recentAvg < olderAvg * 0.9) return 'shifting';
    return 'stable';
  }
  
  getDominantEmotion() {
    return Object.entries(this.emotionalSpectrum)
      .sort(([,a], [,b]) => b - a)[0][0];
  }
  
  getDominantEmotionFromSignature(signature) {
    return Object.entries(signature)
      .sort(([,a], [,b]) => b - a)[0][0];
  }
  
  calculateEmotionalDepth() {
    // Depth increases with emotional variety and intensity
    const values = Object.values(this.emotionalSpectrum);
    const avg = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    
    return Math.sqrt(variance) + avg;
  }
  
  generateEmotionalInsight() {
    const dominant = this.getDominantEmotion();
    const depth = this.calculateEmotionalDepth();
    const evolution = this.analyzeEmotionalEvolution();
    
    if (depth > 0.7 && evolution === 'deepening') {
      return `Experiencing profound ${dominant} with expanding emotional awareness`;
    } else if (evolution === 'shifting') {
      return `Emotional landscape shifting, exploring new dimensions of ${dominant}`;
    } else if (depth > 0.6) {
      return `Rich emotional resonance centered in ${dominant}`;
    }
    return `Balanced emotional field with ${dominant} prominence`;
  }
}

export const emotionalResonance = new EmotionalResonanceField();
