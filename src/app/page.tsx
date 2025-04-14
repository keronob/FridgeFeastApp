'use client';

import {useState} from 'react';
import {generateRecipe} from '@/ai/flows/generate-recipe';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {useEffect} from 'react';
import {Label} from '@/components/ui/label';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Separator} from '@/components/ui/separator';
import {Circle, ForkKnife} from 'lucide-react';

interface Recipe {
  recipeName: string;
  instructions: string;
  requiredCookingTime: string;
}

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const {toast} = useToast();
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);

  // Load saved recipes from local storage on component mount
  useEffect(() => {
    const storedRecipes = localStorage.getItem('savedRecipes');
    if (storedRecipes) {
      setSavedRecipes(JSON.parse(storedRecipes));
    }
  }, []);

  // Save recipes to local storage whenever savedRecipes changes
  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  const handleGenerateRecipe = async () => {
    if (!ingredients) {
      toast({
        title: 'Error',
        description: 'Please enter some ingredients.',
      });
      return;
    }

    try {
      const generatedRecipe = await generateRecipe({ingredients});
      setRecipe(generatedRecipe);
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recipe. Please try again.',
      });
    }
  };

  const handleSaveRecipe = () => {
    if (!recipe) {
      toast({
        title: 'Error',
        description: 'No recipe to save.',
      });
      return;
    }

    setSavedRecipes(prevRecipes => {
      const newRecipes = [...prevRecipes, recipe];
      toast({
        title: 'Recipe Saved',
        description: 'Recipe saved to local storage.',
      });
      return newRecipes;
    });
  };

  const handleOpenRecipe = (recipe: Recipe) => {
    setOpenRecipe(recipe);
  };

  const handleCloseRecipe = () => {
    setOpenRecipe(null);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Ingredients</CardTitle>
          <CardDescription>
            Enter the ingredients you have available, separated by commas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              placeholder="e.g., chicken, rice, broccoli"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerateRecipe}>Generate Recipe</Button>
        </CardContent>
      </Card>

      {recipe && (
        <Card>
          <CardHeader>
            <CardTitle>{recipe.recipeName}</CardTitle>
            <CardDescription>
              {`Cooking Time: ${recipe.requiredCookingTime}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Instructions</Label>
              <Textarea
                id="instructions"
                readOnly
                value={recipe.instructions}
                className="min-h-[100px] resize-none"
              />
            </div>
            <Button onClick={handleSaveRecipe}>Save Recipe</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Saved Recipes</CardTitle>
          <CardDescription>Click a recipe to view it.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          {savedRecipes.map((savedRecipe, index) => (
            <Dialog key={index} onOpenChange={(open) => !open ? handleCloseRecipe() : null}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenRecipe(savedRecipe)}
                >
                  <ForkKnife className="h-4 w-4" />
                  <span className="sr-only">{savedRecipe.recipeName}</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{savedRecipe.recipeName}</DialogTitle>
                  <DialogDescription>
                    {`Cooking Time: ${savedRecipe.requiredCookingTime}`}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Instructions</Label>
                    <Textarea
                      readOnly
                      value={savedRecipe.instructions}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
