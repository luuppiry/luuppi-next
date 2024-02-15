'use client';
import { getDictionary } from '@/dictionaries';
import { useState } from 'react';

interface LuuppiBirdProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export default function LuuppiBird({ dictionary }: LuuppiBirdProps) {
  const [play, setPlay] = useState(false);

  return (
    <>
      <dialog className={`modal ${play && 'modal-open'}`} id="luuppiBird">
        <div className="modal-box flex aspect-[2/3] flex-col items-center justify-center shadow-none max-sm:h-full max-sm:min-h-dvh max-sm:w-screen max-sm:max-w-full max-sm:rounded-none">
          <div className="flex w-full justify-between pb-4">
            <h2 className="text-center text-2xl font-bold">LuuppiBird™</h2>
            <button
              className="btn btn-primary btn-sm text-white"
              onClick={() => setPlay(false)}
            >
              {dictionary.general.close}
            </button>
          </div>
          <div className="inline-block h-full w-full rounded-lg">
            <iframe
              height="100%"
              src="https://kasperip.github.io/luuppi-bird/"
              title="LuuppiBird"
              width="100%"
            />
          </div>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button
            onClick={() => {
              setPlay(false);
            }}
          >
            close
          </button>
        </form>
      </dialog>
      <button
        className="btn btn-link btn-sm p-0 text-inherit"
        onClick={() => setPlay(!play)}
      >
        {dictionary.pages_404.play_game}
      </button>
    </>
  );
}
