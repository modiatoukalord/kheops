
import { z } from 'zod';

export const GenerateContractClauseInputSchema = z.object({
  contractType: z.string().describe('The type of the contract (e.g., "Prestation Studio", "Licence Musique").'),
  clauseType: z.enum(['object', 'obligationsProvider', 'obligationsClient', 'confidentiality']).describe('The type of clause to generate.'),
});
export type GenerateContractClauseInput = z.infer<typeof GenerateContractClauseInputSchema>;
