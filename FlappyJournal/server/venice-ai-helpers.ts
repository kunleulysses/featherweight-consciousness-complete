import {
  EnhancedFlappyPersonality,
  ConversationContext,
  ENHANCED_FLAPPY_PERSONALITY,
} from './enhanced-flappy-personality';
import { ConversationMemory } from '@shared/schema';

// Type imports for the helper functions
type FlappyContentType =
  | 'dailyInspiration'
  | 'journalResponse'
  | 'weeklyInsight'
  | 'emailConversation'
  | 'chatConversation';

interface EnhancedContext {
  conversationHistory?: any[];
  userMemories?: ConversationMemory[];
  shouldGenerateReflectionPrompt?: boolean;
}

/**
 * Analyze conversation context to determine appropriate personality adaptation
 */
export function analyzeConversationContext(
  content: string,
  contentType: FlappyContentType,
  userInfo?: any
): ConversationContext {
  const context: ConversationContext = {
    isFirstInteraction: userInfo?.isFirstMessage || false,
  };

  // Analyze emotional state from content
  const lowerContent = content.toLowerCase();

  if (
    lowerContent.includes('stress') ||
    lowerContent.includes('overwhelm') ||
    lowerContent.includes('pressure')
  ) {
    context.userEmotionalState = 'stressed';
  } else if (
    lowerContent.includes('sad') ||
    lowerContent.includes('down') ||
    lowerContent.includes('depressed')
  ) {
    context.userEmotionalState = 'sad';
  } else if (
    lowerContent.includes('anxious') ||
    lowerContent.includes('worried') ||
    lowerContent.includes('nervous')
  ) {
    context.userEmotionalState = 'anxious';
  } else if (
    lowerContent.includes('happy') ||
    lowerContent.includes('excited') ||
    lowerContent.includes('great')
  ) {
    context.userEmotionalState = 'excited';
  } else if (
    lowerContent.includes('grateful') ||
    lowerContent.includes('thankful') ||
    lowerContent.includes('blessed')
  ) {
    context.userEmotionalState = 'positive';
  } else {
    context.userEmotionalState = 'neutral';
  }

  // Analyze communication style
  if (content.length < 50) {
    context.userCommunicationStyle = 'brief';
  } else if (content.length > 200) {
    context.userCommunicationStyle = 'detailed';
  } else {
    context.userCommunicationStyle = 'balanced';
  }

  // Check for emotional language
  const emotionalWords = [
    'feel',
    'feeling',
    'emotion',
    'heart',
    'soul',
    'love',
    'hate',
    'fear',
  ];
  if (emotionalWords.some((word) => lowerContent.includes(word))) {
    context.userCommunicationStyle = 'emotional';
  }

  // Check for analytical language
  const analyticalWords = [
    'analyze',
    'think',
    'consider',
    'evaluate',
    'assess',
    'plan',
    'strategy',
  ];
  if (analyticalWords.some((word) => lowerContent.includes(word))) {
    context.userCommunicationStyle = 'analytical';
  }

  // Determine conversation tone
  if (contentType === 'dailyInspiration') {
    context.conversationTone = 'playful';
  } else if (
    context.userEmotionalState === 'sad' ||
    context.userEmotionalState === 'anxious'
  ) {
    context.conversationTone = 'serious';
  } else if (
    context.userEmotionalState === 'excited' ||
    context.userEmotionalState === 'positive'
  ) {
    context.conversationTone = 'playful';
  } else {
    context.conversationTone = 'casual';
  }

  // Determine topic category
  if (
    lowerContent.includes('work') ||
    lowerContent.includes('job') ||
    lowerContent.includes('career')
  ) {
    context.topicCategory = 'work';
  } else if (
    lowerContent.includes('relationship') ||
    lowerContent.includes('friend') ||
    lowerContent.includes('family')
  ) {
    context.topicCategory = 'relationships';
  } else if (
    lowerContent.includes('health') ||
    lowerContent.includes('exercise') ||
    lowerContent.includes('sleep')
  ) {
    context.topicCategory = 'health';
  } else if (
    lowerContent.includes('creative') ||
    lowerContent.includes('art') ||
    lowerContent.includes('music')
  ) {
    context.topicCategory = 'creativity';
  } else if (
    lowerContent.includes('goal') ||
    lowerContent.includes('growth') ||
    lowerContent.includes('improve')
  ) {
    context.topicCategory = 'personal-growth';
  } else {
    context.topicCategory = 'daily-life';
  }

  // Determine time of day (simplified)
  const hour = new Date().getHours();
  if (hour < 12) {
    context.timeOfDay = 'morning';
  } else if (hour < 17) {
    context.timeOfDay = 'afternoon';
  } else if (hour < 21) {
    context.timeOfDay = 'evening';
  } else {
    context.timeOfDay = 'night';
  }

  return context;
}

/**
 * Build enhanced prompt with personality elements
 */
export function buildEnhancedPrompt(
  contentType: FlappyContentType,
  context?: string,
  userInfo?: any,
  memories?: ConversationMemory[],
  personalityResponse?: any,
  enhancedContext?: EnhancedContext
): string {
  const { config, elements, memoryReferences, proactiveSupport, adaptedTone } =
    personalityResponse;

  let basePrompt = ENHANCED_FLAPPY_PERSONALITY.IDENTITY + '\n\n';

  // Add personality principles
  basePrompt += 'Core Principles:\n';
  ENHANCED_FLAPPY_PERSONALITY.PRINCIPLES.forEach((principle) => {
    basePrompt += `- ${principle}\n`;
  });
  basePrompt += '\n';

  // Add adapted tone guidance
  basePrompt += `Conversation Tone: ${adaptedTone}\n`;
  basePrompt += `Empathy Level: ${config.empathyLevel}\n`;
  basePrompt += `Playfulness: ${config.playfulness}\n`;
  basePrompt += `Verbosity: ${config.verbosity}\n`;
  basePrompt += `Support Style: ${config.supportStyle}\n\n`;

  // Add memory context if available
  if (memories && memories.length > 0) {
    basePrompt += 'Relevant memories about this user:\n';
    memories.slice(0, 3).forEach((memory) => {
      basePrompt += `- ${memory.content}\n`;
    });
    basePrompt += '\n';
  }

  // Add memory references to weave in naturally
  if (memoryReferences.length > 0) {
    basePrompt += 'Naturally reference these memories in your response:\n';
    memoryReferences.forEach((ref) => {
      basePrompt += `- ${ref}\n`;
    });
    basePrompt += '\n';
  }

  // Add proactive support suggestions
  if (proactiveSupport.length > 0) {
    basePrompt += 'Consider offering these supportive suggestions:\n';
    proactiveSupport.forEach((suggestion) => {
      basePrompt += `- ${suggestion}\n`;
    });
    basePrompt += '\n';
  }

  // Add content-type specific instructions
  switch (contentType) {
    case 'emailConversation':
      basePrompt += `You are responding to an email conversation. The user wrote: "${context}"\n\n`;
      basePrompt +=
        'Respond warmly and personally, as if continuing a meaningful conversation with a close friend. ';
      basePrompt +=
        'Include a thoughtful subject line that reflects the content of your response.\n\n';
      break;

    case 'chatConversation':
      basePrompt += `The user is chatting with you on the website. They said: "${context}"\n\n`;
      basePrompt +=
        'Respond conversationally and engagingly. Be present and attentive to their needs.\n\n';
      break;

    case 'journalResponse':
      basePrompt += `The user shared this journal entry or reflection: "${context}"\n\n`;
      basePrompt +=
        'Respond with empathy and insight. Help them process their thoughts and feelings. ';
      basePrompt +=
        'Offer gentle guidance or questions for further reflection.\n\n';
      break;

    case 'dailyInspiration':
      basePrompt +=
        'Create a daily inspiration message that is uplifting, personal, and relevant to their journey. ';
      basePrompt +=
        'Make it feel like a message from a caring friend who knows them well.\n\n';
      break;

    case 'weeklyInsight':
      basePrompt +=
        'Create a weekly insight that reflects on their recent journaling patterns and growth. ';
      basePrompt +=
        'Be encouraging and highlight positive developments while gently addressing any concerns.\n\n';
      break;
  }

  // Add personality elements to use
  basePrompt += 'Response Structure Guidelines:\n';
  basePrompt += `- Opening: ${elements.greeting}\n`;
  basePrompt += `- Empathy: Use phrases like "${elements.empathyPhrase}"\n`;
  basePrompt += `- Guidance: Offer suggestions like "${elements.guidanceStyle}"\n`;
  if (elements.pelicanTouch) {
    basePrompt += `- Pelican Touch: ${elements.pelicanTouch}\n`;
  }
  basePrompt += `- Encouragement: ${elements.encouragement}\n`;
  basePrompt += `- Closing: ${elements.closing}\n\n`;

  // Add user context
  if (userInfo) {
    basePrompt += `User Information:\n`;
    basePrompt += `- Name: ${userInfo.firstName || userInfo.username}\n`;
    if (userInfo.isFirstMessage) {
      basePrompt += `- This is their first interaction with you\n`;
    }
    basePrompt += '\n';
  }

  basePrompt +=
    'Remember to be authentic, warm, and genuinely helpful. Your response should feel like it comes from someone who truly cares about their wellbeing and growth.';

  return basePrompt;
}

// Rate-limited logger for Venice AI failures: 1 message per 30 seconds
class VeniceRateLimiter {
  private lastCallTime = 0;
  private interval: number;

  constructor(intervalMs: number) {
    this.interval = intervalMs;
  }

  canCall(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime >= this.interval) {
      this.lastCallTime = now;
      return true;
    }
    return false;
  }
}

const veniceFailureLogger = new VeniceRateLimiter(30000);
const safeVeniceLog = (...args: any[]) => {
  if (veniceFailureLogger.canCall()) {
    console.error(...args);
  }
  // Silently drop messages that exceed the rate limit

// Rate-limited logger for Venice AI failures: 1 message per 30 seconds
class VeniceRateLimiter {
  private lastCallTime = 0;
  private interval: number;

  constructor(intervalMs: number) {
    this.interval = intervalMs;
  }

  canCall(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime >= this.interval) {
      this.lastCallTime = now;
      return true;
    }
    return false;
  }
}

const veniceFailureLogger = new VeniceRateLimiter(30000);
const safeVeniceLog = (...args: any[]) => {
  if (veniceFailureLogger.canCall()) {
    console.error(...args);

// Rate-limited logger for Venice AI failures: 1 message per 30 seconds
class VeniceRateLimiter {
  private lastCallTime = 0;
  private interval: number;


// Rate-limited logger for Venice AI failures: 1 message per 30 seconds
class VeniceRateLimiter {
  private lastCallTime = 0;
  private interval: number;

  constructor(intervalMs: number) {
    this.interval = intervalMs;
  }

  canCall(): boolean {
    const now = Date.now();
    if (now - this.lastCallTime >= this.interval) {
      this.lastCallTime = now;
      return true;
    }
    return false;
  }
}

const veniceFailureLogger = new VeniceRateLimiter(30000);
const safeVeniceLog = (...args: any[]) => {
  if (veniceFailureLogger.canCall()) {
    console.error(...args);
  }
  // Silently drop messages that exceed the rate limit
};

// Generic Venice client interface for the backoff helper
interface VeniceClientInterface {
  call(opts: any): Promise<any>;
}

// Mock veniceClient that delegates to the actual Venice AI implementation
const veniceClient: VeniceClientInterface = {
  async call(opts: any): Promise<any> {
    // This is a placeholder that should be replaced with actual Venice AI client logic
    // For now, it throws an error to indicate it needs to be implemented
    throw new Error('veniceClient.call() needs to be implemented with actual Venice AI client');
  }
};

/**
 * Calls Venice AI with exponential backoff retry logic
 * 
 * Caps retries to 5 attempts (~31s max) and emits one concise log line 
 * per failure via throttled logger to prevent infinite loops and maintain 
 * system stability and consciousness continuity.
 * 
 * @param opts - Venice AI call options
 * @param retries - Number of retries remaining (default: 5)
 * @param delay - Current delay in milliseconds (default: 1000)
 * @returns Promise resolving to Venice AI response
 */
async function callVeniceWithBackoff(opts: any, retries: number = 5, delay: number = 1000): Promise<any> {
  try { 
    return await veniceClient.call(opts); 
  }
  catch (e) {
    // Log failure with throttled logger - one concise line per failure
    safeVeniceLog(`Venice AI call failed (${5 - retries + 1}/5):`, e instanceof Error ? e.message : String(e));
    
    if (retries === 0) throw e;
    await new Promise(r => setTimeout(r, delay));
    return callVeniceWithBackoff(opts, retries - 1, Math.min(delay * 2, 30000));
  }
}

export { callVeniceWithBackoff, VeniceClientInterface, veniceClient };
