import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { Dictionary } from '@/models/locale';
import Image from 'next/image';
import { FaUserAlt } from 'react-icons/fa';

interface BoardMemberProps {
  member: any;
  dictionary: Dictionary;
  showEmail?: boolean;
}

export default function BoardMember({
  member,
  dictionary,
  showEmail,
}: BoardMemberProps) {
  return (
    <div className="flex w-full flex-col rounded-lg border border-gray-200 bg-white shadow-lg dark:border-background-200 dark:bg-base-200">
      <div className="relative aspect-[9/10] w-full rounded-lg bg-gradient-to-r from-secondary-400 to-primary-300">
        {member.image?.url ? (
          <Image
            alt={`Picture of ${member.fullName}`}
            className="rounded-t-lg object-cover object-top"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={getStrapiUrl(member.image.url)}
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
          {member.fullName}
        </h2>
        <div className="flex flex-col items-start">
          {member.boardRoles.map((role: any) => (
            <div
              key={role.title}
              className="tooltip flex max-w-full opacity-90"
              data-tip={role.title}
            >
              <div className="inline-block truncate text-left text-sm font-semibold">
                {role.title}
              </div>
            </div>
          ))}
        </div>
        {showEmail && (
          <div>
            <h3 className="font-semibold">{dictionary.general.email}</h3>
            <div className="flex flex-col items-start gap-1">
              {member.boardRoles.map((role: any) => (
                <div
                  key={role.email}
                  className="tooltip inline-block max-w-full"
                  data-tip={role.email}
                >
                  <p key={role.email} className="truncate text-sm">
                    <span>{role.email}</span>
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
