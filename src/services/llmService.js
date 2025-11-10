const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const { SYSTEM_PROMPT } = require('../config/systemPrompt');
const tools = require('../config/tools.json');

// Initialize AI clients
let openaiClient = null;
let geminiClient = null;

if (process.env.AI_SERVICE === 'openai' && process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

if (process.env.AI_SERVICE === 'gemini' && process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * CR-02: LLM Prompt & Execution
 * Get response from LLM (OpenAI or Gemini) with conversation context
 * 
 * @param {string} userMessage - Current user message
 * @param {Array} conversationHistory - Previous conversation turns
 * @param {boolean} isToolResult - Whether this is a tool execution result
 * @returns {Promise<Object>} - LLM response with content and optional tool calls
 */
async function getLLMResponse(userMessage, conversationHistory = [], isToolResult = false) {
  const aiService = process.env.AI_SERVICE || 'openai';
  
  if (aiService === 'openai') {
    return await getOpenAIResponse(userMessage, conversationHistory, isToolResult);
  } else if (aiService === 'gemini') {
    return await getGeminiResponse(userMessage, conversationHistory, isToolResult);
  } else {
    throw new Error(`Unsupported AI service: ${aiService}`);
  }
}

/**
 * Get response from OpenAI GPT
 */
async function getOpenAIResponse(userMessage, conversationHistory, isToolResult) {
  try {
    if (!openaiClient) {
      throw new Error('OpenAI client not initialized');
    }
    
    // Build messages array with system prompt and conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    // Add current message
    if (!isToolResult) {
      messages.push({ role: 'user', content: userMessage });
    } else {
      messages.push({ role: 'function', content: userMessage });
    }
    
    // TR-03: LLM Tool Declaration
    const requestOptions = {
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 150, // Keep responses concise for voice
      stream: false // Set to true for streaming responses
    };
    
    // Add tools if available
    if (tools && tools.length > 0) {
      requestOptions.tools = tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
      requestOptions.tool_choice = 'auto';
    }
    
    const startTime = Date.now();
    const completion = await openaiClient.chat.completions.create(requestOptions);
    const latency = Date.now() - startTime;
    
    logger.debug(`OpenAI API latency: ${latency}ms`);
    
    const message = completion.choices[0].message;
    
    // Check for tool calls
    const toolCalls = message.tool_calls?.map(tc => ({
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments)
    })) || [];
    
    return {
      content: message.content || '',
      toolCalls: toolCalls,
      finishReason: completion.choices[0].finish_reason
    };
    
  } catch (error) {
    logger.error('OpenAI API error:', error);
    throw new Error('Failed to get OpenAI response');
  }
}

/**
 * Get response from Google Gemini
 */
async function getGeminiResponse(userMessage, conversationHistory, isToolResult) {
  try {
    if (!geminiClient) {
      throw new Error('Gemini client not initialized');
    }
    
    const model = geminiClient.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-pro'
    });
    
    // Build conversation context
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    // Create chat session with history
    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150
      }
    });
    
    // Construct prompt with system instruction
    const fullPrompt = conversationHistory.length === 0
      ? `${SYSTEM_PROMPT}\n\nUser: ${userMessage}`
      : userMessage;
    
    const startTime = Date.now();
    const result = await chat.sendMessage(fullPrompt);
    const latency = Date.now() - startTime;
    
    logger.debug(`Gemini API latency: ${latency}ms`);
    
    const response = await result.response;
    const text = response.text();
    
    // Note: Gemini function calling is slightly different
    // For simplicity, we'll handle basic responses here
    // Extend this for Gemini function calling if needed
    
    return {
      content: text,
      toolCalls: [], // Implement Gemini function calling separately
      finishReason: 'stop'
    };
    
  } catch (error) {
    logger.error('Gemini API error:', error);
    throw new Error('Failed to get Gemini response');
  }
}

/**
 * Get streaming response from OpenAI (for lower latency)
 */
async function getStreamingResponse(userMessage, conversationHistory, onChunk) {
  try {
    if (!openaiClient) {
      throw new Error('OpenAI client not initialized');
    }
    
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];
    
    const stream = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: messages,
      temperature: 0.7,
      max_tokens: 150,
      stream: true
    });
    
    let fullContent = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        if (onChunk) {
          onChunk(content);
        }
      }
    }
    
    return {
      content: fullContent,
      toolCalls: [],
      finishReason: 'stop'
    };
    
  } catch (error) {
    logger.error('Streaming API error:', error);
    throw new Error('Failed to get streaming response');
  }
}

module.exports = {
  getLLMResponse,
  getStreamingResponse
};
