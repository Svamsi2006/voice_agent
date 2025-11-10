const logger = require('./logger');

/**
 * CR-04: Conversation Memory
 * Manages conversation history with a sliding window of the last N turns
 */
class ConversationMemory {
  constructor(sessionId, maxTurns = null) {
    this.sessionId = sessionId;
    this.maxTurns = maxTurns || parseInt(process.env.CONVERSATION_HISTORY_TURNS || '5');
    this.history = [];
    this.createdAt = Date.now();
    
    logger.debug(`Conversation memory initialized for session ${sessionId} (max ${this.maxTurns} turns)`);
  }
  
  /**
   * Add a message to the conversation history
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addMessage(role, content) {
    const message = {
      role: role,
      content: content,
      timestamp: Date.now()
    };
    
    this.history.push(message);
    
    // Keep only the last N turns (2 messages per turn - user + assistant)
    const maxMessages = this.maxTurns * 2;
    if (this.history.length > maxMessages) {
      const removed = this.history.shift();
      logger.debug(`Removed oldest message from memory: "${removed.content.substring(0, 50)}..."`);
    }
    
    logger.debug(`Added ${role} message to memory. Total messages: ${this.history.length}`);
  }
  
  /**
   * Get the complete conversation history
   * @returns {Array} Array of message objects
   */
  getHistory() {
    return [...this.history]; // Return a copy to prevent external modifications
  }
  
  /**
   * Get recent messages (last N messages)
   * @param {number} count - Number of recent messages to retrieve
   * @returns {Array} Recent messages
   */
  getRecentMessages(count) {
    return this.history.slice(-count);
  }
  
  /**
   * Get only user messages
   * @returns {Array} User messages
   */
  getUserMessages() {
    return this.history.filter(msg => msg.role === 'user');
  }
  
  /**
   * Get only assistant messages
   * @returns {Array} Assistant messages
   */
  getAssistantMessages() {
    return this.history.filter(msg => msg.role === 'assistant');
  }
  
  /**
   * Get conversation summary statistics
   * @returns {Object} Statistics about the conversation
   */
  getStats() {
    const userMessages = this.getUserMessages();
    const assistantMessages = this.getAssistantMessages();
    
    return {
      sessionId: this.sessionId,
      totalMessages: this.history.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      turns: Math.min(userMessages.length, assistantMessages.length),
      duration: Date.now() - this.createdAt,
      createdAt: new Date(this.createdAt).toISOString()
    };
  }
  
  /**
   * Get formatted conversation for display/logging
   * @returns {string} Formatted conversation
   */
  getFormattedHistory() {
    return this.history.map((msg, index) => {
      const speaker = msg.role === 'user' ? 'User' : 'Assistant';
      return `[${index + 1}] ${speaker}: ${msg.content}`;
    }).join('\n');
  }
  
  /**
   * Clear conversation history
   */
  clear() {
    const previousCount = this.history.length;
    this.history = [];
    logger.info(`Cleared ${previousCount} messages from session ${this.sessionId}`);
  }
  
  /**
   * Export conversation for storage/analysis
   * @returns {Object} Complete conversation data
   */
  export() {
    return {
      sessionId: this.sessionId,
      history: this.history,
      stats: this.getStats()
    };
  }
  
  /**
   * Import conversation from previous export
   * @param {Object} data - Exported conversation data
   */
  import(data) {
    if (data.sessionId !== this.sessionId) {
      logger.warn(`Importing conversation from different session: ${data.sessionId} -> ${this.sessionId}`);
    }
    
    this.history = data.history || [];
    logger.info(`Imported ${this.history.length} messages into session ${this.sessionId}`);
  }
  
  /**
   * Check if conversation is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.history.length === 0;
  }
  
  /**
   * Get the last message
   * @returns {Object|null} Last message or null if empty
   */
  getLastMessage() {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }
  
  /**
   * Search for messages containing specific text
   * @param {string} searchText - Text to search for
   * @returns {Array} Matching messages
   */
  searchMessages(searchText) {
    const lowerSearch = searchText.toLowerCase();
    return this.history.filter(msg => 
      msg.content.toLowerCase().includes(lowerSearch)
    );
  }
}

/**
 * Global memory manager for all active sessions
 */
class MemoryManager {
  constructor() {
    this.sessions = new Map();
  }
  
  /**
   * Create or get memory for a session
   */
  getOrCreate(sessionId, maxTurns) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new ConversationMemory(sessionId, maxTurns));
    }
    return this.sessions.get(sessionId);
  }
  
  /**
   * Get memory for a session
   */
  get(sessionId) {
    return this.sessions.get(sessionId);
  }
  
  /**
   * Delete memory for a session
   */
  delete(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      logger.info(`Deleted memory for session ${sessionId}`);
    }
    return deleted;
  }
  
  /**
   * Get all active sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.keys());
  }
  
  /**
   * Get statistics for all sessions
   */
  getAllStats() {
    return Array.from(this.sessions.values()).map(memory => memory.getStats());
  }
  
  /**
   * Clear old sessions (sessions older than maxAge milliseconds)
   */
  clearOldSessions(maxAge = 3600000) { // Default 1 hour
    const now = Date.now();
    let cleared = 0;
    
    for (const [sessionId, memory] of this.sessions.entries()) {
      if (now - memory.createdAt > maxAge) {
        this.sessions.delete(sessionId);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      logger.info(`Cleared ${cleared} old sessions`);
    }
    
    return cleared;
  }
}

// Export singleton instance
const memoryManager = new MemoryManager();

module.exports = ConversationMemory;
module.exports.MemoryManager = memoryManager;
