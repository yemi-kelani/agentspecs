import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// `numbered: true` adds CSS section numbers to h2–h4 and the TOC (Specification page).
				numbered: z.boolean().optional(),
			}),
		}),
	}),
};
