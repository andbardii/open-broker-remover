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
- [Come Modificare il Codice](#come-modificare-il-codice)
- [Esecuzione Locale](#esecuzione-locale)
- [Licenza](#licenza)

## Funzionalità Principali
- **Richiesta di Eliminazione Dati**: Gestisce automaticamente le richieste di cancellazione dei dati personali verso vari data broker.
- **Esecuzione in Locale**: Nessun dato viene inviato a server remoti, garantendo la totale privacy.
- **Gestione Efficiente**: Ottimizzazione dei processi per garantire velocità e affidabilità.
- **Compatibilità Multipiattaforma**: Supporta ambienti Windows, macOS e Linux.

## Tecnologie Utilizzate
Il progetto è costruito utilizzando le seguenti tecnologie:
- Vite
- TypeScript
- React
- Shadcn-UI
- Tailwind CSS
- Better-SQLite3 per la gestione locale del database
- Crittografia locale per la protezione dei dati sensibili

## Come Modificare il Codice

Puoi contribuire al progetto seguendo il classico flusso di lavoro Git o lavorando in locale.

### Metodo Classico: Fork, Clone e Pull Request
1. **Fork del Repository**: Clicca su "Fork" nella pagina GitHub del progetto.
2. **Clonazione**:
   ```sh
   git clone https://github.com/<IL_TUO_USERNAME>/open-broker-remover.git
   ```
3. **Crea un Branch**:
   ```sh
   git checkout -b nome-del-branch
   ```
4. **Modifiche e Test**:
   ```sh
   npm install
   npm run dev
   ```
5. **Commit e Push**:
   ```sh
   git add .
   git commit -m "Descrizione delle modifiche"
   git push origin nome-del-branch
   ```
6. **Pull Request**: Vai su GitHub e apri una pull request.

### Modifica Locale Diretta
Clona il repository principale per lavorare in locale:
```sh
git clone https://github.com/open-broker-remover/open-broker-remover.git
cd open-broker-remover
npm install
npm run dev
```

Se utilizzi Lovable, lavora in locale senza sincronizzazione cloud per garantire la privacy.

## Esecuzione Locale
L'applicazione è progettata per funzionare esclusivamente in locale. Non sono presenti funzionalità online o di sincronizzazione con server remoti. Assicurati che il progetto non venga distribuito pubblicamente per garantire la protezione dei dati.

## Licenza
Questo progetto è distribuito sotto la licenza MIT.
