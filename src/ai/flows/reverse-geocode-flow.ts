'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeocodeInputSchema = z.object({
  latitude: z.number().describe('The latitude coordinate.'),
  longitude: z.number().describe('The longitude coordinate.'),
});
export type GeocodeInput = z.infer<typeof GeocodeInputSchema>;

const GeocodeOutputSchema = z.object({
  city: z.string().describe('The identified city or municipality.'),
  province: z.string().describe('The identified province or state.'),
  country: z.string().describe('The identified country.'),
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
      system: 'You are a precise geographical geocoding assistant. Your task is to convert latitude and longitude coordinates into structured location data. Return the city/municipality, province/state, and country.',
      prompt: `Identify the specific city, province, and country for these coordinates: Latitude ${input.latitude}, Longitude ${input.longitude}`,
      output: { schema: GeocodeOutputSchema }
    });

    if (!output) {
      return { 
        city: "Unknown City", 
        province: "Unknown Province", 
        country: "Unknown Country" 
      };
    }

    return output;
  }
);
