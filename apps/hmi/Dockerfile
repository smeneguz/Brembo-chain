# Usa l'immagine ufficiale di Node.js come base
FROM node:20

# Imposta la directory di lavoro all'interno del container
WORKDIR /app

# Copia i file del progetto nell'immagine Docker
COPY . .

# Installa le dipendenze del progetto
RUN npm install

EXPOSE 5173

# Avvia l'applicazione
CMD ["npm", "run", "dev"]
