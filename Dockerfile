# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.18.2

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set the working directory
WORKDIR /app

# Copy the entire project (including tsconfig.json) into the container
COPY . .

# Install dependencies
RUN npm install

RUN npm install -g @nestjs/cli

################################################################################
# Create a stage for installing production dependecies.
FROM base as deps

# Download dependencies as a separate step to take advantage of Docker's caching.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

################################################################################
# Create a stage for building the application.
FROM deps as build

# Download additional development dependencies before building, if needed
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN npm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Copy production dependencies and the built app from the previous stages
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Expose the port that the application listens on.
EXPOSE 3001

# Run the application.
CMD [ "sh", "-c", "npm run start" ]
