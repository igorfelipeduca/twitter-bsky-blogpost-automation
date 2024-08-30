# Twitter Blogpost Automation

This project automates the process of creating blog posts and tweeting them using Fastify, MongoDB, and the Twitter API.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Twitter Developer Account
- Docker
- Docker Compose
- Ngrok (for local development)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/twitter-blogpost-automation.git
   cd twitter-blogpost-automation
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/yourdbname
   TWITTER_API_KEY=your-twitter-api-key
   TWITTER_API_SECRET=your-twitter-api-secret
   TWITTER_ACCESS_TOKEN=your-twitter-access-token
   TWITTER_ACCESS_SECRET=your-twitter-access-secret
   TWITTER_BEARER_TOKEN=your-twitter-bearer-token
   OPENAI_API_KEY=your-openai-api-key
   TWITTER_OAUTH_CLIENT_KEY=your-twitter-client-key
   TWITTER_OAUTH_CLIENT_SECRET=your-twitter-client-secret
   TWITTER_OAUTH_CALLBACK_URL=http://localhost:8000/callback
   ```

   You can obtain these keys and tokens from the Twitter Developer Dashboard.

## Running the Project

1. Start the server:

   ```sh
   npm start
   ```

2. The server will be running at `http://localhost:8000`.

## Running with Docker Compose

1. Ensure you have Docker and Docker Compose installed on your machine.

2. Start the services:

   ```sh
   docker-compose up --build
   ```

3. The local MongoDB server will be running at `http://localhost:27017`.

## Authentication

1. Navigate to `http://localhost:8000/auth/twitter` to initiate the Twitter OAuth flow.
2. After successful authentication, you will be redirected to the callback URL, and your access token will be
   displayed in the browser. Copy it and paste in the .env `TWITTER_ACCESS_TOKEN`.

## Using Ngrok for Local Development

To use Ngrok for local development, follow these steps:

1. Download and install Ngrok from [ngrok.com](https://ngrok.com/).

2. Start Ngrok to create a tunnel to your local server:

   ```sh
   ngrok http 8000
   ```

3. Ngrok will provide a public URL (e.g., `https://abcd1234.ngrok.io`). Use this URL as the callback URL in your Twitter Developer Dashboard:

   ```env
   TWITTER_OAUTH_CALLBACK_URL=https://abcd1234.ngrok.io/callback
   ```

4. Update your `.env` file with the new callback URL.

## Endpoints

### Create a New Post

- **URL:** `/posts/add`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "title": "Your Post Title",
    "content": "Your post content",
    "hashtags": ["tag1", "tag2"]
  }
  ```
- **Response:**
  ```json
  {
    "message": "Post created successfully",
    "post": { ... }
  }
  ```

### Create a New Post Using GPT

- **URL:** `/posts/create`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "prompt": "Your GPT prompt"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Post created successfully",
    "post": { ... }
  }
  ```

### Tweet a Post

- **URL:** `/posts/:id/tweet`
- **Method:** `POST`
- **Response:**
  ```json
  {
    "message": "Successfully posted to Twitter"
  }
  ```

### Get Recent Posts

- **URL:** `/posts`
- **Method:** `GET`
- **Response:**
  ```json
  [
    { ... },
    { ... }
  ]
  ```

## License

This project is licensed under the MIT License.
