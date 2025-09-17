
import { z } from 'zod';

export const GenerateContractClauseInputSchema = z.object({
  contractType: z.string().describe('The type of the contract (e.g., "Prestation Studio", "Licence Musique").'),
  clauseType: z.enum(['object', 'obligationsProvider', 'obligationsClient', 'confidentiality']).describe('The type of clause to generate.'),
  currentText: z.string().optional().describe('The current text in the textarea, to be improved by the AI.'),
});
export type GenerateContractClauseInput = z.infer<typeof GenerateContractClauseInputSchema>;
