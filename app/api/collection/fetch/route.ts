import { NextResponse } from 'next/server'
import { SourceType } from '@/types/collection'
import Parser from 'rss-parser'

const parser = new Parser()

// TODO: Success to fetch the content from the official document
async function fetchOfficialDoc(url: string) {
  return {
    content: `This is the content fetched from ${url}...`,
    metadata: {
      title: 'Document Title',
      lastUpdated: new Date().toISOString(),
    },
  }
}

async function fetchRssBlog(url: string) {
  try {
    const feed = await parser.parseURL(url)

    // fetch the latest 10 posts
    const latestPosts = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      link: item.link,
      content: item.content || item.contentSnippet,
      pubDate: item.pubDate || item.isoDate,
    }))

    // build the content
    const content = latestPosts
      .map(
        (post) => `
# ${post.title}

Published at: ${post.pubDate}
Original link: ${post.link}

${post.content}
    `
      )
      .join('\n\n---\n\n')

    return {
      content,
      metadata: {
        feedTitle: feed.title,
        feedDescription: feed.description,
        lastUpdated: new Date().toISOString(),
        postCount: latestPosts.length,
        posts: latestPosts,
      },
    }
  } catch (error) {
    throw new Error(`Failed to parse RSS: ${(error as Error).message}`)
  }
}

// TODO: Success to fetch the content from the Github repository
async function fetchGithub(url: string) {
  return {
    content: `This is the content fetched from ${url}...`,
    metadata: {
      repoName: 'Repository Name',
      lastUpdated: new Date().toISOString(),
    },
  }
}

export async function POST(request: Request) {
  try {
    const { sourceType, url } = await request.json()

    let content
    switch (sourceType as SourceType) {
      case 'OFFICIAL_DOC':
        content = await fetchOfficialDoc(url)
        break
      case 'RSS_BLOG':
        content = await fetchRssBlog(url)
        break
      case 'GITHUB':
        content = await fetchGithub(url)
        break
      default:
        throw new Error('Unsupported collection source type')
    }

    return NextResponse.json({ success: true, ...content })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to fetch content',
      },
      { status: 400 }
    )
  }
}
