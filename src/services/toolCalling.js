const axios = require('axios');
const logger = require('../utils/logger');

/**
 * TR-01: Database Lookup Tool
 * TR-02: Calendar Update Tool
 * 
 * External tool calling implementation
 * These functions can be invoked by the LLM when needed
 */

/**
 * Main tool executor - routes to specific tool implementations
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} toolArgs - Arguments for the tool
 * @returns {Promise<Object>} - Tool execution result
 */
async function executeTool(toolName, toolArgs) {
  logger.info(`🔧 Executing tool: ${toolName}`, toolArgs);
  
  try {
    let result;
    
    switch (toolName) {
      case 'checkOrderStatus':
        result = await checkOrderStatus(toolArgs);
        break;
        
      case 'lookupCustomer':
        result = await lookupCustomer(toolArgs);
        break;
        
      case 'createAppointment':
        result = await createAppointment(toolArgs);
        break;
        
      case 'updateAppointment':
        result = await updateAppointment(toolArgs);
        break;
        
      case 'searchDatabase':
        result = await searchDatabase(toolArgs);
        break;
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
    
    logger.info(`✅ Tool ${toolName} completed successfully`);
    return result;
    
  } catch (error) {
    logger.error(`❌ Tool ${toolName} failed:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * TR-01: Check order status from database/API
 */
async function checkOrderStatus(args) {
  const { orderId, customerPhone } = args;
  
  logger.debug(`Checking order status for: ${orderId || customerPhone}`);
  
  try {
    // Example: Call external API
    if (process.env.DATABASE_API_URL) {
      const response = await axios.get(`${process.env.DATABASE_API_URL}/orders`, {
        params: {
          orderId: orderId,
          phone: customerPhone
        },
        timeout: 3000 // 3 second timeout
      });
      
      return {
        success: true,
        data: response.data
      };
    }
    
    // Mock response for testing
    return {
      success: true,
      data: {
        orderId: orderId || '12345',
        status: 'shipped',
        trackingNumber: 'TRK789456123',
        estimatedDelivery: '2025-11-15',
        items: [
          { name: 'Product A', quantity: 2 },
          { name: 'Product B', quantity: 1 }
        ]
      }
    };
    
  } catch (error) {
    logger.error('Order status lookup failed:', error);
    throw new Error('Unable to retrieve order status at this time');
  }
}

/**
 * TR-01: Look up customer information from database
 */
async function lookupCustomer(args) {
  const { customerId, phone, email } = args;
  
  logger.debug(`Looking up customer: ${customerId || phone || email}`);
  
  try {
    if (process.env.DATABASE_API_URL) {
      const response = await axios.get(`${process.env.DATABASE_API_URL}/customers`, {
        params: {
          customerId: customerId,
          phone: phone,
          email: email
        },
        timeout: 3000
      });
      
      return {
        success: true,
        data: response.data
      };
    }
    
    // Mock response
    return {
      success: true,
      data: {
        customerId: customerId || 'CUST001',
        name: 'John Doe',
        phone: phone || '+1234567890',
        email: email || 'john@example.com',
        accountStatus: 'active',
        recentOrders: 3
      }
    };
    
  } catch (error) {
    logger.error('Customer lookup failed:', error);
    throw new Error('Unable to retrieve customer information');
  }
}

/**
 * TR-02: Create a calendar appointment
 */
async function createAppointment(args) {
  const { date, time, duration, customerName, phone, purpose } = args;
  
  logger.debug(`Creating appointment for ${customerName} on ${date} at ${time}`);
  
  try {
    // Example: Google Calendar API integration
    if (process.env.CALENDAR_API_URL && process.env.GOOGLE_CALENDAR_API_KEY) {
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + (duration || 30) * 60000);
      
      const response = await axios.post(
        `${process.env.CALENDAR_API_URL}/calendars/primary/events`,
        {
          summary: `Appointment with ${customerName}`,
          description: `Purpose: ${purpose}\nPhone: ${phone}`,
          start: {
            dateTime: startDateTime.toISOString(),
            timeZone: 'America/New_York'
          },
          end: {
            dateTime: endDateTime.toISOString(),
            timeZone: 'America/New_York'
          },
          attendees: [
            { email: phone } // In real implementation, use actual email
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_CALENDAR_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      return {
        success: true,
        data: {
          appointmentId: response.data.id,
          date: date,
          time: time,
          status: 'confirmed'
        }
      };
    }
    
    // Mock response
    const appointmentId = `APT${Date.now()}`;
    return {
      success: true,
      data: {
        appointmentId: appointmentId,
        customerName: customerName,
        date: date,
        time: time,
        duration: duration || 30,
        status: 'confirmed',
        confirmationNumber: appointmentId
      }
    };
    
  } catch (error) {
    logger.error('Appointment creation failed:', error);
    throw new Error('Unable to create appointment at this time');
  }
}

/**
 * TR-02: Update an existing appointment
 */
async function updateAppointment(args) {
  const { appointmentId, newDate, newTime, status } = args;
  
  logger.debug(`Updating appointment ${appointmentId}`);
  
  try {
    if (process.env.CALENDAR_API_URL && process.env.GOOGLE_CALENDAR_API_KEY) {
      const updateData = {};
      
      if (newDate && newTime) {
        const startDateTime = new Date(`${newDate}T${newTime}`);
        updateData.start = {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/New_York'
        };
      }
      
      if (status) {
        updateData.status = status; // 'confirmed', 'tentative', 'cancelled'
      }
      
      const response = await axios.patch(
        `${process.env.CALENDAR_API_URL}/calendars/primary/events/${appointmentId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_CALENDAR_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    }
    
    // Mock response
    return {
      success: true,
      data: {
        appointmentId: appointmentId,
        newDate: newDate,
        newTime: newTime,
        status: status || 'updated',
        message: 'Appointment updated successfully'
      }
    };
    
  } catch (error) {
    logger.error('Appointment update failed:', error);
    throw new Error('Unable to update appointment');
  }
}

/**
 * Generic database search function
 */
async function searchDatabase(args) {
  const { table, query, filters } = args;
  
  logger.debug(`Searching database table: ${table}`);
  
  try {
    if (process.env.DATABASE_API_URL) {
      const response = await axios.post(
        `${process.env.DATABASE_API_URL}/search`,
        {
          table: table,
          query: query,
          filters: filters
        },
        { timeout: 3000 }
      );
      
      return {
        success: true,
        data: response.data
      };
    }
    
    // Mock response
    return {
      success: true,
      data: {
        results: [
          { id: 1, name: 'Sample Result 1' },
          { id: 2, name: 'Sample Result 2' }
        ],
        count: 2
      }
    };
    
  } catch (error) {
    logger.error('Database search failed:', error);
    throw new Error('Unable to search database');
  }
}

/**
 * Get list of available tools with their descriptions
 */
function getAvailableTools() {
  return [
    {
      name: 'checkOrderStatus',
      description: 'Check the status of a customer order',
      parameters: ['orderId', 'customerPhone']
    },
    {
      name: 'lookupCustomer',
      description: 'Look up customer information',
      parameters: ['customerId', 'phone', 'email']
    },
    {
      name: 'createAppointment',
      description: 'Create a new calendar appointment',
      parameters: ['date', 'time', 'duration', 'customerName', 'phone', 'purpose']
    },
    {
      name: 'updateAppointment',
      description: 'Update an existing appointment',
      parameters: ['appointmentId', 'newDate', 'newTime', 'status']
    },
    {
      name: 'searchDatabase',
      description: 'Search database for information',
      parameters: ['table', 'query', 'filters']
    }
  ];
}

module.exports = {
  executeTool,
  getAvailableTools,
  // Export individual tools for testing
  checkOrderStatus,
  lookupCustomer,
  createAppointment,
  updateAppointment,
  searchDatabase
};
