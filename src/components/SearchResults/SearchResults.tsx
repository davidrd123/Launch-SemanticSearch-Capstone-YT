'use client'

import * as React from 'react'
import cs from 'clsx'
import Image from 'next/image'
import Link from 'next/link'

import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import { SearchResultsList } from '@/components/SearchResultsList/SearchResultsList'
import { Search } from '@/lib/hooks/search'
import socialImage from '@/public/social.png'

import styles from './styles.module.css'

export const SearchResults: React.FC = () => {
  const { results, debouncedQuery, error, isEmpty, isLoading } =
    Search.useContainer()

  if (error) {
    return <div>Error loading results</div>
  }

  let content: React.ReactNode

  if ((isEmpty || !results) && !debouncedQuery) {
    content = <EmptyQuery />
  } else if (isLoading) {
    content = (
      <div className={styles.detail}>
        <LoadingSpinner loading={isLoading} />
      </div>
    )
  } else if (results) {
    if (isEmpty) {
      content = <EmptyResults />
    } else {
      content = <SearchResultsList results={results} />
    }
  }

  return <div className={cs(styles.searchResults)}>{content}</div>
}

export const EmptyQuery: React.FC = () => {
  const { setQuery, setDebouncedQuery } = Search.useContainer()

  const fakeNavigation = React.useCallback(
    (query: string) => {
      // router.push({
      //   pathname: '/',
      //   query: {
      //     query
      //   }
      // })
      setQuery(query)
      setDebouncedQuery(query)
    },
    [setQuery, setDebouncedQuery]
  )

  return (
    <div className={styles.emptyResults}>
      <p>Search any topic in the Launch School Presentations from 2020-2023.</p>
      {/* Make this link bold */}
      <p>
        Or check out my{' '}
        <a
          style={{ textDecoration: 'underline' }}
          href='https://launch-summarize-capstone-yt.streamlit.app/'
        >
          Streamlit app
        </a>{' '}
        to view summaries of the presentations made with GPT-3.5 & GPT-4{' '}
      </p>
      <p>
        Examples:{' '}
        <Link
          className='link'
          href='/?query=api+load+testing'
          onClick={(e) => {
            e.preventDefault()
            fakeNavigation('api load testing')
          }}
        >
          api load testing
        </Link>
        ,&nbsp;
        <Link
          className='link'
          href='/?query=graphql+observability'
          onClick={(e) => {
            e.preventDefault()
            fakeNavigation('graphql observability')
          }}
        >
          graphql observability
        </Link>
        ,&nbsp;
        <Link
          className='link'
          href='/?query=elastic+container+service'
          onClick={(e) => {
            e.preventDefault()
            fakeNavigation('elastic container service')
          }}
        >
          elastic container service
        </Link>
        ,&nbsp;
        <Link
          className='link'
          href='/?query=automated+canary+deployments'
          onClick={(e) => {
            e.preventDefault()
            fakeNavigation('automated canary deployments')
          }}
        >
          automated canary deployments
        </Link>
      </p>

      <div className={styles.socialImageWrapper}>
        <Image
          className={styles.socialImage}
          src={socialImage.src}
          alt='Search the All-In Podcast using AI-powered semantic search.'
          width={socialImage.width}
          height={socialImage.height}
          placeholder='blur'
          blurDataURL={socialImage.blurDataURL}
        />
      </div>
    </div>
  )
}

export const EmptyResults: React.FC = () => {
  return (
    <div className={styles.emptyResults}>
      <p>No results found. Try broadening your search.</p>
    </div>
  )
}
