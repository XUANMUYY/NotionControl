'use client';

import { FormEvent, useMemo, useState } from 'react';

type Action = 'retrieve' | 'search' | 'create' | 'query';

const actions: Array<{ id: Action; label: string; hint: string }> = [
  { id: 'retrieve', label: '读取页面', hint: '读取页面的属性与元数据' },
  { id: 'search', label: '搜索内容', hint: '按关键词搜索可访问内容' },
  { id: 'create', label: '新建页面', hint: '在指定父页面下创建内容' },
  { id: 'query', label: '查询数据源', hint: '读取数据源中的前 20 条记录' },
];

const fieldLabel: Record<Action, string> = {
  retrieve: '页面 ID 或链接',
  search: '搜索关键词',
  create: '父页面 ID 或链接',
  query: '数据源 ID 或链接',
};

export default function Home() {
  const [action, setAction] = useState<Action>('retrieve');
  const [token, setToken] = useState('');
  const [target, setTarget] = useState('');
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [result, setResult] = useState<string>('等待操作。');
  const [isLoading, setIsLoading] = useState(false);

  const currentAction = useMemo(
    () => actions.find((item) => item.id === action)!,
    [action],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setResult('正在与 Notion 通信…');

    try {
      const response = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, token, target, title, markdown }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setResult(JSON.stringify({ error: '请求未完成，请检查网络后重试。' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="border-b border-slate-800 bg-[#091725] px-6 py-7 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 text-lg font-black text-[#062034]">N</div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">Notion 控制台</p>
              <p className="text-xs text-slate-400">可操作的 API 工作台</p>
            </div>
          </div>

          <nav className="mt-10 grid gap-2" aria-label="可用操作">
            {actions.map((item) => (
              <button
                className={`rounded-xl px-4 py-3 text-left transition ${
                  action === item.id
                    ? 'bg-cyan-300 text-[#062034] shadow-[0_0_30px_rgba(103,232,249,.15)]'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                key={item.id}
                onClick={() => setAction(item.id)}
                type="button"
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={`mt-0.5 block text-xs ${action === item.id ? 'text-[#155069]' : 'text-slate-500'}`}>
                  {item.hint}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 text-xs leading-5 text-slate-400">
            <p className="font-semibold text-slate-200">公开使用，凭证不落盘</p>
            <p className="mt-1">令牌只随本次请求转发给 Notion，不会被网站保存或展示。</p>
          </div>
        </aside>

        <section className="px-5 py-7 sm:px-10 sm:py-10 lg:px-14">
          <header className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Notion API · 2026-03-11</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{currentAction.label}</h1>
              <p className="mt-2 text-base text-slate-400">{currentAction.hint}。输入你自己的 Notion 集成令牌即可开始。</p>
            </div>
            <span className="w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-300">服务已就绪</span>
          </header>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.82fr)]">
            <form className="rounded-2xl border border-slate-700 bg-[#0b1b2b] p-5 shadow-2xl shadow-black/20 sm:p-7" onSubmit={submit}>
              <div className="grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-slate-200">
                  Notion 集成令牌
                  <input autoComplete="off" className="h-12 rounded-lg border border-slate-700 bg-[#07111f] px-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300" onChange={(event) => setToken(event.target.value)} placeholder="ntn_… 或 secret_…" required type="password" value={token} />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-200">
                  {fieldLabel[action]}
                  <input className="h-12 rounded-lg border border-slate-700 bg-[#07111f] px-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300" onChange={(event) => setTarget(event.target.value)} placeholder={action === 'search' ? '例如：项目周报' : '粘贴 Notion 链接或 UUID'} required={action !== 'search'} value={target} />
                </label>

                {action === 'create' && (
                  <>
                    <label className="grid gap-2 text-sm font-medium text-slate-200">
                      页面标题
                      <input className="h-12 rounded-lg border border-slate-700 bg-[#07111f] px-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300" onChange={(event) => setTitle(event.target.value)} placeholder="未命名页面" required value={title} />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-200">
                      内容（Markdown）
                      <textarea className="min-h-40 rounded-lg border border-slate-700 bg-[#07111f] p-3 text-base leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300" onChange={(event) => setMarkdown(event.target.value)} placeholder={'# 新页面\n\n在这里写入内容…'} value={markdown} />
                    </label>
                  </>
                )}
              </div>

              <button className="mt-7 inline-flex h-12 items-center justify-center rounded-lg bg-cyan-300 px-5 text-sm font-bold text-[#062034] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60" disabled={isLoading} type="submit">
                {isLoading ? '处理中…' : action === 'create' ? '创建 Notion 页面' : `执行${currentAction.label}`}
              </button>
            </form>

            <section aria-live="polite" className="overflow-hidden rounded-2xl border border-slate-700 bg-[#06101c] shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-slate-800 bg-[#091725] px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-100">响应结果</h2>
                <span className="font-mono text-xs text-slate-500">JSON</span>
              </div>
              <pre className="min-h-96 max-h-[600px] overflow-auto p-5 text-sm leading-6 text-cyan-100">{result}</pre>
            </section>
          </div>

          <p className="mt-7 text-sm leading-6 text-slate-500">首次使用前，请在 Notion 中将目标页面或数据源连接到对应集成；网站不会替你共享或修改权限。</p>
        </section>
      </div>
    </main>
  );
}
