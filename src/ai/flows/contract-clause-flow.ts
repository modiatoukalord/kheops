
'use server';
/**
 * @fileOverview An AI agent for generating contract clauses.
 *
 * - generateContractClause - A function that generates a contract clause based on type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateContractClauseInputSchema, type GenerateContractClauseInput } from '@/ai/types/contract-clause';


const ClauseOutputSchema = z.object({
  clauseText: z.string().describe('The generated text for the contract clause.'),
});

const clauseGenerationPrompt = ai.definePrompt({
    name: 'generateContractClausePrompt',
    input: { schema: GenerateContractClauseInputSchema },
    output: { schema: ClauseOutputSchema },
    prompt: `
        Vous êtes un assistant juridique spécialisé dans la rédaction de contrats pour une startup créative nommée KHEOPS.
        Votre tâche est de générer une clause de contrat en français, claire et professionnelle, basée sur le type de contrat et le type de clause demandés.

        Type de Contrat : {{{contractType}}}
        Type de Clause à générer : {{{clauseType}}}

        Instructions pour chaque type de clause :
        - 'object': Décrivez l'objet principal du contrat. Soyez précis et concis.
        - 'obligationsProvider': Listez les engagements et responsabilités de KHEOPS (le prestataire).
        - 'obligationsClient': Listez les engagements et responsabilités du client.
        - 'confidentiality': Rédigez une clause de confidentialité standard mais solide, protégeant les informations des deux parties.

        Générez uniquement le texte de la clause demandé.
    `,
});


export const generateContractClauseFlow = ai.defineFlow(
  {
    name: 'generateContractClauseFlow',
    inputSchema: GenerateContractClauseInputSchema,
    outputSchema: ClauseOutputSchema,
  },
  async (input) => {
    const { output } = await clauseGenerationPrompt(input);
    return output!;
  }
);

export async function generateContractClause(input: GenerateContractClauseInput): Promise<string> {
    const result = await generateContractClauseFlow(input);
    return result.clauseText;
}