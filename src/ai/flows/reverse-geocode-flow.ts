'use server';
/**
 * @fileOverview A geocoding AI agent.
 *
 * - reverseGeocode - A function that converts coordinates to a readable location name.
 * - GeocodeInput - The input type for the reverseGeocode function.
 * - GeocodeOutput - The return type for the reverseGeocode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeocodeInputSchema = z.object({
  latitude: z.number().describe('The latitude coordinate.'),
  longitude: z.number().describe('The longitude coordinate.'),
});
export type GeocodeInput = z.infer<typeof GeocodeInputSchema>;

const GeocodeOutputSchema = z.object({
  locationName: z.string().describe('The identified city, province, and country.'),
});
export type GeocodeOutput = z.infer<typeof GeocodeOutputSchema>;

export async function reverseGeocode(input: GeocodeInput): Promise<GeocodeOutput> {
  return reverseGeocodeFlow(input);
}

const reverseGeocodeFlow = ai.defineFlow(
  {
    name: 'reverseGeocodeFlow',
    inputSchema: GeocodeInputSchema,
    outputSchema: GeocodeOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: 'You are a precise geographical geocoding assistant. Your task is to convert latitude and longitude coordinates into a concise, readable location name in the format: City, Province/State, Country.',
      prompt: `Identify the location for: Latitude ${input.latitude}, Longitude ${input.longitude}`,
    });

    if (!output) {
      return { locationName: "Coordinates Locked (Location Pending)" };
    }

    return { locationName: output.text || "Unknown Territory" };
  }
);
