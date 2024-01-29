import { getDictionary } from '@/dictionaries';
import Image from 'next/image';

interface BoardMemberProps {
  member: any;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function BoardMember({ member, dictionary }: BoardMemberProps) {
  return (
    <div className="indicator flex w-full flex-col rounded-lg border-[1px] border-gray-200 shadow-lg">
      <span className="badge indicator-item badge-primary badge-lg indicator-center border-none px-4 font-bold text-white">
        {member.attributes.isBoardMember
          ? dictionary.pages_board.board_member
          : dictionary.pages_board.official}
      </span>
      <div className="relative aspect-[5/6] w-full rounded-lg bg-primary-400">
        <Image
          alt={`${member.attributes.fullName}`}
          className="rounded-lg object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          src={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${member.attributes.image.data.attributes.url}`}
          fill
        />
      </div>
      <div className="flex flex-col gap-2 px-4 py-6">
        <h2 className="text-2xl font-bold">{member.attributes.fullName}</h2>
        <div className="flex flex-wrap gap-2">
          {member.attributes.boardRoles.data.map((role: any, index: number) => (
            <div
              key={role.attributes.title}
              className="flex items-center gap-2 opacity-90"
            >
              <div className="font-semibold">{role.attributes.title}</div>
              {index !== member.attributes.boardRoles.data.length - 1 && (
                <span className="font-semibold">|</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2">
          <h3 className="text-lg font-semibold">{dictionary.general.email}</h3>
          <div className="flex flex-col gap-1">
            {member.attributes.boardRoles.data.map((role: any) => (
              <p key={role.attributes.email} className="text-sm">
                {role.attributes.email}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
