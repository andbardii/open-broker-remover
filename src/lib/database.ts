import { DataRequest, DataBroker } from './types';

// This is a mock implementation of SQLite for the frontend
// In a real implementation, this would use Electron's IPC to communicate with the backend
class DatabaseService {
  private requests: DataRequest[] = [];
  private dataBrokers: DataBroker[] = [];

  constructor() {
    // Initialize with real data broker information but no requests
    this.dataBrokers = [
      { id: '1', name: 'Acxiom', optOutUrl: 'https://www.acxiom.com/optout/' },
      { id: '2', name: 'BeenVerified', optOutUrl: 'https://www.beenverified.com/app/optout/search' },
      { id: '3', name: 'Spokeo', optOutUrl: 'https://www.spokeo.com/optout' },
      { id: '4', name: 'Intelius', optOutUrl: 'https://intelius.com/opt-out' },
      { id: '5', name: 'Whitepages', optOutUrl: 'https://www.whitepages.com/suppression-requests' },
      { id: '6', name: 'MyLife', optOutUrl: 'https://www.mylife.com/ccpa/index.pubview' },
      { id: '7', name: 'PeopleFinders', optOutUrl: 'https://www.peoplefinders.com/opt-out' },
      { id: '8', name: 'PeopleSmart', optOutUrl: 'https://www.peoplesmart.com/opt-out' },
      { id: '9', name: 'Radaris', optOutUrl: 'https://radaris.com/page/how-to-remove' },
      { id: '10', name: 'US Search', optOutUrl: 'https://www.ussearch.com/opt-out/' },
      { id: '11', name: 'Epsilon', optOutUrl: 'https://us.epsilon.com/consumer-information-privacy-request' },
      { id: '12', name: 'CoreLogic', optOutUrl: 'https://www.corelogic.com/privacy-center/' },
      { id: '13', name: 'LexisNexis', optOutUrl: 'https://optout.lexisnexis.com/' },
      { id: '14', name: 'FastPeopleSearch', optOutUrl: 'https://www.fastpeoplesearch.com/removal' },
      { id: '15', name: 'TruthFinder', optOutUrl: 'https://www.truthfinder.com/opt-out/' },
      { id: '16', name: 'ZabaSearch', optOutUrl: 'https://www.zabasearch.com/block_records/' },
      { id: '17', name: 'PeopleLookup', optOutUrl: 'https://www.peoplelookup.com/optout/' },
      { id: '18', name: 'PublicRecordsNow', optOutUrl: 'https://www.publicrecordsnow.com/optout/' },
      { id: '19', name: 'USPhoneBook', optOutUrl: 'https://www.usphonebook.com/opt-out' },
      { id: '20', name: 'ClustrMaps', optOutUrl: 'https://clustrmaps.com/bl/opt-out' },
      { id: '21', name: 'Instant Checkmate', optOutUrl: 'https://www.instantcheckmate.com/opt-out/' },
      { id: '22', name: 'Advanced Background Checks', optOutUrl: 'https://www.advancedbackgroundchecks.com/removal' },
      { id: '23', name: 'Addresses.com', optOutUrl: 'https://www.addresses.com/optout.php' },
      { id: '24', name: 'AnyWho', optOutUrl: 'https://www.anywho.com/optout' },
      { id: '25', name: 'ArrestFacts', optOutUrl: 'https://arrestfacts.com/optout' },
      { id: '26', name: 'Background Alert', optOutUrl: 'https://www.backgroundalert.com/optout' },
      { id: '27', name: 'BackgroundCheck.Run', optOutUrl: 'https://backgroundcheck.run/optout' },
      { id: '28', name: 'BlockShopper', optOutUrl: 'https://blockshopper.com/about/opt_out' },
      { id: '29', name: 'CallTruth', optOutUrl: 'https://calltruth.com/optout' },
      { id: '30', name: 'CheckPeople', optOutUrl: 'https://www.checkpeople.com/opt-out' },
      { id: '31', name: 'Clustrmap', optOutUrl: 'https://clustrmaps.com/bl/opt-out' },
      { id: '32', name: 'CocoFinder', optOutUrl: 'https://cocofinder.com/optout' },
      { id: '33', name: 'CyberBackgroundChecks', optOutUrl: 'https://www.cyberbackgroundchecks.com/removal' },
      { id: '34', name: 'Dynata', optOutUrl: 'https://www.dynata.com/opt-out/' },
      { id: '35', name: 'FamilyTreeNow', optOutUrl: 'https://www.familytreenow.com/optout' },
      { id: '36', name: 'FastBackgroundCheck', optOutUrl: 'https://www.fastbackgroundcheck.com/removal' },
      { id: '37', name: 'GoLookUp', optOutUrl: 'https://golookup.com/optout' },
      { id: '38', name: 'Homemetry', optOutUrl: 'https://homemetry.com/optout' },
      { id: '39', name: 'Innovis', optOutUrl: 'https://www.innovis.com/personal/optout' },
      { id: '40', name: 'IdTrue', optOutUrl: 'https://www.idtrue.com/optout' }
    ];
  }

  async getRequests(): Promise<DataRequest[]> {
    return this.requests;
  }

  async getRequestById(id: string): Promise<DataRequest | undefined> {
    return this.requests.find(request => request.id === id);
  }

  async createRequest(request: Omit<DataRequest, 'id' | 'dateCreated' | 'dateUpdated'>): Promise<DataRequest> {
    const newRequest: DataRequest = {
      ...request,
      id: (this.requests.length + 1).toString(),
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
    };
    
    this.requests.push(newRequest);
    return newRequest;
  }

  async updateRequest(id: string, updates: Partial<DataRequest>): Promise<DataRequest | undefined> {
    const index = this.requests.findIndex(request => request.id === id);
    if (index === -1) return undefined;
    
    this.requests[index] = {
      ...this.requests[index],
      ...updates,
      dateUpdated: new Date().toISOString(),
    };
    
    return this.requests[index];
  }

  async deleteRequest(id: string): Promise<boolean> {
    const index = this.requests.findIndex(request => request.id === id);
    if (index === -1) return false;
    
    this.requests.splice(index, 1);
    return true;
  }

  async getDataBrokers(): Promise<DataBroker[]> {
    return this.dataBrokers;
  }

  async findDataBrokersForEmail(email: string): Promise<DataBroker[]> {
    console.log(`Finding data brokers for email: ${email}`);
    
    // In a real implementation, this would use more sophisticated methods to determine
    // which data brokers likely have the user's information.
    // For now, we'll simulate by returning a subset of brokers
    
    // The number of data brokers to return (between 5 and 15)
    const numBrokers = Math.floor(Math.random() * 10) + 5;
    
    // Shuffle the data brokers array and take a random subset
    const shuffled = [...this.dataBrokers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numBrokers);
  }
}

export const db = new DatabaseService();
