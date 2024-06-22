'use client';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { Dictionary, SupportedLanguage } from '@/models/locale';
import { useEffect, useState } from 'react';

interface TicketProps {
    ticket: {
        name: string;
        location: string;
        price: number;
        registrationStartsAt: Date;
        registrationEndsAt: Date;
    }
    eventStartsAt: Date;
    lang: SupportedLanguage;
    dictionary: Dictionary;
    disabled?: boolean;
}

export default function Ticket({ ticket, eventStartsAt, lang, dictionary, disabled = false }: TicketProps) {
    const [days, setDays] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = ticket.registrationStartsAt.getTime() - now;

            setDays(Math.floor(distance / (1000 * 60 * 60 * 24)));
            setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
            setSeconds(Math.floor((distance % (1000 * 60)) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    });

    const registrationStarted = new Date().getTime() > ticket.registrationStartsAt.getTime();

    return (
        <div key={ticket.name} className='relative h-full'>
            {registrationStarted ? (
                <div className={`flex gap-4 rounded-lg bg-background-50/50 backdrop-blur-sm ${disabled ? 'grayscale' : ''}`}>
                    <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
                    <div className='flex p-4  flex-col items-center justify-center max-md:px-0'>
                        <p className='font-semibold text-accent-400 text-4xl max-md:text-2xl'>
                            {new Date(eventStartsAt).toLocaleDateString(lang, { day: '2-digit' })}
                        </p>
                        <p className='font-semibold text-lg truncate max-md:text-base'>
                            {firstLetterToUpperCase(new Date(eventStartsAt).toLocaleDateString(lang, { month: 'short', year: 'numeric' }))}
                        </p>
                        <p className='text-sm'>
                            {firstLetterToUpperCase(new Date(eventStartsAt).toLocaleDateString(lang, { weekday: 'long' }))}
                        </p>
                    </div>
                    <span className="w-0.5 shrink-0 rounded-l-lg bg-gray-400/10" />
                    <div className="flex flex-col p-4 justify-center w-full gap-1">
                        <p className="text-lg font-semibold max-md:text-base line-clamp-2">{ticket.name}</p>
                        <div className='flex justify-between'>
                            <p className="text-sm line-clamp-1 break-all">{ticket.location}</p>
                            <p className="badge-primary whitespace-nowrap badge badge-lg max-md:badge-md">{ticket.price} €</p>
                        </div>
                        <div>
                            <button className='btn btn-primary whitespace-nowrap btn-sm max-md:btn-xs' disabled={disabled}>
                                {dictionary.pages_events.buy_tickets}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`flex rounded-lg bg-background-50/50 backdrop-blur-sm ${disabled ? 'grayscale' : ''}`}>
                    <span className="w-1 shrink-0 rounded-l-lg bg-secondary-400" />
                    <div className='flex flex-col p-4 gap-2'>
                        <p className="text-lg font-semibold max-md:text-base line-clamp-2">{ticket.name}</p>
                        {days < 30 ? (
                            <div className="flex gap-5">
                                <div className='text-sm'>
                                    <span className="countdown font-mono text-2xl max-md:text-lg text-accent-400">
                                        {/* @ts-expect-error */}
                                        <span style={{ '--value': days }} />
                                    </span>
                                    {dictionary.general.days}
                                </div>
                                <div className='text-sm'>
                                    <span className="countdown font-mono text-2xl max-md:text-lg text-accent-400">
                                        {/* @ts-expect-error */}
                                        <span style={{ '--value': hours }} />
                                    </span>
                                    {dictionary.general.hours}
                                </div>
                                <div className='text-sm'>
                                    <span className="countdown font-mono text-2xl max-md:text-lg text-accent-400">
                                        {/* @ts-expect-error */}
                                        <span style={{ '--value': minutes }} />
                                    </span>
                                    {dictionary.general.minutes}
                                </div>
                                <div className='text-sm'>
                                    <span className="countdown font-mono text-2xl max-md:text-lg text-accent-400">
                                        {/* @ts-expect-error */}
                                        <span style={{ '--value': seconds }} />
                                    </span>
                                    {dictionary.general.seconds}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>
                                    {dictionary.pages_events.registration_starts}
                                </p>
                                <p className="font-semibold">
                                    {ticket.registrationStartsAt.toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </p>
                            </div>
                        )}
                        <div className='flex items-center justify-start flex-1 md:hidden'>
                            <p className="badge-primary whitespace-nowrap badge badge-lg max-md:badge-md">{ticket.price} €</p>
                        </div>
                    </div>
                    <div className='flex items-center justify-end p-4 flex-1 max-md:hidden'>
                        <p className="badge-primary whitespace-nowrap badge badge-lg max-md:badge-md">{ticket.price} €</p>
                    </div>
                </div>
            )}
        </div>
    )
}