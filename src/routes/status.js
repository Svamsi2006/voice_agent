/**
 * Status monitoring endpoint
 * Provides real-time statistics about active calls and system health
 */

const express = require('express');
const router = express.Router();
const { getActiveSessions } = require('../services/twilioHandler');
const { MemoryManager } = require('../utils/conversationMemory');
const { getCacheStats } = require('../services/textToSpeech');

// Get system status
router.get('/status', (req, res) => {
  const activeSessions = getActiveSessions();
  const memoryStats = MemoryManager.getAllStats();
  const ttsCache = getCacheStats();
  
  res.json({
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    calls: {
      active: activeSessions.length,
      sessions: activeSessions
    },
    memory: {
      activeSessions: memoryStats.length,
      totalMessages: memoryStats.reduce((sum, s) => sum + s.totalMessages, 0)
    },
    cache: {
      tts: ttsCache
    },
    timestamp: new Date().toISOString()
  });
});

// Get detailed session information
router.get('/sessions', (req, res) => {
  const sessions = MemoryManager.getAllStats();
  res.json({
    count: sessions.length,
    sessions: sessions
  });
});

// Get session by ID
router.get('/sessions/:sessionId', (req, res) => {
  const memory = MemoryManager.get(req.params.sessionId);
  
  if (!memory) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: req.params.sessionId,
    stats: memory.getStats(),
    history: memory.getHistory()
  });
});

// Clear old sessions
router.post('/cleanup', (req, res) => {
  const maxAge = req.body.maxAge || 3600000; // 1 hour default
  const cleared = MemoryManager.clearOldSessions(maxAge);
  
  res.json({
    success: true,
    cleared: cleared,
    message: `Cleared ${cleared} old sessions`
  });
});

module.exports = router;
