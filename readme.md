<p align="center">
  <a href="https://launch-semantic-search-capstone-yt.vercel.app/">
    <img alt="Search the Launch School Capstone Presentations using AI" src="/public/social.jpg" width="600">
  </a>
</p>

# YouTube Semantic Search <!-- omit in toc -->

> OpenAI-powered semantic search for any YouTube playlist — featuring the [Launch School Capstone Presentations](https://launch-semantic-search-capstone-yt.vercel.app/)

[![Build Status](https://github.com/transitive-bullshit/yt-channel-search/actions/workflows/test.yml/badge.svg)](https://github.com/transitive-bullshit/yt-channel-search/actions/workflows/test.yml) [![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/yt-channel-search/blob/main/license) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

- [Intro](#intro)
- [How to get started](#how-to-get-started)
- [Example Queries](#example-queries)
- [Screenshots](#screenshots)
- [How It Works](#how-it-works)
- [Feedback](#feedback)
- [Credit](#credit)
- [License](#license)

## Intro


Derived from Travis Fischer's https://github.com/transitive-bullshit/yt-semantic-search, adapted to search the Launch School Capstone Presentations.

Complementary to this is an app David Dickinson put together to view summaries of the Capstone Projects made from the video transcripts with GPT-3.5 and GPT-4. [Check it out here](https://launchschool-capstone-summaries.vercel.app/). 

This project uses the latest models from [OpenAI](https://openai.com/) to build a semantic search index across every Capstone presentation from 2022 and 2023. It allows you to find the exact moments in each video where a topic was discussed with Google-level accuracy and find the exact clips you're interested in.

You can use it to power advanced search across _any YouTube channel or playlist_. In this case, we're focused on the [Launch School Capstone Presentations](https://launch-semantic-search-capstone-yt.vercel.app/), but you can easily adapt this project to search any YouTube channel or playlist.

## How to get started
- Clone the repository to your local machine.
- Navigate to the root directory of the repository in your terminal.
- Run the command `npm install` to install all the necessary dependencies.
- Run the command `npx tsx src/bin/resolve-yt-playlist.ts` to download the English transcripts for each episode of the target playlist (in this case, the All-In Podcast Episodes Playlist).
- Run the command `npx tsx src/bin/process-yt-playlist.ts` to pre-process the transcripts and fetch embeddings from OpenAI, then insert them into a Pinecone search index.
- You can now run the command `npx tsx src/bin/query.ts` to query the Pinecone search index.
(Optional) Run the command `npx tsx src/bin/generate-thumbnails.ts` to generate timestamped thumbnails of each video in the playlist. This step takes ~2 hours and requires a stable internet connection.
- The frontend of the project is a Next.js webapp deployed to Vercel that uses the Pinecone index as a primary data store. You can run the command npm run dev to start the development server and view the webapp locally.

Note that a few episodes may not have automated English transcriptions available, and that the project uses a hacky HTML scraping solution for this, so a better solution would be to use Whisper to transcribe the episode's audio. Also, the project support sorting by recency vs relevancy.

## Example Queries

- [api load testing](https://launch-semantic-search-capstone-yt.vercel.app/?query=api+load+testing)
- [graphql observability](https://launch-semantic-search-capstone-yt.vercel.app/?query=graphql+observability)
- [elastic container service](https://launch-semantic-search-capstone-yt.vercel.app/?query=elastic+container+service)
- [kubernetes vs docker swarm](https://launch-semantic-search-capstone-yt.vercel.app/?query=kubernetes+vs+docker+swarm)
- [automated canary deployments](https://launch-semantic-search-capstone-yt.vercel.app/?query=automated+canary+deployments)
- [feature flags](https://launch-semantic-search-capstone-yt.vercel.app/?query=feature+flags)

## Screenshots

<p align="center">
  <a href="https://all-in-on-ai.vercel.app">
    <img alt="Desktop light mode" src="/public/images/screenshot-desktop-light.png" width="45%">
  </a>
&nbsp; &nbsp; &nbsp; &nbsp;
  <a href="https://all-in-on-ai.vercel.app">
    <img alt="Desktop dark mode" src="/public/images/screenshot-desktop-dark.png" width="45%">
  </a>
</p>

## How It Works

Under the hood, it uses:

- [OpenAI](https://openai.com) - We're using the brand new [text-embedding-ada-002](https://openai.com/blog/new-and-improved-embedding-model/) embedding model, which captures deeper information about text in a latent space with 1536 dimensions
  - This allows us to go beyond keyword search and search by higher-level topics.
- [Pinecone](https://www.pinecone.io) - Hosted vector search which enables us to efficiently perform [k-NN searches](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) across these embeddings
- [Vercel](https://vercel.com) - Hosting and API functions
- [Next.js](https://nextjs.org) - React web framework

We use Node.js and the [YouTube API v3](https://developers.google.com/youtube/v3/getting-started) to fetch the videos of our target playlist. In this case, we're focused on the [Launch School Capstone](https://www.youtube.com/playlist?list=PLn5MTSAqaf8peDZQ57QkJBzewJU1aUokl), which contains 108 videos at the time of writing.

```bash
npx tsx src/bin/resolve-yt-playlist.ts
```

We download the English transcripts for each episode using a hacky HTML scraping solution, since the YouTube API doesn't allow non-OAuth access to captions. Note that a few episodes don't have automated English transcriptions available, so we're just skipping them at the moment. A better solution would be to use [Whisper](https://openai.com/blog/whisper/) to transcribe each episode's audio.

Once we have all of the transcripts and metadata downloaded locally, we pre-process each video's transcripts, breaking them up into reasonably sized chunks of ~100 tokens and fetch it's [text-embedding-ada-002](https://openai.com/blog/new-and-improved-embedding-model/) embedding from OpenAI. This results in ~200 embeddings per episode.

All of these embeddings are then upserted into a [Pinecone search index](https://www.pinecone.io) with a dimensionality of 1536. There are ~17,575 embeddings in total across ~108 episodes of the All-In Podcast.

```bash
npx tsx src/bin/process-yt-playlist.ts
```

Once our Pinecone search index is set up, we can start querying it either via the webapp or via the example CLI:

```bash
npx tsx src/bin/query.ts
```

We also support generating timestamp-based thumbnails of every YouTube video in the playlist. Thumbnails are generated using [headless Puppeteer](https://pptr.dev) and are uploaded to [Google Cloud Storage](https://cloud.google.com/storage). We also post-process each thumbnail with [lqip-modern](https://github.com/transitive-bullshit/lqip-modern) to generate nice preview placeholder images.

If you want to generate thumbnails (optional), run:

```bash
npx tsx src/bin/generate-thumbnails.ts
```

Note that thumbnail generation takes ~2 hours and requires a pretty stable internet connection.

The frontend is a [Next.js](https://nextjs.org) webapp deployed to [Vercel](https://vercel.com) that uses our Pinecone index as a primary data store.

## Feedback

Have an idea on how this webapp could be improved? Find a particularly fun search query?

Feel free to send me feedback, either on [GitHub](https://github.com/davidrd123/Launch-SemanticSearch-Capstone-YT/issues/new) or [Twitter](https://twitter.com/davidrd123). 💯

## Credit

- Inspired by [Riley Tomasek's project](https://twitter.com/rileytomasek/status/1603854647575384067) for searching the [Huberman YouTube Channel](https://www.youtube.com/@hubermanlab)
- Translated from Transitive Bullshit's [All-In Podcast Semantic Search](https://all-in-on-ai.vercel.app) project
- Note that this project is not affiliated with Launch School. It just pulls data from their vidoes [YouTube channel](https://www.youtube.com/@launchschool) via a [playlist I set up](https://youtube.com/playlist?list=PLc9UY1kQQKC7hcWY-ObhWZiUI59CDWomy) and processes it using AI.

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

The API and server costs add up over time, so if you can spare it, [sponsoring on Github](https://github.com/sponsors/davidrd123) is greatly appreciated. 💕
