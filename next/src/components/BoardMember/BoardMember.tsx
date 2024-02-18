import { getDictionary } from '@/dictionaries';
import { getStrapiUrl } from '@/lib/get-url';
import Image from 'next/image';
import { FaUserAlt } from 'react-icons/fa';

interface BoardMemberProps {
  member: any;
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  showEmail?: boolean;
}

export default function BoardMember({
  member,
  dictionary,
  showEmail,
}: BoardMemberProps) {
  return (
    <div className="flex w-full flex-col rounded-lg border-[1px] border-gray-200 shadow-lg">
      <div className="relative aspect-[9/10] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300">
        {member.attributes.image.data?.attributes.url ? (
          <Image
            alt={`Picture of ${member.attributes.fullName}`}
            className="rounded-t-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={getStrapiUrl(member.attributes.image.data.attributes.url)}
            fill
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FaUserAlt color="white" size={56} />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 px-4 py-6">
        <h2 className="text-xl font-bold max-md:text-base">
          {member.attributes.fullName}
        </h2>
        <div className="flex flex-col items-start">
          {member.attributes.boardRoles.data.map((role: any) => (
            <div
              key={role.attributes.title}
              className="tooltip flex max-w-full opacity-90"
              data-tip={role.attributes.title}
            >
              <div className="inline-block truncate text-left text-sm font-semibold">
                {role.attributes.title}
              </div>
            </div>
          ))}
        </div>
        {showEmail && (
          <div>
            <h3 className="font-semibold">{dictionary.general.email}</h3>
            <div className="flex flex-col items-start gap-1">
              {member.attributes.boardRoles.data.map((role: any) => (
                <div
                  key={role.attributes.email}
                  className="tooltip inline-block max-w-full"
                  data-tip={role.attributes.email}
                >
                  <p key={role.attributes.email} className="truncate text-sm">
                    <span>{role.attributes.email}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
