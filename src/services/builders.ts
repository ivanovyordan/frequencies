import type { RadioChannel } from '../types/channel';
import type { AprsSettings, RadioId } from '../types/repeater';
import type { ContactRow } from './contactListBuilder';

export interface BuilderOptions {
  radioId?: RadioId;
  contactListCsv?: string;
  contactList?: ContactRow[];
  aprsSettings?: AprsSettings;
}

export type CsvBuilder = (channels: RadioChannel[], options?: BuilderOptions) => string;
export type ZipBuilder = (channels: RadioChannel[], options?: BuilderOptions) => Promise<Blob>;
