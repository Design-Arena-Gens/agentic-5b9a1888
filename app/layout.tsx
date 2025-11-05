export const metadata = {
  title: 'Agentic Blogger Bot',
  description: 'n8n -> Telegram -> Finance blog summarizer and poster',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ fontFamily: 'system-ui, Arial, sans-serif', margin: 0, padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
