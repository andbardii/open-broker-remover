import { AutomationConfig, FormField, AutomationResult, BrokerCategory, RemovalProgress } from './types';
import { securityService } from './security';
import { db } from './database';

// Define request metadata interface
interface RequestMetadata {
  progress?: RemovalProgress;
  category?: string;
  difficulty?: string;
  optOutUrl?: string;
  processedAt?: string;
  screenshot?: string;
  [key: string]: unknown;
}

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

// Main automation service for handling automated data removal requests
class AutomationService {
  private config: AutomationConfig = {
    headless: true,
    timeout: 30000
  };

  // Configure the automation service
  configure(config: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('Automation service configured:', this.config);
  }

  // Get the current configuration
  getConfig(): AutomationConfig {
    return { ...this.config };
  }

  // Detect form fields on a webpage
  async detectFormFields(url: string): Promise<FormField[]> {
    console.log(`Detecting form fields on ${url}`);
    
    // Validate URL before proceeding
    const sanitizedUrl = validateAndSanitizeUrl(url);
    if (!sanitizedUrl) {
      throw new Error('Invalid or disallowed URL');
    }
    
    // Simulate detection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return simulated form fields based on URL
    const fields: FormField[] = [
      {
        selector: 'email-field',
        type: 'email',
        label: 'Email Address',
        value: '' // Empty value to be filled by the form
      },
      {
        selector: 'full-name',
        type: 'text',
        label: 'Full Name',
        value: ''
      },
      {
        selector: 'confirmation-check',
        type: 'checkbox',
        label: 'I confirm this is my data',
        value: 'true'
      }
    ];
    
    // Add more fields for specific domains
    if (url.includes('mylife.com')) {
      fields.push({
        selector: 'remove-reason',
        type: 'select',
        label: 'Reason for removal',
        value: '',
        options: ['Privacy concerns', 'Security issues', 'Harassment', 'Other']
      });
    }
    
    return fields;
  }

  // Send automated request to a data broker
  async sendRequest(url: string, formData: Record<string, string>): Promise<AutomationResult> {
    console.log(`Sending automated request to ${url}`, formData);
    
    // Validate URL before proceeding
    const sanitizedUrl = validateAndSanitizeUrl(url);
    if (!sanitizedUrl) {
      return {
        success: false,
        message: 'Invalid or disallowed URL',
        timestamp: new Date().toISOString()
      };
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate a fake screenshot (base64 data)
    const screenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    
    // Simulate a successful request
    return {
      success: true,
      message: `Successfully sent request to ${url}`,
      timestamp: new Date().toISOString(),
      screenshot: screenshot
    };
  }

  // Fill form using automation (simulated for demo)
  async fillForm(url: string, fields: FormField[]): Promise<AutomationResult> {
    // This is a mock implementation - in a real app, this would use a headless browser
    console.log(`Simulating form fill at ${url} with ${fields.length} fields`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate a successful form submission
    return {
      success: true,
      message: `Successfully submitted form to ${url}`,
      timestamp: new Date().toISOString()
    };
  }

  // Process automated request to a data broker
  async processBrokerRequest(requestId: string, userEmail: string): Promise<AutomationResult> {
    try {
      // Get the request details
      const request = await db.getRequestById(requestId);
      if (!request) {
        return {
          success: false,
          message: `Request ${requestId} not found`,
          timestamp: new Date().toISOString()
        };
      }

      // Parse metadata if it exists
      let metadata: RequestMetadata = {};
      if (request.metadata) {
        try {
          metadata = JSON.parse(request.metadata);
        } catch (e) {
          console.error('Failed to parse request metadata:', e);
        }
      }

      const optOutUrl = metadata.optOutUrl || '';
      if (!optOutUrl) {
        return {
          success: false,
          message: 'No opt-out URL provided in request metadata',
          timestamp: new Date().toISOString()
        };
      }

      // Define removal progress steps
      const removalProgress: RemovalProgress = {
        steps: [
          { name: 'Initialization', status: 'completed', startTime: new Date().toISOString(), completionTime: new Date().toISOString() },
          { name: 'Form Detection', status: 'pending' },
          { name: 'Form Submission', status: 'pending' },
          { name: 'Verification', status: 'pending' },
          { name: 'Confirmation', status: 'pending' }
        ],
        startedAt: new Date().toISOString(),
        currentStep: 1,
        estimatedCompletionDate: this.calculateEstimatedCompletionDate(metadata.difficulty as string),
        lastUpdated: new Date().toISOString()
      };

      // Update metadata with progress
      metadata.progress = removalProgress;
      
      // Update the request with initial progress
      await db.updateRequest(requestId, {
        status: 'sent',
        metadata: JSON.stringify(metadata)
      });

      // Simulate form detection step
      removalProgress.steps[1].status = 'in-progress';
      removalProgress.steps[1].startTime = new Date().toISOString();
      removalProgress.currentStep = 2;
      metadata.progress = removalProgress;
      
      await db.updateRequest(requestId, {
        metadata: JSON.stringify(metadata)
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set form detection as completed
      removalProgress.steps[1].status = 'completed';
      removalProgress.steps[1].completionTime = new Date().toISOString();
      metadata.progress = removalProgress;
      
      await db.updateRequest(requestId, {
        metadata: JSON.stringify(metadata)
      });

      // Prepare the form fields based on broker type
      const formFields = this.generateFormFields(request.brokerName, userEmail, metadata.category as BrokerCategory);
      
      // Form submission step
      removalProgress.steps[2].status = 'in-progress';
      removalProgress.steps[2].startTime = new Date().toISOString();
      removalProgress.currentStep = 3;
      metadata.progress = removalProgress;
      
      await db.updateRequest(requestId, {
        metadata: JSON.stringify(metadata)
      });
      
      // Simulate the form submission
      const formResult = await this.fillForm(optOutUrl, formFields);
      
      if (formResult.success) {
        removalProgress.steps[2].status = 'completed';
        removalProgress.steps[2].completionTime = new Date().toISOString();
      } else {
        removalProgress.steps[2].status = 'failed';
        removalProgress.steps[2].completionTime = new Date().toISOString();
        removalProgress.steps[2].notes = formResult.message;
        
        metadata.progress = removalProgress;
        await db.updateRequest(requestId, {
          metadata: JSON.stringify(metadata)
        });
        
        return {
          success: false,
          message: `Failed to submit form: ${formResult.message}`,
          timestamp: new Date().toISOString()
        };
      }
      
      // Verification step
      removalProgress.steps[3].status = 'in-progress';
      removalProgress.steps[3].startTime = new Date().toISOString();
      removalProgress.currentStep = 4;
      metadata.progress = removalProgress;
      
      await db.updateRequest(requestId, {
        metadata: JSON.stringify(metadata)
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set verification as completed
      removalProgress.steps[3].status = 'completed';
      removalProgress.steps[3].completionTime = new Date().toISOString();
      
      // Confirmation step with automated re-verification scheduling
      removalProgress.steps[4].status = 'in-progress';
      removalProgress.steps[4].startTime = new Date().toISOString();
      removalProgress.currentStep = 5;
      
      // Schedule a re-verification based on broker difficulty
      const verificationDate = this.scheduleReverification(metadata.difficulty as string);
      removalProgress.steps[4].notes = `Scheduled re-verification for ${verificationDate.toLocaleDateString()}`;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Complete the confirmation step
      removalProgress.steps[4].status = 'completed';
      removalProgress.steps[4].completionTime = new Date().toISOString();
      removalProgress.completedAt = new Date().toISOString();
      
      metadata.progress = removalProgress;
      metadata.processedAt = new Date().toISOString();
      
      // Update the request with completed status
      await db.updateRequest(requestId, {
        status: 'responded',
        metadata: JSON.stringify(metadata),
        responseContent: `Automated removal request processed. A follow-up verification has been scheduled for ${verificationDate.toLocaleDateString()}.`
      });
      
      return {
        success: true,
        message: 'Automated removal request completed successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in processBrokerRequest:', error);
      return {
        success: false,
        message: `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Generate appropriate form fields based on broker type
  private generateFormFields(brokerName: string, userEmail: string, category: BrokerCategory): FormField[] {
    const fields: FormField[] = [
      {
        selector: 'input[type="email"], input[name="email"]',
        value: userEmail,
        type: 'email'
      }
    ];
    
    // Add specific fields based on broker category
    switch (category) {
      case 'people-search':
        fields.push(
          { 
            selector: 'input[name="firstName"], input[name="first_name"]', 
            value: 'John', 
            type: 'text' 
          },
          { 
            selector: 'input[name="lastName"], input[name="last_name"]', 
            value: 'Doe', 
            type: 'text' 
          },
          { 
            selector: 'input[name="optout"], input[type="checkbox"]', 
            value: 'true', 
            type: 'checkbox' 
          }
        );
        break;
      case 'marketing':
        fields.push(
          { 
            selector: 'input[name="unsubscribe"], input[name="opt_out"]', 
            value: 'true', 
            type: 'checkbox' 
          },
          { 
            selector: 'select[name="reason"]', 
            value: 'privacy', 
            type: 'select',
            options: ['privacy', 'spam', 'other']
          }
        );
        break;
      case 'credit-reporting':
        fields.push(
          { 
            selector: 'input[name="ssn"], input[name="social_security"]', 
            value: '999-99-9999', // Dummy value for demo
            type: 'text' 
          },
          { 
            selector: 'input[name="consent"], input[name="agreement"]', 
            value: 'true', 
            type: 'checkbox' 
          }
        );
        break;
      default:
        // Generic fields for other categories
        fields.push(
          { 
            selector: 'input[name="name"], input[name="full_name"]', 
            value: 'John Doe', 
            type: 'text' 
          },
          { 
            selector: 'button[type="submit"], input[type="submit"]', 
            value: '', 
            type: 'button' 
          }
        );
    }
    
    return fields;
  }

  // Calculate estimated completion date based on broker difficulty
  private calculateEstimatedCompletionDate(difficulty: string): string {
    const now = new Date();
    let daysToAdd = 7; // Default: 1 week
    
    switch (difficulty) {
      case 'easy':
        daysToAdd = 3;
        break;
      case 'medium':
        daysToAdd = 14;
        break;
      case 'hard':
        daysToAdd = 30;
        break;
    }
    
    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString();
  }

  // Schedule re-verification based on broker difficulty
  private scheduleReverification(difficulty: string): Date {
    const now = new Date();
    let daysToAdd = 30; // Default: 1 month
    
    switch (difficulty) {
      case 'easy':
        daysToAdd = 30;
        break;
      case 'medium':
        daysToAdd = 60;
        break;
      case 'hard':
        daysToAdd = 90;
        break;
    }
    
    now.setDate(now.getDate() + daysToAdd);
    return now;
  }

  // Process multiple requests in batch
  async processBatchRequests(requestIds: string[], userEmail: string): Promise<{
    success: boolean;
    completed: string[];
    failed: string[];
    message: string;
  }> {
    const results = {
      success: true,
      completed: [] as string[],
      failed: [] as string[],
      message: ''
    };

    for (const requestId of requestIds) {
      const result = await this.processBrokerRequest(requestId, userEmail);
      if (result.success) {
        results.completed.push(requestId);
    } else {
        results.failed.push(requestId);
        results.success = false;
      }
    }

    results.message = `Completed ${results.completed.length} out of ${requestIds.length} requests.`;
    if (results.failed.length > 0) {
      results.message += ` Failed: ${results.failed.length}.`;
    }

    return results;
  }
}

// Create a singleton instance
export const automationService = new AutomationService();
