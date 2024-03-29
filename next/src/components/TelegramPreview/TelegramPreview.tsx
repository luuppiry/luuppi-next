import { Dictionary } from '@/models/locale';
import Image from 'next/image';
import TelegramSvg from '../../../public/telegram.svg';
import GroupsDialog from './GroupsDialog/GroupsDialog';

interface TelegramPreviewProps {
  dictionary: Dictionary;
}

export default function TelegramPreview({ dictionary }: TelegramPreviewProps) {
  return (
    <section className="relative mx-auto max-w-[1200px] overflow-hidden px-4 pt-4">
      <div className="flex items-center gap-12 max-md:flex-col-reverse">
        <div className="flex justify-center self-end">
          <Image alt="Telegram" height={500} src={TelegramSvg} />
        </div>
        <div className="relative flex flex-col gap-6 pb-6">
          <h2 className="text-4xl font-extrabold max-md:text-3xl">
            {dictionary.pages_home.telegram.title}
          </h2>
          <p className="max-w-2xl text-lg transition-all duration-300 max-md:text-base">
            {dictionary.pages_home.telegram.description}
          </p>
          <div className="flex">
            <GroupsDialog dictionary={dictionary} />
          </div>
          <div className="luuppi-pattern absolute -left-20 -top-28 -z-50 h-[501px] w-[801px] max-md:left-0 max-md:top-0 max-md:h-full max-md:w-full max-md:rounded-none" />
        </div>
      </div>
    </section>
  );
}
