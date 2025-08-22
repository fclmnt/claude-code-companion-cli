const https = require('https');
const http = require('http');
const chalk = require('chalk');

class ApiClient {
  constructor() {
    this.defaultTimeout = 10000; // 10 seconds
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(method, path, data = null, serverUrl = 'https://claude-code-companion-backend-production.up.railway.app', options = {}) {
    const timeout = options.timeout || this.defaultTimeout;
    const retryAttempts = options.retryAttempts || this.retryAttempts;
    
    let lastError;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const response = await this._makeHttpRequest(method, path, data, serverUrl, timeout);
        
        // Log successful request in debug mode
        if (process.env.NODE_ENV === 'development') {
          console.log(chalk.gray(`✅ ${method} ${path} - ${response.status || 'success'}`));
        }
        
        return response;
        
      } catch (error) {
        lastError = error;
        
        // Log failed request in debug mode
        if (process.env.NODE_ENV === 'development') {
          console.log(chalk.gray(`❌ ${method} ${path} - ${error.message} (attempt ${attempt}/${retryAttempts})`));
        }
        
        // Don't retry on client errors (4xx)
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          break;
        }
        
        // Don't retry on last attempt
        if (attempt === retryAttempts) {
          break;
        }
        
        // Wait before retry
        await this._delay(this.retryDelay * attempt);
      }
    }
    
    throw lastError;
  }

  /**
   * Make single HTTP request
   */
  _makeHttpRequest(method, path, data, serverUrl, timeout) {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(serverUrl + path);
        const isHttps = url.protocol === 'https:';
        const lib = isHttps ? https : http;
        
        const options = {
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname + url.search,
          method: method.toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': `cccompanion/${require('../../package.json').version}`,
            'Accept': 'application/json'
          },
          timeout: timeout
        };

        // Add Content-Length for requests with data
        if (data) {
          const jsonData = JSON.stringify(data);
          options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = lib.request(options, (res) => {
          let body = '';
          
          res.on('data', chunk => {
            body += chunk;
          });
          
          res.on('end', () => {
            try {
              // Handle empty responses
              if (!body.trim()) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                  resolve({ success: true, status: res.statusCode });
                } else {
                  reject(new Error(`HTTP ${res.statusCode}: Empty response`));
                }
                return;
              }

              // Parse JSON response
              const response = JSON.parse(body);
              
              // Handle HTTP error status codes
              if (res.statusCode >= 400) {
                const error = new Error(response.error || `HTTP ${res.statusCode}`);
                error.statusCode = res.statusCode;
                error.response = response;
                reject(error);
                return;
              }
              
              resolve(response);
              
            } catch (parseError) {
              reject(new Error(`Invalid JSON response: ${body.substring(0, 200)}...`));
            }
          });
        });

        req.on('error', (error) => {
          if (error.code === 'ECONNREFUSED') {
            reject(new Error('Connection refused - is the server running?'));
          } else if (error.code === 'ENOTFOUND') {
            reject(new Error('Server not found - check the URL'));
          } else if (error.code === 'ETIMEDOUT') {
            reject(new Error('Request timed out - server may be slow'));
          } else {
            reject(new Error(`Network error: ${error.message}`));
          }
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`Request timeout after ${timeout}ms`));
        });

        // Send data for POST/PUT requests
        if (data) {
          req.write(JSON.stringify(data));
        }
        
        req.end();
        
      } catch (error) {
        reject(new Error(`Request setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Test connection to server
   */
  async testConnection(serverUrl) {
    try {
      const response = await this.makeRequest('GET', '/health', null, serverUrl, { 
        timeout: 5000,
        retryAttempts: 1 
      });
      
      return response.success !== false;
    } catch (error) {
      // Enhance error message for common issues
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error(`Server not running at ${serverUrl}`);
      } else if (error.message.includes('ENOTFOUND')) {
        throw new Error(`Invalid server URL: ${serverUrl}`);
      } else if (error.message.includes('timeout')) {
        throw new Error(`Server at ${serverUrl} is not responding`);
      }
      
      throw error;
    }
  }

  /**
   * Poll for notification response
   */
  async pollForResponse(requestId, serverUrl, options = {}) {
    const maxAttempts = options.maxAttempts || 15;
    const pollInterval = options.pollInterval || 2000;
    const timeout = options.timeout || 5000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.makeRequest(
          'GET', 
          `/api/notifications/${requestId}/status`, 
          null, 
          serverUrl,
          { timeout, retryAttempts: 1 }
        );
        
        if (response.success && response.status !== 'pending') {
          return response;
        }
        
        // Wait before next poll
        if (attempt < maxAttempts) {
          await this._delay(pollInterval);
        }
        
      } catch (error) {
        // Log polling errors but continue
        if (process.env.NODE_ENV === 'development') {
          console.log(chalk.gray(`Poll attempt ${attempt} failed: ${error.message}`));
        }
        
        // Wait before retry even on error
        if (attempt < maxAttempts) {
          await this._delay(pollInterval);
        }
      }
    }
    
    // Timeout - return pending status
    return {
      success: true,
      status: 'timeout',
      user_response: null,
      response_at: null
    };
  }

  /**
   * Send notification request
   */
  async sendNotification(notificationData, serverUrl) {
    return await this.makeRequest('POST', '/api/notifications', notificationData, serverUrl);
  }

  /**
   * Pair device
   */
  async pairDevice(pairingCode, cliInfo, serverUrl) {
    const pairingData = {
      pairing_code: pairingCode,
      cli_info: cliInfo
    };
    
    return await this.makeRequest('POST', '/api/devices/pair', pairingData, serverUrl);
  }

  /**
   * Get device status
   */
  async getDeviceStatus(deviceId, serverUrl) {
    return await this.makeRequest('GET', `/api/devices/${deviceId}/status`, null, serverUrl);
  }

  /**
   * Utility: Delay function
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set default timeout
   */
  setTimeout(timeout) {
    this.defaultTimeout = timeout;
  }

  /**
   * Set retry configuration
   */
  setRetryConfig(attempts, delay) {
    this.retryAttempts = attempts;
    this.retryDelay = delay;
  }
}

// Export singleton instance
module.exports = new ApiClient();