/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contact, Message } from './types';

export const DEFAULT_CONTACTS: Contact[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const BOT_RESPONSES: Record<string, string[]> = {};
export const getRelativeISOString = (offsetMinutes: number): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offsetMinutes);
  return d.toISOString();
};
