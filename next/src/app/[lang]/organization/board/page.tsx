import BoardMember from '@/components/BoardMember/BoardMember';
import getStrapiData from '@/lib/get-strapi-data';
import { SupportedLanguage } from '@/models/locale';
import { ApiBoardBoard } from '@/types/contentTypes';

export default async function Board({
  params,
}: {
  params: { lang: SupportedLanguage };
}) {
  const boardData = await getStrapiData<ApiBoardBoard[]>(
    params.lang,
    '/api/boards?populate=*',
  );

  return (
    <div>
      <h1 className="mb-14 text-5xl font-extrabold max-md:text-4xl">Board</h1>
      <div className="grid grid-cols-2 gap-12 lg:grid-cols-3">
        {boardData.data.map((member) => (
          <BoardMember key={member.attributes.createdAt} member={member} />
        ))}
      </div>
    </div>
  );
}
