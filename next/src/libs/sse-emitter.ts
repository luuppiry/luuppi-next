import { EventEmitter } from 'events';

// Prevent multiple instances during hot-reloading in development
const globalForEmitter = global as unknown as { eventEmitter: EventEmitter };

export const ticketEmitter =
  globalForEmitter.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEmitter.eventEmitter = ticketEmitter;
}
