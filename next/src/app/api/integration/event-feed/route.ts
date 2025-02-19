import { getPlainText } from '@/libs/strapi/blocks-converter';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { APIResponseCollection } from '@/types/types';
import { NextRequest, NextResponse } from 'next/server';

interface EventsFeedResponse {
  events: {
    id: string;
    nameFi: string;
    nameEn: string;
    descriptionFi: string;
    descriptionEn: string;
    locationFi: string;
    locationEn: string;
    start: Date;
    end: Date;
    hasTickets: boolean;
    imageEnUrl: string | null;
    imageFiUrl: string | null;
  }[];
}

interface EventsFeedError {
  error: string;
}

/**
 * This is integration endpoint for Lärpäke which is in separate repository.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<EventsFeedError | EventsFeedResponse>> {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || auth !== process.env.INTEGRATION_API_SECRET) {
      logger.error('Unauthorized events feed request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const url = `/api/events?filters[StartDate][$gte]=${sixMonthsAgo.toISOString()}&populate=Registration.TicketTypes.Role&populate=Image&populate=ImageEn`;

    const data = await getStrapiData<APIResponseCollection<'api::event.event'>>(
      'fi',
      url,
      ['event'],
    );

    const events = data.data.map((event) => ({
      id: event.id.toString(),
      nameFi: event.attributes.NameFi,
      nameEn: event.attributes.NameEn,
      descriptionFi: getPlainText(event.attributes.DescriptionFi),
      descriptionEn: getPlainText(event.attributes.DescriptionEn),
      locationFi: event.attributes.LocationFi,
      locationEn: event.attributes.LocationEn,
      start: new Date(event.attributes.StartDate),
      end: new Date(event.attributes.EndDate),
      hasTickets: Boolean(event.attributes.Registration?.TicketTypes.length),
      imageEnUrl: event.attributes.ImageEn?.data?.attributes?.url || null,
      imageFiUrl: event.attributes.Image?.data?.attributes?.url || null,
    }));

    return NextResponse.json({ events: events });
  } catch (error) {
    logger.error('Error while fetching event feed', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
