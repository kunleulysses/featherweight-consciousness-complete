import { z } from 'zod';

// Access code validation schema
const validateAccessSchema = z.object({
  accessCode: z.string().min(1, 'Access code is required'),
  email: z.string().email().optional().nullable(),
  timestamp: z.string().optional(),
});

// Global access code
const GLOBAL_ACCESS_CODE = 'g00dnews';

// Future: Individual access codes (can be stored in database)
const individualAccessCodes = {
  // Example individual codes (can be expanded)
  'researcher001': {
    code: 'r3s3arch2024!',
    email: 'researcher@stanford.edu',
    level: 'researcher',
    usageCount: 0,
    maxUsage: 50,
  },
  'admin001': {
    code: 'adm1n2024!',
    level: 'admin',
    usageCount: 0,
  }
};

// Access log for tracking usage
const accessLogs = [];

export const validateAccessCode = async (req, res) => {
  try {
    const { accessCode, email, timestamp } = validateAccessSchema.parse(req.body);
    
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    let isValid = false;
    let accessLevel = 'standard';
    let userLevel = 'user';
    let message = '';
    let reason = '';

    // Check global access code first
    if (accessCode === GLOBAL_ACCESS_CODE) {
      isValid = true;
      accessLevel = 'full';
      userLevel = 'standard';
      message = 'Welcome to Featherweight - Full Technology Access Granted';
      reason = 'global_code_valid';
    } 
    // Check individual access codes
    else {
      const individualCode = Object.values(individualAccessCodes).find(
        codeData => codeData.code === accessCode
      );
      
      if (individualCode) {
        // Check if email matches (if required)
        if (individualCode.email && email && individualCode.email !== email) {
          isValid = false;
          reason = 'email_mismatch';
          message = 'Access code is valid but email does not match. Please use the correct email address.';
        }
        // Check expiration
        else if (individualCode.expiresAt && new Date() > individualCode.expiresAt) {
          isValid = false;
          reason = 'code_expired';
          message = 'Access code has expired. Please contact the research team for a new code.';
        }
        // Check usage limits
        else if (individualCode.maxUsage && individualCode.usageCount >= individualCode.maxUsage) {
          isValid = false;
          reason = 'usage_limit_exceeded';
          message = 'Access code has reached its usage limit. Please contact the research team.';
        }
        // Valid individual code
        else {
          isValid = true;
          accessLevel = 'full';
          userLevel = individualCode.level;
          message = `Welcome, ${individualCode.level} - Full Technology Access Granted`;
          reason = 'individual_code_valid';
          
          // Increment usage count
          individualCode.usageCount++;
        }
      } else {
        isValid = false;
        reason = 'invalid_code';
        message = 'Invalid access code. Please check your code and try again.';
      }
    }

    // Log the access attempt
    const logEntry = {
      accessCode: accessCode.substring(0, 3) + '*'.repeat(accessCode.length - 3), // Partially hide code in logs
      email,
      timestamp: new Date(),
      ipAddress: clientIP,
      userAgent,
      granted: isValid,
      reason,
    };
    accessLogs.push(logEntry);

    // Keep only last 1000 log entries
    if (accessLogs.length > 1000) {
      accessLogs.splice(0, accessLogs.length - 1000);
    }

    if (isValid) {
      res.status(200).json({
        success: true,
        message,
        accessLevel,
        userLevel,
        timestamp: new Date().toISOString(),
        sessionDuration: '24h',
      });
    } else {
      res.status(403).json({
        success: false,
        message,
        reason,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Access code validation error:', error);
    
    // Log failed validation attempt
    accessLogs.push({
      accessCode: 'invalid_request',
      timestamp: new Date(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      granted: false,
      reason: 'validation_error',
    });

    res.status(400).json({
      success: false,
      message: 'Invalid request format. Please check your access code and try again.',
      reason: 'validation_error',
    });
  }
};

// Admin endpoint to view access logs
export const getAccessLogs = async (req, res) => {
  try {
    const recentLogs = accessLogs.slice(-50).reverse();
    
    res.status(200).json({
      success: true,
      logs: recentLogs,
      totalEntries: accessLogs.length,
    });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch access logs',
    });
  }
};

// Admin endpoint to add new individual access codes
export const addAccessCode = async (req, res) => {
  try {
    const { codeId, code, email, level = 'standard', maxUsage, expiresAt } = req.body;
    
    if (!codeId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Code ID and access code are required',
      });
    }
    
    if (individualAccessCodes[codeId]) {
      return res.status(409).json({
        success: false,
        message: 'Code ID already exists',
      });
    }
    
    individualAccessCodes[codeId] = {
      code,
      email,
      level,
      usageCount: 0,
      maxUsage,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };
    
    res.status(201).json({
      success: true,
      message: 'Access code created successfully',
      codeId,
    });
    
  } catch (error) {
    console.error('Error adding access code:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to create access code',
    });
  }
};

// Get current access code statistics
export const getAccessStats = async (req, res) => {
  try {
    const totalCodes = Object.keys(individualAccessCodes).length + 1; // +1 for global code
    const activeCodes = Object.values(individualAccessCodes).filter(
      code => !code.expiresAt || new Date() < code.expiresAt
    ).length + 1;
    
    const totalAttempts = accessLogs.length;
    const successfulAttempts = accessLogs.filter(log => log.granted).length;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts * 100).toFixed(2) : '0';
    
    const recentActivity = accessLogs.filter(
      log => new Date().getTime() - log.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;
    
    res.status(200).json({
      success: true,
      stats: {
        totalCodes,
        activeCodes,
        totalAttempts,
        successfulAttempts,
        successRate: `${successRate}%`,
        recentActivity24h: recentActivity,
        globalCodeActive: true,
      },
    });
    
  } catch (error) {
    console.error('Error fetching access stats:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch access statistics',
    });
  }
};

export default {
  validateAccessCode,
  getAccessLogs,
  addAccessCode,
  getAccessStats,
};
