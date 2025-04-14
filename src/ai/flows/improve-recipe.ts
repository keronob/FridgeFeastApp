'use server';
/**
 * @fileOverview An AI agent that refines a recipe based on user feedback.
 *
 * - refineRecipe - A function that refines the recipe based on feedback.
 * - RefineRecipeInput - The input type for the refineRecipe function.
 * - RefineRecipeOutput - The return type for the refineRecipe function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RefineRecipeInputSchema = z.object({
  recipe: z.string().describe('The recipe to be refined.'),
  feedback: z.string().describe('The user feedback on the recipe.'),
});
export type RefineRecipeInput = z.infer<typeof RefineRecipeInputSchema>;

const RefineRecipeOutputSchema = z.object({
  refinedRecipe: z.string().describe('The refined recipe based on the feedback.'),
});
export type RefineRecipeOutput = z.infer<typeof RefineRecipeOutputSchema>;

export async function refineRecipe(input: RefineRecipeInput): Promise<RefineRecipeOutput> {
  return refineRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineRecipePrompt',
  input: {
    schema: z.object({
      recipe: z.string().describe('The recipe to be refined.'),
      feedback: z.string().describe('The user feedback on the recipe.'),
    }),
  },
  output: {
    schema: z.object({
      refinedRecipe: z.string().describe('The refined recipe based on the feedback.'),
    }),
  },
  prompt: `You are an expert recipe refiner. Please refine the given recipe based on the user feedback.  Make sure to be as detailed as possible in the refined recipe.

Recipe:
{{{recipe}}}

Feedback:
{{{feedback}}}

Refined Recipe:`, // Ensure this is valid Handlebars
});

const refineRecipeFlow = ai.defineFlow<
  typeof RefineRecipeInputSchema,
  typeof RefineRecipeOutputSchema
>({
  name: 'refineRecipeFlow',
  inputSchema: RefineRecipeInputSchema,
  outputSchema: RefineRecipeOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
