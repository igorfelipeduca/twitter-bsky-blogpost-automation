# Twitter/Bluesky Blogpost Automation

This project automates the process of creating blog posts and tweeting them using Fastify, MongoDB, the Twitter API and the Bluesky API.

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

3.1. If you're willing to automate your twitter posts, create a `.env` file in the root directory and add the following environment variables:

```env
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
TWITTER_BEARER_TOKEN=
TWITTER_OAUTH_CLIENT_KEY=
TWITTER_OAUTH_CLIENT_SECRET=
TWITTER_OAUTH_CALLBACK_URL=
TWITTER_ACCESS_TOKEN=
```

You can obtain these keys and tokens from the Twitter Developer Dashboard.

3.2. If you're willing to automate your bluesky posts, create a `.env` file in the root directory and add the following environment variables:

```env
BSKY_HANDLE=
BSKY_PASSWORD=
```

These keys are the login information you use to sign in your account.

## Running the Project

1. Start the server:

   ```sh
   yarn dev
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

## Twitter authentication

1. Navigate to `http://localhost:8000/auth/twitter` to initiate the Twitter OAuth flow.
2. After successful authentication, you will be redirected to the callback URL, and your access token will be
   displayed in the browser. Copy it and paste in the .env `TWITTER_ACCESS_TOKEN`.

## Bsky authentication

Once you've passed all required bsky envs (handle and password) you're already good to go.

## Using Ngrok for Local Development (twitter-only)

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

## Postman collection

```json
{
  "info": {
    "_postman_id": "d120d597-833b-4264-903e-03fc3ee88ee2",
    "name": "Twitter/Bsky BlogPost Scheduler",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    "_exporter_id": "10880151",
    "_collection_link": "https://igorfelipeduca.postman.co/workspace/Duca's-Workspace~4a387d03-407e-4328-8f39-876d5a45807b/collection/10880151-d120d597-833b-4264-903e-03fc3ee88ee2?action=share&source=collection_link&creator=10880151"
  },
  "item": [
    {
      "name": "Posts",
      "item": [
        {
          "name": "Create post",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"prompt\": \"escreva um post curto em portugues, quero que esse post tenha um formato adequado para tweets. esse post precisa falar sobre IA na vida das pessoas\",\n  \"postDate\": \"2024-08-30T21:53:56.349056Z\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8000/posts/create",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["posts", "create"]
            }
          },
          "response": []
        },
        {
          "name": "Add post to database",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"\",\n  \"content\": \"testando\",\n  \"hashtags\": [],\n  \"postDate\": \"2024-08-30T21:53:56.349056Z\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8000/posts/add",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["posts", "add"]
            }
          },
          "response": []
        },
        {
          "name": "Retrieve all posts",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:8000/posts",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["posts"]
            }
          },
          "response": []
        },
        {
          "name": "Edit post",
          "request": {
            "method": "PUT",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"content\": \"testando api ao vivo\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8000/posts/:id",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["posts", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "66d23e855cdafd5df55f19ba"
                }
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Twitter",
      "item": [
        {
          "name": "Tweet post",
          "request": {
            "method": "POST",
            "header": [],
            "url": {
              "raw": "http://localhost:8000/posts/:id/tweet",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["posts", ":id", "tweet"],
              "variable": [
                {
                  "key": "id",
                  "value": "66d23e855cdafd5df55f19ba"
                }
              ]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Bsky",
      "item": [
        {
          "name": "Post on Bsky",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"content\": \"golang, aka go, is considered a procedural language because it follows a step-by-step approach to break down a task into a collection of variables, procedures, and routines, or functions. this means, in go, blocks of code are organized into procedures (functions) that can be used and reused, making it easier to debug and maintain. also, go has a strong focus on concurrency, which is a big plus for procedural programming. so, yeah, that's why go is seen as a procedural language. remember, it's not just about the language, it's about how you use it.\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8000/bsky/post",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["bsky", "post"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "AI",
      "item": [
        {
          "name": "Generate text with GPT",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"prompt\": \"please generate a thread explaining the decentralized architecture of the bluesky network. keep the text casual and concise, using only lowercase. focus on how the architecture empowers users and promotes a more open internet. finish the thread with a question to engage followers.\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "http://localhost:8000/gpt/generate",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["gpt", "generate"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Threads",
      "item": [
        {
          "name": "Post bsky thread",
          "request": {
            "method": "POST",
            "header": [],
            "url": {
              "raw": "http://localhost:8000/bsky/thread",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8000",
              "path": ["bsky", "thread"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Hello",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000"
        }
      },
      "response": []
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "packages": {},
        "exec": [""]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "packages": {},
        "exec": [""]
      }
    }
  ]
}
```

## License

This project is licensed under the MIT License.
