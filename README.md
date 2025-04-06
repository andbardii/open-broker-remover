# Open Broker Remover

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](https://opensource.org/licenses/MIT)
[![Maintenance](https://img.shields.io/badge/Maintained-Yes-brightgreen)](https://github.com/OpenBrokerRemover)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen)](https://github.com/OpenBrokerRemover/pulls)

Open Broker Remover è un progetto open-source in continuo sviluppo, nato per essere uno strumento gratuito e accessibile a chiunque. L'obiettivo è consentire la rimozione dei dati personali dai data broker in modo completamente locale e sicuro. Il progetto è pensato per garantire la massima privacy, evitando l'utilizzo di servizi cloud e mantenendo il controllo completo sui dati personali.

### 🛠️ In fase di sviluppo
Il progetto è ancora in fase di sviluppo ed è nato dal desiderio di costruire qualcosa di utile nel tempo extra. Ogni contributo, suggerimento o richiesta è non solo ben accetto, ma incoraggiato! Apri una pull request o crea una issue per proporre modifiche, aggiungere funzionalità o segnalare bug.

## Indice
- [Funzionalità Principali](#funzionalita-principali)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Esecuzione con Docker](#esecuzione-con-docker)
- [Sviluppo Locale](#sviluppo-locale)
- [Licenza](#licenza)

## Funzionalità Principali
- **Richiesta di Eliminazione Dati**: Gestisce automaticamente le richieste di cancellazione dei dati personali verso vari data broker.
- **Esecuzione in Locale**: Nessun dato viene inviato a server remoti, garantendo la totale privacy.
- **Gestione Efficiente**: Ottimizzazione dei processi per garantire velocità e affidabilità.
- **Compatibilità Multipiattaforma**: Supporta ambienti Windows, macOS e Linux tramite Docker.
- **Persistenza dei Dati**: Utilizza SQLite per salvare i dati in modo locale e sicuro.

## Tecnologie Utilizzate
Il progetto è costruito utilizzando le seguenti tecnologie:
- **Frontend**:
  - Vite
  - TypeScript
  - React
  - Shadcn-UI
  - Tailwind CSS
- **Backend**:
  - Node.js con Express
  - TypeScript
  - Better-SQLite3 per la gestione locale del database
  - Crittografia locale per la protezione dei dati sensibili
- **Containerizzazione**:
  - Docker e Docker Compose per la distribuzione

## Esecuzione con Docker
L'applicazione può essere facilmente eseguita utilizzando Docker, che incapsula sia il frontend che il backend in un unico container:

1. **Prerequisiti**:
   - Docker e Docker Compose installati sulla macchina

2. **Avvio dell'applicazione**:
   ```sh
   # Clona il repository
   git clone https://github.com/open-broker-remover/open-broker-remover.git
   cd open-broker-remover

   # Avvia l'applicazione con Docker Compose
   docker-compose up -d
   ```

3. **Accesso all'applicazione**:
   - Apri un browser e naviga a `http://localhost:3000`

4. **Gestione dei dati**:
   I dati sono persistenti grazie al volume Docker `open-broker-data` che viene creato automaticamente. Questo garantisce che i dati non vengano persi tra i riavvii del container.

## Sviluppo Locale

### Setup del Frontend e del Backend separati
Per lo sviluppo, puoi eseguire il frontend e il backend separatamente:

1. **Setup del Backend**:
   ```sh
   cd src/server
   npm install
   npm run dev
   ```

2. **Setup del Frontend**:
   ```sh
   # In una nuova finestra di terminale, nella directory principale
   npm install
   npm run dev
   ```

3. **Variabili d'ambiente**:
   Crea un file `.env` nella directory principale con:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

### Modifica del Codice
Puoi modificare il codice seguendo il classico flusso di lavoro Git o lavorando in locale.

#### Metodo Classico: Fork, Clone e Pull Request
1. **Fork del Repository**: Clicca su "Fork" nella pagina GitHub del progetto.
2. **Clonazione**:
   ```sh
   git clone https://github.com/<IL_TUO_USERNAME>/open-broker-remover.git
   ```
3. **Crea un Branch**:
   ```sh
   git checkout -b nome-del-branch
   ```
4. **Modifiche e Test**
5. **Commit e Push**:
   ```sh
   git add .
   git commit -m "Descrizione delle modifiche"
   git push origin nome-del-branch
   ```
6. **Pull Request**: Vai su GitHub e apri una pull request.

## Licenza
Questo progetto è distribuito sotto la licenza MIT.
