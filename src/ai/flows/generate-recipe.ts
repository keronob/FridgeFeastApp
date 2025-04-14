'use server';
/**
 * @fileOverview Generates a recipe based on a list of ingredients.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available in the fridge.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  instructions: z.string().describe('The instructions for preparing the recipe.'),
  requiredCookingTime: z.string().describe('The estimated cooking time.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

const ingredientCheckerTool = ai.defineTool({
  name: 'ingredientChecker',
  description: 'Check if an ingredient is necessary for a recipe',
  inputSchema: z.object({
    ingredient: z.string().describe('The ingredient to check.'),
    recipe: z.string().describe('The recipe the ingredient would be used in.'),
  }),
  outputSchema: z.boolean().describe('Whether the ingredient is necessary.'),
});

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {
    schema: z.object({
      ingredients: z
        .string()
        .describe('A comma-separated list of ingredients available in the fridge.'),
    }),
  },
  output: {
    schema: z.object({
      recipeName: z.string().describe('The name of the generated recipe.'),
      instructions: z.string().describe('The instructions for preparing the recipe.'),
      requiredCookingTime: z.string().describe('The estimated cooking time.'),
    }),
  },
  prompt: `You are a world-class chef, known for creating delicious recipes based on limited ingredients.

  Given the following ingredients that a user has in their fridge, generate a recipe, including:
  - The name of the recipe
  - Step by step instructions on how to prepare the recipe
  - The estimated cooking time

  Ingredients: {{{ingredients}}}
  `,
});

const generateRecipeFlow = ai.defineFlow<
  typeof GenerateRecipeInputSchema,
  typeof GenerateRecipeOutputSchema
>(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
