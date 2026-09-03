import { NextResponse } from 'next/server';

const NOTION_API_VERSION = '2026-03-11';
type Action = 'retrieve' | 'search' | 'create' | 'query';

function normalizeId(value: string) {
  const match = value.match(/[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f-]{27,}/i);
  return match ? match[0] : value.trim();
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let input: { action?: Action; token?: string; target?: string; title?: string; markdown?: string };
  try {
    input = await request.json();
  } catch {
    return jsonError('请求内容不是有效 JSON。');
  }

  const { action, token, target = '', title = '', markdown = '' } = input;
  if (!token?.trim()) return jsonError('请提供 Notion 集成令牌。');
  if (!action || !['retrieve', 'search', 'create', 'query'].includes(action)) return jsonError('未知操作。');
  if (action !== 'search' && !target.trim()) return jsonError('请提供目标 ID 或链接。');
  if (action === 'create' && !title.trim()) return jsonError('新页面需要标题。');

  const id = normalizeId(target);
  let url = 'https://api.notion.com/v1/search';
  let method = 'POST';
  let body: unknown = {};
  if (action === 'retrieve') {
    url = `https://api.notion.com/v1/pages/${encodeURIComponent(id)}`;
    method = 'GET';
    body = undefined;
  }
  if (action === 'search') body = { query: target.trim(), page_size: 20 };
  if (action === 'query') {
    url = `https://api.notion.com/v1/data_sources/${encodeURIComponent(id)}/query`;
    body = { page_size: 20 };
  }
  if (action === 'create') {
    url = 'https://api.notion.com/v1/pages';
    body = {
      parent: { type: 'page_id', page_id: id },
      properties: { title: { title: [{ type: 'text', text: { content: title.trim() } }] } },
      ...(markdown.trim() ? { markdown: markdown.trim() } : {}),
    };
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Notion-Version': NOTION_API_VERSION,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return jsonError('无法连接 Notion API，请稍后重试。', 502);
  }
}
