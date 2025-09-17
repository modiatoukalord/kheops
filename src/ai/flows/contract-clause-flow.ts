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
        Votre tâche est d'améliorer, reformuler ou compléter le texte fourni par l'utilisateur pour une clause de contrat spécifique.
        Si le texte fourni est vide, générez une clause appropriée à partir de zéro.

        Type de Contrat : {{{contractType}}}
        Type de Clause à améliorer/générer : {{{clauseType}}}
        Texte actuel de l'utilisateur (à améliorer) :
        \'\'\'
        {{{currentText}}}
        \'\'\'

        Instructions :
        - Analysez le texte de l'utilisateur. S'il est pertinent, améliorez-le pour le rendre plus clair, plus professionnel et juridiquement solide.
        - S'il est vide, générez une clause complète en suivant les instructions ci-dessous pour chaque type.
        - 'object': Décrivez l'objet principal du contrat. Soyez précis et concis.
        - 'obligationsProvider': Listez les engagements et responsabilités de KHEOPS (le prestataire).
        - 'obligationsClient': Listez les engagements et responsabilités du client.
        - 'confidentiality': Rédigez une clause de confidentialité standard mais solide, protégeant les informations des deux parties.
        - 'paymentTerms': Décrivez les modalités de paiement. Proposez par défaut un acompte de 50% à la signature et le solde à la livraison, mais restez flexible si l'utilisateur a déjà écrit autre chose.

        Générez uniquement le texte final de la clause. Ne renvoyez pas de commentaires ou d'explications.
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
