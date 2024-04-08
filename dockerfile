FROM node:latest

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto 3000
EXPOSE 3000

# Inicia la aplicación
CMD ["npm", "run", "dev"]
