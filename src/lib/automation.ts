import { AutomationConfig, FormField, AutomationResult } from './types';
import { securityService } from './security';

// In a real desktop app, we would use the actual puppeteer package
// Since this is a web app, we'll create a more compatible implementation 
// that simulates the puppeteer functionality

// Default configuration
const DEFAULT_CONFIG: AutomationConfig = {
  headless: true,
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

/**
 * Define a whitelist of allowed domains for security
 */
const ALLOWED_DOMAINS = [
  'acxiom.com',
  'facebook.com',
  'experian.com',
  'equifax.com',
  'spokeo.com',
  'mylife.com',
  'intelius.com',
  'transunion.com',
  'beenverified.com',
  'intelius.com',
  'whitepages.com',
  'peoplefinders.com',
  'peoplesmart.com',
  'radaris.com',
  'ussearch.com',
  'corelogic.com',
  'lexisnexis.com',
  'fastpeoplesearch.com',
  'truthfinder.com',
  'zabasearch.com'
];

/**
 * URL validation and sanitization
 */
function validateAndSanitizeUrl(url: string): string | null {
  try {
    // Parse the URL to validate its format
    const parsedUrl = new URL(url);
    
    // Check protocol - only allow http or https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      console.error(`Invalid URL protocol: ${parsedUrl.protocol}`);
      return null;
    }
    
    // Extract the domain
    const domain = parsedUrl.hostname.toLowerCase();
    
    // Check if domain is allowed
    const isAllowed = ALLOWED_DOMAINS.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    );
    
    if (!isAllowed) {
      console.error(`Domain not in whitelist: ${domain}`);
      return null;
    }
    
    // Return the sanitized URL
    return parsedUrl.toString();
  } catch (error) {
    console.error('URL validation error:', error);
    return null;
  }
}

export class AutomationService {
  private config: AutomationConfig;
  
  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    console.log('Automation service initialized with config:', this.config);
  }

  /**
   * Send an automated request to a data broker opt-out form
   */
  async sendRequest(brokerUrl: string, formData: Record<string, string>): Promise<AutomationResult> {
    // Validate and sanitize URL
    const sanitizedUrl = validateAndSanitizeUrl(brokerUrl);
    if (!sanitizedUrl) {
      return {
        success: false,
        message: 'Invalid or disallowed URL',
        timestamp: new Date().toISOString()
      };
    }
    
    console.log(`[AutomationService] Starting request to ${sanitizedUrl}`);
    
    try {
      // This is where we would launch a real browser with Puppeteer
      // For now, we'll simulate the process
      
      const startTime = Date.now();
      const result = await this.simulateBrowserAutomation(sanitizedUrl, formData);
      const endTime = Date.now();
      
      console.log(`[AutomationService] Request completed in ${endTime - startTime}ms`);
      
      return {
        success: true,
        message: `Successfully submitted request to ${sanitizedUrl}`,
        timestamp: new Date().toISOString(),
        screenshot: result.screenshot
      };
    } catch (error) {
      console.error('[AutomationService] Error in automation:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * In a real implementation, this would control a browser with Puppeteer
   * For demo purposes, this simulates the process
   */
  private async simulateBrowserAutomation(url: string, formData: Record<string, string>): Promise<{ screenshot?: string }> {
    console.log(`[AutomationService] Simulating browser navigation to ${url}`);
    
    // Sanitize and validate form data to prevent injection
    const sanitizedFormData: Record<string, string> = {};
    for (const [key, value] of Object.entries(formData)) {
      // Only allow alphanumeric keys with standard field naming patterns
      if (/^[a-zA-Z0-9_\-[\].]+$/.test(key)) {
        // Trim and limit the size of values
        sanitizedFormData[key] = typeof value === 'string' 
          ? value.slice(0, 1000) // Limit to 1000 chars max
          : '';
      } else {
        console.warn(`Skipping invalid form field key: ${key}`);
      }
    }
    
    console.log(`[AutomationService] Form data to submit:`, sanitizedFormData);
    
    // Simulate processing time to make it feel real - more fields take longer
    const fieldCount = Object.keys(sanitizedFormData).length;
    const processingTime = 2000 + Math.random() * 2000 + (fieldCount * 300);
    console.log(`[AutomationService] Filling ${fieldCount} form fields...`);
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Log form filling actions to console with appropriate sanitization
    Object.entries(sanitizedFormData).forEach(([selector, value]) => {
      if (value) {
        const safeValue = value.length > 20 
          ? value.substring(0, 20) + '...' 
          : value;
        console.log(`[AutomationService] Filling field "${selector}" with value: ${safeValue}`);
      }
    });
    
    // Simulate form submission
    console.log(`[AutomationService] Submitting form...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, randomly succeed or fail
    const successRate = Math.min(0.8 + (fieldCount * 0.03), 0.95);
    if (Math.random() < successRate) {
      console.log(`[AutomationService] Form submission successful`);
      const encodedScreenshot = await this.generateFakeScreenshot(url);
      
      return {
        screenshot: encodedScreenshot
      };
    } else {
      const errorTypes = [
        'Failed to submit form - could not locate submit button',
        'Form validation failed - missing required field',
        'CAPTCHA detected - unable to bypass',
        'Form submission timed out',
        'Website detected automation attempt'
      ];
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      console.error(`[AutomationService] ${randomError}`);
      throw new Error(randomError);
    }
  }
  
  /**
   * Generate a fake screenshot (for demo purposes)
   * In a real implementation, this would be a real screenshot from Puppeteer
   */
  private async generateFakeScreenshot(url: string): Promise<string> {
    // In a real implementation, this would capture an actual screenshot
    // For now, return a placeholder image encoded as base64
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAAA1BMVEVMaXFNx9g6AAAAAXRSTlMAQObYZgAAAB9JREFUeAHtwQEBAAAIAqD+r+5GKTAAAAAAAAAAAM8tIQAAAYRJREFU';
  }
  
  /**
   * Get a list of form fields from a page with proper domain validation
   */
  async detectFormFields(url: string): Promise<FormField[]> {
    // Validate and sanitize URL for security
    const sanitizedUrl = validateAndSanitizeUrl(url);
    if (!sanitizedUrl) {
      console.error(`[AutomationService] Invalid or disallowed URL: ${url}`);
      return [];
    }
    
    console.log(`[AutomationService] Detecting form fields on ${sanitizedUrl}`);
    
    // Simulate detecting form fields
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Common form fields found across most opt-out forms
    const commonFields: FormField[] = [
      { selector: 'input[type="email"]', value: '', type: 'email', label: 'Email Address' },
      { selector: 'input[name="fullName"]', value: '', type: 'text', label: 'Full Name' },
    ];
    
    // Parse domain from URL for safe comparison
    const domain = new URL(sanitizedUrl).hostname.toLowerCase();
    
    // Return form fields based on the broker domain using safe domain matching
    if (domain === 'facebook.com' || domain.endsWith('.facebook.com')) {
      return [
        { selector: '#email', value: '', type: 'email', label: 'Email Address' },
        { selector: '#fullname', value: '', type: 'text', label: 'Full Name' },
        { selector: '#requestType', value: '', type: 'select', label: 'Request Type', 
          options: ['Delete My Data', 'Access My Data', 'Correct My Data'] },
        { selector: 'textarea[name="additionalInfo"]', value: '', type: 'textarea', label: 'Additional Information' },
        { selector: 'input[type="checkbox"][name="confirmation"]', value: 'false', type: 'checkbox', label: 'I confirm this request is for my own personal data' }
      ];
    } else if (domain === 'acxiom.com' || domain.endsWith('.acxiom.com')) {
      return [
        { selector: '#email', value: '', type: 'email', label: 'Email Address' },
        { selector: '#fname', value: '', type: 'text', label: 'First Name' },
        { selector: '#lname', value: '', type: 'text', label: 'Last Name' },
        { selector: '#address', value: '', type: 'text', label: 'Street Address' },
        { selector: '#city', value: '', type: 'text', label: 'City' },
        { selector: '#state', value: '', type: 'select', label: 'State', 
          options: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'] },
        { selector: '#zip', value: '', type: 'text', label: 'ZIP Code' },
        { selector: 'textarea[name="additionalInfo"]', value: '', type: 'textarea', label: 'Additional Details' }
      ];
    } else if (domain === 'experian.com' || domain.endsWith('.experian.com')) {
      return [
        { selector: '#email', value: '', type: 'email', label: 'Email Address' },
        { selector: '#firstName', value: '', type: 'text', label: 'First Name' },
        { selector: '#lastName', value: '', type: 'text', label: 'Last Name' },
        { selector: '#ssn', value: '', type: 'password', label: 'Last 4 digits of SSN (Optional)' },
        { selector: '#phone', value: '', type: 'tel', label: 'Phone Number' },
        { selector: '#requestType', value: '', type: 'radio', label: 'Request Type',
          options: ['Do Not Sell My Personal Information', 'Delete My Personal Information', 'Access My Personal Information'] },
        { selector: 'textarea[name="comments"]', value: '', type: 'textarea', label: 'Comments' }
      ];
    } else if (domain === 'equifax.com' || domain.endsWith('.equifax.com')) {
      return [
        { selector: '#email', value: '', type: 'email', label: 'Email' },
        { selector: '#firstName', value: '', type: 'text', label: 'First Name' },
        { selector: '#lastName', value: '', type: 'text', label: 'Last Name' },
        { selector: '#dob', value: '', type: 'date', label: 'Date of Birth' },
        { selector: '#address', value: '', type: 'text', label: 'Current Address' },
        { selector: '#requestReason', value: '', type: 'select', label: 'Reason for Request',
          options: ['Remove My Data', 'Correct Information', 'Other'] },
        { selector: 'textarea[name="additionalInfo"]', value: '', type: 'textarea', label: 'Additional Information' }
      ];
    } else if (domain === 'spokeo.com' || domain.endsWith('.spokeo.com')) {
      return [
        { selector: '#email', value: '', type: 'email', label: 'Email' },
        { selector: '#fullName', value: '', type: 'text', label: 'Full Name' },
        { selector: '#profileUrl', value: '', type: 'text', label: 'URL of your Spokeo listing' },
        { selector: 'input[type="checkbox"][name="agreement"]', value: 'false', type: 'checkbox', label: 'I am requesting the removal of my own information' }
      ];
    } else if (domain === 'mylife.com' || domain.endsWith('.mylife.com')) {
      return [
        { selector: '#email', value: '', type: 'email', label: 'Email Address' },
        { selector: '#fullName', value: '', type: 'text', label: 'Full Name as it appears on MyLife' },
        { selector: '#age', value: '', type: 'number', label: 'Age' },
        { selector: '#city', value: '', type: 'text', label: 'City' },
        { selector: '#state', value: '', type: 'text', label: 'State' },
        { selector: '#profileUrl', value: '', type: 'text', label: 'MyLife Profile URL (if known)' },
        { selector: 'textarea[name="reason"]', value: '', type: 'textarea', label: 'Reason for Removal Request' }
      ];
    } else if (domain === 'intelius.com' || domain.endsWith('.intelius.com')) {
      return [
        { selector: '#email', value: '', type: 'email', label: 'Email Address' },
        { selector: '#firstName', value: '', type: 'text', label: 'First Name' },
        { selector: '#lastName', value: '', type: 'text', label: 'Last Name' },
        { selector: '#phone', value: '', type: 'tel', label: 'Phone Number' },
        { selector: '#address', value: '', type: 'text', label: 'Current Address' },
        { selector: '#listingUrl', value: '', type: 'text', label: 'URL to your listing (optional)' }
      ];
    } else {
      // Default fields that most opt-out forms have
      return [
        ...commonFields,
        { selector: 'input[name="phone"]', value: '', type: 'tel', label: 'Phone Number (Optional)' },
        { selector: 'textarea[name="additionalInfo"]', value: '', type: 'textarea', label: 'Additional Information' },
        { selector: 'input[type="checkbox"][name="consent"]', value: 'false', type: 'checkbox', label: 'I consent to the processing of my request' }
      ];
    }
  }
  
  /**
   * Update the automation configuration
   */
  updateConfig(newConfig: Partial<AutomationConfig>): void {
    // Sanitize and validate config values
    const sanitizedConfig: Partial<AutomationConfig> = {};
    
    if (typeof newConfig.headless === 'boolean') {
      sanitizedConfig.headless = newConfig.headless;
    }
    
    if (typeof newConfig.timeout === 'number' && newConfig.timeout > 0 && newConfig.timeout <= 120000) {
      sanitizedConfig.timeout = newConfig.timeout;
    }
    
    if (typeof newConfig.userAgent === 'string' && newConfig.userAgent.length <= 500) {
      sanitizedConfig.userAgent = newConfig.userAgent;
    }
    
    this.config = { ...this.config, ...sanitizedConfig };
    console.log('[AutomationService] Configuration updated:', this.config);
  }
}

// Create a singleton instance
export const automationService = new AutomationService();
