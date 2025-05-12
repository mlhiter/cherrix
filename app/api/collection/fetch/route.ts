import { NextResponse } from 'next/server'
import { SourceType } from '@/types/collection'
import Parser from 'rss-parser'
import * as cheerio from 'cheerio'
import { Octokit } from '@octokit/rest'

const parser = new Parser()
const octokit = new Octokit()

// TODO: fetch the content from the official document
async function fetchOfficialDoc(url: string) {
  try {
    const baseUrl = new URL(url).origin
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    $('script, style, nav, footer, header, .sidebar, .menu, .navigation, .ad, .ads, .advertisement').remove()

    const contentHtml =
      $('main, article, .content, #content, .documentation, .doc-content, .markdown-body').html() ||
      $('body').html() ||
      ''

    const title = $('h1, .title, .header h1, .doc-title').first().text().trim() || $('title').text().trim()

    const contentWithFixedLinks = contentHtml.replace(/href=(["'])(\/[^"']+)\1/g, (match, quote, path) => {
      return `href=${quote}${baseUrl}${path}${quote}`
    })

    let lastUpdated = null
    const dateSelectors = [
      '.last-updated',
      '.updated-date',
      '.modified-date',
      'time',
      'meta[property="article:modified_time"]',
      'meta[name="last-modified"]',
    ]

    for (const selector of dateSelectors) {
      const dateElement = $(selector)
      if (dateElement.length) {
        if (selector.startsWith('meta')) {
          lastUpdated = dateElement.attr('content')
        } else {
          lastUpdated = dateElement.text().trim()
        }
        if (lastUpdated) break
      }
    }

    const tableOfContents: { text: string; url: string; level: number }[] = []
    $('.table-of-contents a, .toc a, nav a, .sidebar a, .menu a, .navigation a').each((i, el) => {
      const linkText = $(el).text().trim()
      let linkUrl = $(el).attr('href') || ''

      if (linkUrl && linkUrl.startsWith('/')) {
        linkUrl = `${baseUrl}${linkUrl}`
      } else if (linkUrl && !linkUrl.startsWith('http')) {
        linkUrl = new URL(linkUrl, url).toString()
      }

      const parentTag = $(el).closest('li, div').parent().get(0)
      const levelClass = $(parentTag).attr('class') || ''
      let level = 1

      if (levelClass.includes('level-2') || levelClass.includes('toc-level-2')) {
        level = 2
      } else if (levelClass.includes('level-3') || levelClass.includes('toc-level-3')) {
        level = 3
      }

      if (linkText && linkUrl) {
        tableOfContents.push({
          text: linkText,
          url: linkUrl,
          level,
        })
      }
    })

    const images: { url: string; alt: string }[] = []
    $('img').each((i, el) => {
      let imgUrl = $(el).attr('src') || ''

      if (imgUrl && imgUrl.startsWith('/')) {
        imgUrl = `${baseUrl}${imgUrl}`
      } else if (imgUrl && !imgUrl.startsWith('http')) {
        imgUrl = new URL(imgUrl, url).toString()
      }

      const alt = $(el).attr('alt') || ''

      if (imgUrl) {
        images.push({
          url: imgUrl,
          alt,
        })
      }
    })

    const textContent =
      $('main, article, .content, #content, .documentation, .doc-content, .markdown-body').text().trim() ||
      $('body').text().trim()

    return {
      content: contentWithFixedLinks,
      textContent,
      metadata: {
        title,
        lastSyncTime: new Date().toISOString(),
        url,
        baseUrl,
        tableOfContents,
        images,
      },
    }
  } catch (error) {
    throw new Error(`Failed to fetch official document: ${(error as Error).message}`)
  }
}

async function fetchRssBlog(url: string) {
  try {
    const feed = await parser.parseURL(url)
    // fetch the latest 10 posts
    const items = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      url: item.link,
      content: item.content || item.contentSnippet,
      publishDate: item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate || '') : null,
      author: item.creator || item.author,
      lastSyncTime: new Date(),
    }))

    return {
      items,
      metadata: {
        feedTitle: feed.title,
        feedDescription: feed.description,
        lastSyncTime: new Date(),
        postCount: items.length,
      },
    }
  } catch (error) {
    throw new Error(`Failed to parse RSS: ${(error as Error).message}`)
  }
}

// TODO: fetch the content from the Github repository
async function fetchGithub(url: string) {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }

    const [, owner, repo] = match

    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    })

    const { data: readmeData } = await octokit.repos.getReadme({
      owner,
      repo,
    })

    const readmeContent = Buffer.from(readmeData.content, 'base64').toString()

    return {
      content: readmeContent,
      metadata: {
        name: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        lastSyncTime: new Date(),
        url: repoData.html_url,
      },
    }
  } catch (error) {
    throw new Error(`Failed to fetch GitHub repository: ${(error as Error).message}`)
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
      { status: 500 }
    )
  }
}
