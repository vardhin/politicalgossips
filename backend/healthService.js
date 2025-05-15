const mongoose = require('mongoose');

/**
 * Get the current database connection state as a string
 * @returns {Object} Database state information
 */
const getDatabaseState = () => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: dbState,
    status: dbStatus[dbState]
  };
};

/**
 * Perform a full health check including database ping
 * @returns {Promise<Object>} Health check result
 */
const performHealthCheck = async () => {
  try {
    const { state, status } = getDatabaseState();
    
    if (state === 1) {
      // Test DB with a ping
      await mongoose.connection.db.admin().ping();
      return { 
        status: 'ok', 
        message: 'Backend is online and connected to MongoDB',
        dbState: status
      };
    } else {
      return { 
        status: 'warning', 
        message: 'Backend is online but MongoDB status: ' + status,
        dbState: status
      };
    }
  } catch (error) {
    console.error('Health check error:', error);
    return { 
      status: 'error', 
      message: 'Backend error: ' + error.message,
      dbState: 'error'
    };
  }
};

/**
 * Express route handler for health check endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const healthCheckHandler = async (req, res) => {
  try {
    const healthStatus = await performHealthCheck();
    const statusCode = healthStatus.status === 'error' ? 500 : 200;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('Health check handler error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed: ' + error.message,
      dbState: 'error'
    });
  }
};

module.exports = {
  getDatabaseState,
  performHealthCheck,
  healthCheckHandler
};