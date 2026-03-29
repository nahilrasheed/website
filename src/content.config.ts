import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array
  const lowercaseItems = array.map((str) => str.toLowerCase())
  const distinctItems = new Set(lowercaseItems)
  return Array.from(distinctItems)
}

const vault = defineCollection({
  loader: glob({ base: './src/content/vault', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().nullish().transform((val) => val ? val : undefined),
      description: z.string().nullish().transform((val) => val ? val : undefined),
      publishDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      publish: z.boolean().default(true).optional(),
      tags: z.array(z.string()).nullable().default([]).transform((val) => val ? removeDupsAndLowerCase(val) : []),
      permalink: z.string().optional(),
      image: image().optional(),
      cover: image().optional(),
      order: z.number().default(999),
      type: z.string().default('note'),
      heroImage: z
        .object({
          src: image(),
          alt: z.string().optional(),
          inferSize: z.boolean().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          color: z.string().optional()
        })
        .optional(),
      language: z.string().optional(),
      comment: z.boolean().default(true).optional()
    })
})

export const collections = { vault }
