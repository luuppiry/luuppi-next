import { logger } from '@/libs/utils/logger';
import { NextRequest } from 'next/server';

type StrapiEntry = {
  event: string;
  createdAt: string;
  model: string;
  uid: string;
  entry: Record<string, any>;
};

const strapiEvents = {
  'entry.delete': '🗑️ Sisältöä poistettu',
  'entry.update': '✍️ Sisältöä päivitetty',
  'entry.create': '🆕 Sisältöä luotu',
};

const log = logger.child('api:cms-logging');

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || auth !== process.env.REVALIDATE_AUTH_SECRET) {
    log.error('Unauthorized cms logging request');
    return new Response('Unauthorized', { status: 401 });
  }

  const body: StrapiEntry = await request.json();

  const eventType = body?.event;
  const hasEvent = Object.keys(strapiEvents).includes(eventType);
  if (!hasEvent) {
    log.warn('Invalid event type');
  }

  const title = strapiEvents[eventType as keyof typeof strapiEvents];

  const slackMessage = {
    blocks: [
      {
        type: 'divider',
      },
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Malli:* ${body.model}\n*Kieli:* ${body?.entry?.locale === 'en' ? 'Englanti' : 'Suomi'}`,
        },
      },
      {
        type: 'divider',
      },
    ],
  };

  try {
    await sendSlackMessage(slackMessage);
  } catch (_error) {
    return new Response('Error sending Slack message', { status: 500 });
  }

  return new Response('OK');
}

async function sendSlackMessage(message: Record<string, any>) {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;

  if (!slackUrl) {
    log.error('No Slack webhook URL provided');
    return;
  }

  try {
    await fetch(slackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    log.error('Error sending Slack message', error);
  }
}
