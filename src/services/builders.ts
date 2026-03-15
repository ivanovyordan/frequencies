import type { RadioChannel } from '../types/channel';
import type { RadioId } from '../types/repeater';

export interface BuilderOptions {
  radioId?: RadioId;
  contactListCsv?: string;
}

export type CsvBuilder = (channels: RadioChannel[], options?: BuilderOptions) => string;
export type ZipBuilder = (channels: RadioChannel[], options?: BuilderOptions) => Promise<Blob>;
