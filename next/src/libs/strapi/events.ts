import { Dictionary } from '@/models/locale';
import { APIResponseData } from '@/types/types';

const luuppiMember = process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!;
const luuppiNonMember = process.env.NEXT_PUBLIC_NO_ROLE_ID!;

// Incase an event has a Registeration for luuppi-members or non-members ("default"), add a duplicate event
// to show the opening time in the calendar
export const addEventRegisterationOpensAtInfo = <T>(
  acc: T[],
  event: APIResponseData<'api::event.event'>,
  // eslint-disable-next-line no-unused-vars
  formatEvent: (event: APIResponseData<'api::event.event'>) => T,
  dictionary: Dictionary,
) => {
  const memberSaleStartsAt = event.attributes.Registration?.TicketTypes.find(
    (type) =>
      type.Role?.data.attributes.RoleId &&
      [luuppiMember, luuppiNonMember].includes(
        type.Role?.data.attributes.RoleId,
      ),
  );
  if (!memberSaleStartsAt) {
    return [...acc, formatEvent(event)];
  }

  return [
    ...acc,
    formatEvent(event),
    formatEvent({
      ...event,
      attributes: {
        ...event.attributes,
        StartDate: new Date(memberSaleStartsAt.RegistrationStartsAt),
        EndDate: new Date(memberSaleStartsAt.RegistrationStartsAt),
        NameEn: `${event.attributes['NameEn']} ${dictionary.general.opens}`,
        NameFi: `${event.attributes['NameFi']} ${dictionary.general.opens}`,
      },
    }),
  ];
};
