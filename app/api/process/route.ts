import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { extractFromUrl } from '../../../lib/extract';
import { transcribeTelegramOrUrl } from '../../../lib/voice';
import { summarizeFinance } from '../../../lib/summarize';
import { generateImageUrl } from '../../../lib/image';
import { postToBlogger } from '../../../lib/blogger';

const InputSchema = z.object({
  type: z.enum(['text', 'link', 'voice']),
  text: z.string().optional(),
  url: z.string().url().optional(),
  language: z.string().default('pt'),
  labels: z.array(z.string()).optional(),
  bloggerBlogId: z.string().optional(),
  telegram: z
    .object({ botToken: z.string(), fileId: z.string() })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const input = InputSchema.parse(json);

    let sourceText = '';
    let sourceTitle = '';

    if (input.type === 'text') {
      sourceText = input.text ?? '';
    } else if (input.type === 'link') {
      const { title, content } = await extractFromUrl(input.url!);
      sourceText = content;
      sourceTitle = title;
    } else if (input.type === 'voice') {
      const transcript = await transcribeTelegramOrUrl({
        telegram: input.telegram
          ? { botToken: input.telegram.botToken, fileId: input.telegram.fileId }
          : undefined,
        url: input.url,
      });
      sourceText = transcript;
    }

    if (!sourceText || sourceText.trim().length === 0) {
      return NextResponse.json({ error: 'No content to summarize' }, { status: 400 });
    }

    const summary = await summarizeFinance({
      language: input.language,
      sourceText,
      sourceTitle,
    });

    const imageUrl = await generateImageUrl({
      prompt: summary.imagePrompt,
    });

    const blogId = input.bloggerBlogId || process.env.BLOGGER_BLOG_ID;

    let postUrl: string | undefined = undefined;
    if (blogId) {
      const contentHtml = `\n<p><img alt="${summary.title}" src="${imageUrl}" style="max-width:100%;height:auto"/></p>\n${summary.html}`;
      const post = await postToBlogger({
        blogId,
        title: summary.title,
        contentHtml,
        labels: input.labels,
      });
      postUrl = post.url;
    }

    return NextResponse.json({
      ok: true,
      title: summary.title,
      imageUrl,
      postedUrl: postUrl,
    });
  } catch (err: any) {
    console.error('Process error', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
