export default function HomePage() {
  return (
    <main>
      <h1>Agentic Blogger Bot</h1>
      <p>API pronta em <code>/api/process</code>. Use via n8n (Telegram).</p>
      <ul>
        <li>Entrada: texto, link ou voz (URL/Telegram)</li>
        <li>Sa?da: resumo financeiro + imagem + post no Blogger</li>
      </ul>
    </main>
  );
}
