# Use an official Node.js runtime as a parent image
FROM node:20

WORKDIR /rubyapp

# Copy the package.json and package-lock.json files from the frontend directory
COPY /package*.json ./

# Install dependencies
RUN npm install --ignore-platform

# Copy the rest of the application code
COPY . .

# Expose the port for the frontend development server
EXPOSE 5173

# Serve the application
CMD ["npm", "run", "dev"]
