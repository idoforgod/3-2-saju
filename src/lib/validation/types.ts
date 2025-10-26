import { z } from 'zod';
import {
  nameSchema,
  birthDateSchema,
  birthTimeSchema,
  genderSchema,
  sajuInputSchema,
} from './schemas';

export type Name = z.infer<typeof nameSchema>;
export type BirthDate = z.infer<typeof birthDateSchema>;
export type BirthTime = z.infer<typeof birthTimeSchema>;
export type Gender = z.infer<typeof genderSchema>;
export type SajuInput = z.infer<typeof sajuInputSchema>;
