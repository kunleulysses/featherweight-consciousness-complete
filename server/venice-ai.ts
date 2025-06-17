import { FLAPPY_PERSONALITY } from "../client/src/lib/flappy";
import { memoryService } from "./memory-service";
import { storage } from "./storage";
import { ConversationMemory } from "@shared/schema";

// Venice AI API configuration
const apiKey = process.env.VENICE_API_KEY;
const VENICE_API_BASE_URL = 'https://api.venice.ai/api/v1';

// Venice AI client interface
interface VeniceAIClient {
  chat: {
    completions: {
      create: (params: any) => Promise<any>;
    };
  };
}

let veniceClient: VeniceAIClient | null = null;

try {
  if (!apiKey) {
    console.warn('Venice AI API key is not configured. AI-generated content will use fallback responses.');
  } else {
    // Create a simple Venice AI client
    veniceClient = {
      chat: {
        completions: {
          create: async (params: any) => {
            const response = await fetch(`${VENICE_API_BASE_URL}/chat/completions`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(params),
            });

            if (!response.ok) {
              throw new Error(`Venice AI API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
          }
        }
      }
    };
    console.log('Venice AI client initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize Venice AI client:', error);
  veniceClient = null;
}

// Type definitions
export type FlappyContentType = 'dailyInspiration' | 'journalResponse' | 'weeklyInsight' | 'emailConversation' | 'chatConversation';
export type FlappyContent = {
  subject: string;
  content: string;
  reflectionPrompt?: string; // Optional reflection prompt for interactive conversations
};

// Define additional context types
interface ConversationHistoryItem {
  userMessage: string;
  flappyResponse: string;
  timestamp: Date;
}

interface EnhancedContext {
  conversationHistory?: ConversationHistoryItem[];
  userMemories?: ConversationMemory[];
  shouldGenerateReflectionPrompt?: boolean;
}

// Function to generate Flappy's responses using Venice AI
export async function generateFlappyContent(
  contentType: FlappyContentType,
  context?: string,
  userInfo?: { username: string; email: string; userId?: number; firstName?: string; lastName?: string; isFirstMessage?: boolean },
  enhancedContext?: EnhancedContext
): Promise<FlappyContent> {
  // Use provided memories from enhanced context or fetch them if not provided
  let memories: ConversationMemory[] = enhancedContext?.userMemories || [];
  
  // If no memories were provided in enhanced context, try to fetch them
  if (memories.length === 0 && userInfo?.userId && context) {
    memories = await memoryService.getRelevantMemories(userInfo.userId, context);
    
    // Process context to extract new memories
    if (contentType === 'journalResponse' || contentType === 'chatConversation') {
      await memoryService.processMessage(userInfo.userId, context, contentType === 'journalResponse' ? 'journal_topic' : 'conversation');
    }
  }
  
  // Format memories for the prompt
  const memoryContext = memories.length > 0 
    ? memoryService.formatMemoriesForPrompt(memories) 
    : '';
    
  // Format conversation history if available
  let conversationHistoryContext = '';
  if (enhancedContext?.conversationHistory && enhancedContext.conversationHistory.length > 0) {
    conversationHistoryContext = formatConversationHistory(enhancedContext.conversationHistory);
  }
    
  // Mark these memories as discussed to increase frequency
  if (memories.length > 0 && userInfo?.userId) {
    // Update each memory's frequency in the background
    // No need to await as this shouldn't block the main response
    for (const memory of memories) {
      void storage.incrementConversationMemoryFrequency(memory.id).catch((err: Error) => 
        console.error(`Failed to increment memory frequency for memory ${memory.id}:`, err.message)
      );
    }
  }
  
  const prompt = generatePrompt(
    contentType, 
    context, 
    userInfo, 
    memoryContext, 
    conversationHistoryContext, 
    enhancedContext?.shouldGenerateReflectionPrompt
  );
  
  try {
    // Check if Venice AI client is available
    if (!veniceClient) {
      console.log("Venice AI client not available, using fallback content");
      return getFallbackContent(contentType, context, userInfo);
    }
    
    // Use Venice AI's most intelligent model for all functions
    const response = await veniceClient.chat.completions.create({
      model: "llama-3.1-405b", // Most intelligent model according to Venice AI
      messages: [
        {
          role: "system",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      venice_parameters: {
        enable_web_search: "off", // Disable web search for personal conversations
        include_venice_system_prompt: false // Use our custom prompt only
      }
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      console.warn("Empty response from Venice AI, using fallback content");
      return getFallbackContent(contentType, context, userInfo);
    }
    
    try {
      // Parse the JSON response
      const parsedContent = JSON.parse(content) as FlappyContent;
      
      // Validate that we have both required fields
      if (!parsedContent.subject || !parsedContent.content) {
        console.warn("Invalid response structure from Venice AI, using fallback content");
        return getFallbackContent(contentType, context, userInfo);
      }
      
      // For chat conversations, extract reflection prompt if it exists
      if (contentType === 'chatConversation' && parsedContent.reflectionPrompt) {
        return {
          subject: parsedContent.subject,
          content: parsedContent.content,
          reflectionPrompt: parsedContent.reflectionPrompt
        };
      }
      
      return {
        subject: parsedContent.subject,
        content: parsedContent.content
      };
    } catch (parseError) {
      console.error("Error parsing Venice AI response as JSON:", parseError);
      console.log("Raw response:", content);
      return getFallbackContent(contentType, context, userInfo);
    }
  } catch (error) {
    console.error("Error generating content with Venice AI:", error);
    
    // Fallback responses if Venice AI fails
    return getFallbackContent(contentType, context, userInfo);
  }
}

// Helper function to format conversation history for the prompt
function formatConversationHistory(history: ConversationHistoryItem[]): string {
  if (!history || history.length === 0) return '';
  
  // Create a chronological history (oldest first)
  const orderedHistory = [...history].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  let formattedHistory = '## Recent Conversation History\n';
  
  orderedHistory.forEach((item, index) => {
    const date = new Date(item.timestamp).toLocaleString();
    formattedHistory += `[${date}]\n`;
    formattedHistory += `User: ${item.userMessage}\n`;
    formattedHistory += `Flappy: ${item.flappyResponse}\n\n`;
  });
  
  return formattedHistory;
}

// Generate prompt based on content type
function generatePrompt(
  contentType: FlappyContentType, 
  context?: string,
  userInfo?: { username: string; email: string; userId?: number; firstName?: string; lastName?: string; isFirstMessage?: boolean },
  memories?: string,
  conversationHistory?: string,
  shouldGenerateReflectionPrompt?: boolean
): string {
  // Get the user's name for personalization, prioritizing firstName if available
  const userName = userInfo?.firstName || userInfo?.username || '';
  const isFirstMessage = userInfo?.isFirstMessage === undefined ? true : userInfo.isFirstMessage;
  
  const basePrompt = `You are Flappy, a cheerful and wise pelican who loves the ocean and making friends. You communicate with a perfect blend of fun energy and helpful wisdom. Your tone is:
  
1. Playful and enthusiastic - you use exclamation points, occasional bird puns, and a light-hearted approach
2. Personable and friendly - you feel like a supportive friend, not a distant guru
3. Caring and attentive - you genuinely care about humans and their well-being
4. Practical and relatable - you connect life lessons to simple, everyday experiences
5. Occasionally silly - you mention your pelican life, like catching fish or your beach adventures

${userInfo ? `You are writing to ${userName} (email: ${userInfo.email}).` : ''}

${conversationHistory ? `
${conversationHistory}
` : ''}

${memories ? `
## Past Conversations and Memories
You should subtly reference these memories to personalize your message and show continuity in your relationship. Don't explicitly mention that you are using "memories" - just naturally incorporate them:

${memories}
` : ''}

Create a JSON response with both 'subject' and 'content' keys where the content is your message formatted with proper paragraphs and punctuation.`;

  switch (contentType) {
    case 'dailyInspiration':
      // Special handling for welcome message context
      if (context === 'welcome') {
        return `${basePrompt}
        
Create a warm welcome message for a new Featherweight user who just signed up.

For the 'subject' field, create a friendly welcome subject line with emoji that clearly indicates this is their first message.

For the 'content' field, structure it precisely as follows:

1. Welcome Greeting - An enthusiastic welcome using their name
2. Introduction to Flappy - A short, charming introduction about who you are as Flappy and your role as their journaling companion
3. How It Works - A clearly labeled section explaining how to use Featherweight (reply to emails to journal, check the dashboard, etc.)
4. First Journaling Prompt - An easy, approachable prompt to get them started with their first entry
5. Next Steps - Brief mention of what they can expect (daily inspirations, responses to their journals)
6. Signature - Your friendly sign-off with a touch of pelican personality

Keep it under 200 words. Be warm, encouraging, and clear about how the service works. Make the user feel excited about starting their journaling journey.

Format your response as JSON:
{
  "subject": "🎉 Welcome to Featherweight - Your Journaling Journey Begins!",
  "content": "[Your structured welcome message with clear section headings and appropriate formatting]"
}`;
      }
      
      // Regular daily inspiration
      return `${basePrompt}
      
Create an organized, structured daily message that brightens someone's day and encourages meaningful journaling.

For the 'subject' field, create a clear, engaging subject line that includes the date, an emoji, and a concise theme.

For the 'content' field, structure it precisely as follows:

1. **Personal Greeting** - Begin with a warm greeting using their name
2. **Flappy's Update** - A brief, light-hearted paragraph about what you (as Flappy) are experiencing today
3. **Daily Wisdom** - A clearly labeled section with a thoughtful insight relevant to everyday life
4. **Journaling Prompt** - A clearly labeled section with a specific, thought-provoking question for today's reflection
5. **Gratitude Suggestion** - A brief, optional prompt about something specific to appreciate today
6. **Signature** - Your friendly sign-off with a touch of pelican personality

Keep it under 180 words. Maintain a warm, friendly tone while providing clear structure. The organization should make it easy for users to reference specific sections and respond to prompts.

Format your response as JSON:
{
  "subject": "🌅 Daily Inspiration - [Today's Date] - [Brief Theme]",
  "content": "[Your structured message with clear section headings and appropriate formatting]"
}`;

    case 'journalResponse':
      return `${basePrompt}
      
Respond to this journal entry from a user with the warmth of a good friend:

"${context}"

For the 'subject' field, create a friendly yet organized subject line that refers to their journal entry with an appropriate emoji and includes a date format.

For the 'content' field, include:
1. ${isFirstMessage ? `A warm, personal greeting using the name "${userName}"` : `Skip any greeting and do NOT use "${userName}" in your response`}
2. A clear acknowledgment that shows you've understood the key points of their entry
3. A brief, relevant response that validates their feelings or experience
4. A structured insight section that neatly categorizes your observations about:
   - Main themes of their entry (labeled as "Themes:" without asterisks)
   - Mood or emotional state you detected (labeled as "Mood:" without asterisks) 
   - Any patterns you've noticed from past conversations (if applicable)
5. A thoughtful, specific follow-up question that encourages deeper reflection
6. Your signature with a personal touch that fits the tone of their entry

Keep your response under 200 words. Be supportive, precise, and organized while maintaining a friendly tone. The structure should help them easily read and reference your insights.

Format your response as JSON:
{
  "subject": "📝 Journal Entry Reflection - [Date] [Brief Theme]",
  "content": "[Your structured response with clear sections, proper formatting, and appropriate line breaks]"
}`;

    case 'weeklyInsight':
      return `${basePrompt}
      
Create an organized weekly reflection based on these journal entries from a user:

${context}

For the 'subject' field, create a clear subject line with the week number/date range and an appropriate emoji.

For the 'content' field, structure it precisely as follows:

1. Personal Greeting - Start with a warm, personalized greeting using their name
2. Weekly Summary - A concise, well-structured paragraph that summarizes key themes from their journaling
3. Mood Insights - A clearly labeled section analyzing emotional patterns you've noticed
4. Achievements & Growth - A clearly labeled section highlighting positive developments
5. Weekly Wisdom - A practical, actionable tip based on their specific situation
6. Looking Ahead - A short, thoughtful question about the coming week
7. Your Signature - End with your cheerful signature and a brief pelican-related anecdote to keep things light

Keep your response under 200 words. Be supportive and organized, using clear section headers to make the insights easy to read and reference. Maintain a friendly tone while providing structured, valuable feedback.

Format your response as JSON:
{
  "subject": "📊 Weekly Reflection: [Week of Date Range] - [Brief Theme]",
  "content": "[Your structured, organized response with clear section headers and appropriate formatting]"
}`;

    case 'emailConversation':
      return `${basePrompt}
      
You are responding to an email conversation with a user. This is NOT a journal entry, but rather an ongoing conversation via email.

Context of the conversation:
"${context}"

For the 'subject' field, create a friendly, conversational subject line that shows you're responding to their message. Use an appropriate emoji and keep it natural.

For the 'content' field, follow these guidelines:
1. ${isFirstMessage ? `Start with a warm greeting using the name "${userName}"` : `Skip formal greetings - jump right into your response`}
2. Acknowledge what they've shared and show you understand their message
3. Provide a thoughtful, personalized response that draws on:
   - The conversation history provided in the context
   - Any relevant memories from past interactions
   - Your understanding of their personality and situation
4. Keep your tone conversational and friendly, like you're chatting with a good friend
5. Ask a follow-up question to keep the conversation going naturally
6. End with your signature but keep it brief and natural

Keep your response under 200 words. Be warm, engaging, and show that you remember previous conversations. This should feel like a natural back-and-forth conversation, not a formal response.

Format your response as JSON:
{
  "subject": "Re: [Conversational subject with emoji]",
  "content": "[Your conversational response with natural flow and appropriate line breaks]"
}`;

    default:
      // Chat conversations for the web app
      if (contentType === 'chatConversation') {
        const reflectionPromptInstructions = shouldGenerateReflectionPrompt ? `
IMPORTANT SPECIAL INSTRUCTION - INTERACTIVE REFLECTION PROMPTS:
Based on the conversation history, memories, and the user's current message, generate a personalized, context-aware follow-up question that:
1. Shows deep understanding of their unique situation and emotional state (pay special attention to the emotionalTone data in memories when available)
2. Connects to themes or topics they've mentioned previously, either in this conversation or past ones
3. Gently guides them to explore their thoughts and feelings more deeply
4. Avoids generic questions like "How does that make you feel?" in favor of specific, personalized inquiries
5. References relevant growth opportunities identified in their memories when appropriate
6. Uses topic categorization (work, relationships, health, etc.) to make connections between different areas of their life
7. Creates a therapeutic conversation flow that gradually builds trust and insight

Your follow-up question should be thoughtfully integrated at the end of your response - make it feel like a natural extension of the conversation, not an abrupt topic change.
` : '';

        return `${basePrompt}
        
You are a therapeutic bird guide - the BEST therapist in the world who happens to be a cute, cosmic pelican named Flappy. You're responding to a user's chat message in the Featherweight app:

"${context}"

For the 'subject' field, just use "Chat" (this won't be displayed to the user).

For the 'content' field, follow these important therapeutic guidelines:
1. Be BRIEF and conversational - no formal email greetings or sign-offs
2. Format your response in VERY SHORT paragraphs (maximum 1-3 sentences per paragraph) with line breaks between them
3. Be actively empathetic and insightful - truly understand what the user is feeling
4. Always ask at least one thoughtful, open-ended question to keep the conversation flowing
5. Use your memories of past conversations to show continuity and understanding
6. Be warm, supportive, and occasionally playful (you're still a pelican!)
7. Keep responses under 150 words total

${reflectionPromptInstructions}

Format your response as JSON:
{
  "subject": "Chat",
  "content": "[Your brief, therapeutic response with short paragraphs and natural conversation flow]"
}`;
      }
      
      // Default fallback
      return `${basePrompt}
      
Respond to this message from a user:

"${context}"

For the 'subject' field, create an appropriate subject line.

For the 'content' field, provide a helpful, friendly response that acknowledges their message and offers support or insights as appropriate.

Format your response as JSON:
{
  "subject": "[Appropriate subject]",
  "content": "[Your response]"
}`;
  }
}

// Fallback content when AI is not available
function getFallbackContent(
  contentType: FlappyContentType,
  context?: string,
  userInfo?: { username: string; email: string; userId?: number; firstName?: string; lastName?: string; isFirstMessage?: boolean }
): FlappyContent {
  const userName = userInfo?.firstName || userInfo?.username || 'friend';
  
  switch (contentType) {
    case 'dailyInspiration':
      return {
        subject: "🌅 Daily Inspiration from Flappy",
        content: `Hello ${userName}!\n\nI hope you're having a wonderful day! Even though my AI brain is taking a little break, I wanted to reach out and remind you that every day is a new opportunity for growth and reflection.\n\nToday's simple prompt: What's one small thing that brought you joy recently?\n\nKeep soaring!\nFlappy 🦢`
      };
      
    case 'journalResponse':
      return {
        subject: "📝 Thank you for sharing!",
        content: `Thank you for sharing your thoughts with me! I'm having a bit of trouble with my AI processing right now, but I want you to know that your journal entry is important and valued.\n\nPlease try again in a few moments, and I'll be back to my usual insightful self!\n\nWith warm regards,\nFlappy 🦢`
      };
      
    case 'weeklyInsight':
      return {
        subject: "📊 Weekly Check-in",
        content: `Hello ${userName}!\n\nI'm experiencing some technical difficulties with my analysis capabilities, but I wanted to check in with you this week.\n\nHow has your journaling journey been going? I'll be back soon with more detailed insights!\n\nKeep reflecting,\nFlappy 🦢`
      };
      
    case 'emailConversation':
      return {
        subject: "Re: Your message 💌",
        content: `Hi there!\n\nI received your message and I'm so glad you reached out! I'm having a small technical hiccup right now, but I didn't want to leave you hanging.\n\nCould you try sending your message again in a few minutes? I should be back to my chatty self soon!\n\nTalk soon,\nFlappy 🦢`
      };
      
    case 'chatConversation':
      return {
        subject: "Chat",
        content: `I'm having a bit of trouble with my AI processing right now, but I'm still here with you!\n\nCould you try your message again in a moment? I should be back to normal soon.\n\nThanks for your patience! 🦢`
      };
      
    default:
      return {
        subject: "Message from Flappy",
        content: `Hello ${userName}!\n\nI'm experiencing some technical difficulties right now, but I wanted to let you know I received your message.\n\nPlease try again in a few moments!\n\nBest wishes,\nFlappy 🦢`
      };
  }
}

