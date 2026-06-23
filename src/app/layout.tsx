import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: '演讲计时器 | Speaker Timer',
  description: '专为演讲者设计的在线倒计时工具，支持多环节管理、声音提醒和多种显示样式。',
  keywords: [
    '演讲计时',
    '倒计时',
    '演讲工具',
    '会议计时',
    'Speaker Timer',
    'Countdown',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" className="dark">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
