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
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    // 移除不需要的元素
    $('script, style, nav, footer, header').remove()

    // 获取主要内容
    const content = $('main, article, .content, #content').text().trim() || $('body').text().trim()

    // 获取标题
    const title = $('h1').first().text().trim() || $('title').text().trim()

    return {
      content,
      metadata: {
        title,
        lastUpdated: new Date().toISOString(),
        url,
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
        lastUpdated: new Date().toISOString(),
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
    // 从 URL 中提取仓库信息
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }

    const [, owner, repo] = match

    // 获取仓库信息
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    })

    // 获取 README 内容
    const { data: readmeData } = await octokit.repos.getReadme({
      owner,
      repo,
    })

    const readmeContent = Buffer.from(readmeData.content, 'base64').toString()

    return {
      content: readmeContent,
      metadata: {
        repoName: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        lastUpdated: repoData.updated_at,
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
