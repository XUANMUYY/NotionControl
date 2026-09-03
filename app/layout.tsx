import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notion 控制台',
  description: '公开可用的 Notion API 操作工作台',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
