import * as React from 'react'
import { InferGetStaticPropsType } from 'next'

import * as config from '@/lib/config'
import { Layout } from '@/components/Layout/Layout'
import { Markdown } from '@/components/Markdown/Markdown'
import { markdownToHtml } from '@/server/markdown-to-html'

import styles from './styles.module.css'

const markdownContent = `
## Intro

Derived from [Travis Fischer's All-In Podcast Semantic Search](https://github.com/transitive-bullshit/yt-semantic-search), adapted to search Launch School Youtube Videos of Capstone Project Presentations.

Complementary to this is an app David Dickinson put together to view summaries of the Capstone Projects made from the video transcripts with GPT-3.5 and GPT-4. [Check it out here](https://launchschool-capstone-summaries.vercel.app/). 

This project uses the latest models from [OpenAI](https://openai.com/) to build a semantic search index across every Capstone presentation from 2022 and 2023. It allows you to find the exact moments in each video where a topic was discussed with Google-level accuracy and find the exact clips you're interested in.

You can use it to power advanced search across _any YouTube channel or playlist_. 

## Example Queries

- [api load testing](/?query=api+load+testing)
- [graphql observability](/?query=graphql+observability)
- [elastic container service](/?query=elastic+container+service)
- [automated canary deployments](/?query=automated+canary+deployments)
- [kubernetes vs docker swarm](/?query=kubernetes+vs+docker+swarm)
- [websockets](/?query=websockets)
- [implementation challenges future work design decisions](/?query=implementation+challenges+future+work+design+decisions)


## How It Works

This project is [open source](${config.githubRepoUrl})! 😄

Under the hood, it uses:

- [OpenAI](https://openai.com) - We're using the brand new [text-embedding-ada-002](https://openai.com/blog/new-and-improved-embedding-model/) embedding model, which captures deeper information about text in a latent space with 1536 dimensions
  - This allows us to go beyond keyword search and search by higher-level topics.
- [Pinecone](https://www.pinecone.io) - Hosted vector search which enables us to efficiently perform [k-NN searches](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) across these embeddings
- [Vercel](https://vercel.com) - Hosting and API functions
- [Next.js](https://nextjs.org) - React web framework

We use Node.js and the [YouTube API v3](https://developers.google.com/youtube/v3/getting-started) to fetch the videos of our target playlist. In this case, we're focused on the [All-In Podcast Episodes Playlist](https://www.youtube.com/playlist?list=PLn5MTSAqaf8peDZQ57QkJBzewJU1aUokl), which contains 108 videos at the time of writing.

\`\`\`bash
npx tsx src/bin/resolve-yt-playlist.ts
\`\`\`

We download the English transcripts for each episode using a hacky HTML scraping solution, since the YouTube API doesn't allow non-OAuth access to captions. Note that a few episodes don't have automated English transcriptions available, so we're just skipping them at the moment. A better solution would be to use [Whisper](https://openai.com/blog/whisper/) to transcribe each episode's audio.

Once we have all of the transcripts and metadata downloaded locally, we pre-process each video's transcripts, breaking them up into reasonably sized chunks of ~100 tokens and fetch it's [text-embedding-ada-002](https://openai.com/blog/new-and-improved-embedding-model/) embedding from OpenAI. This results in ~200 embeddings per episode.

All of these embeddings are then upserted into a [Pinecone](https://www.pinecone.io) index with a dimensionality of 1536. There are ~17,575 embeddings in total across ~108 episodes of the All-In Podcast.

\`\`\`bash
npx tsx src/bin/process-yt-playlist.ts
\`\`\`

Once our Pinecone search index is set up, we can start querying it either via the webapp or via the example CLI:

\`\`\`bash
npx tsx src/bin/query.ts
\`\`\`

We also support generating timestamp-based thumbnails of every YouTube video in the playlist. Thumbnails are generated using [headless Puppeteer](https://pptr.dev) and are uploaded to [Google Cloud Storage](https://cloud.google.com/storage). We also post-process each thumbnail with [lqip-modern](https://github.com/transitive-bullshit/lqip-modern) to generate nice preview placeholder images.

If you want to generate thumbnails (optional), run:

\`\`\`bash
npx tsx src/bin/generate-thumbnails.ts
\`\`\`

Note that thumbnail generation takes ~2 hours and requires a pretty stable internet connection.

The frontend is a [Next.js](https://nextjs.org) webapp deployed to [Vercel](https://vercel.com) that uses our Pinecone index as a primary data store.

## Feedback

Have an idea on how this webapp could be improved? Find a particularly fun search query?

Feel free to send me feedback, either on [[GitHub](https://github.com/davidrd123/Launch-SemanticSearch-Capstone-YT/issues/new) or [Twitter](https://twitter.com/davidrd123). 💯

## License

This project is [open source](${config.githubRepoUrl}). MIT © [${config.author}](${config.twitterUrl})

**This project is not affiliated with Launch School.** It just pulls data from their videos and transcripts.
`

export default function AboutPage({
  content
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout>
      <div className={styles.aboutPage}>
        <div className={styles.meta}>
          <h1 className={styles.title}>{config.title}</h1>
          <p className={styles.detail}>
            <a
              className='link'
              href={config.twitterUrl}
              title={`Twitter ${config.twitter}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              By Travis Fischer
            </a>
          </p>
        </div>

        <Markdown content={content} />
      </div>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const content = await markdownToHtml(markdownContent)

  return {
    props: {
      content
    }
  }
}
