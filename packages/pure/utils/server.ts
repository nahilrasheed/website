import { type CollectionEntry, getCollection } from 'astro:content'

type BlogCollection = CollectionEntry<'blog'>[]

export const prod = import.meta.env.PROD

/** Note: this function filters out draft posts based on the environment */
export async function getBlogCollection() {
  return await getCollection('blog', ({ data }: CollectionEntry<'blog'>) => {
    // Not in production & draft is not false
    return prod ? !data.draft : true
  })
}

function getYearFromCollection(collection: BlogCollection[number]): number | undefined {
  const dateStr = collection.data.updatedDate ?? collection.data.publishDate
  return dateStr ? new Date(dateStr).getFullYear() : undefined
}
export function groupCollectionsByYear(
  collections: BlogCollection
): [number, BlogCollection][] {
  const collectionsByYear = collections.reduce((acc, collection) => {
    const year = getYearFromCollection(collection)
    if (year !== undefined) {
      if (!acc.has(year)) {
        acc.set(year, [])
      }
      acc.get(year)?.push(collection)
    }
    return acc
  }, new Map<number, BlogCollection>())

  return Array.from(collectionsByYear.entries() as IterableIterator<[number, BlogCollection]>).sort(
    (a, b) => b[0] - a[0]
  )
}

export function sortMDByDate(collections: BlogCollection): BlogCollection {
  return collections.sort((a, b) => {
    const aDate = new Date(a.data.updatedDate ?? a.data.publishDate ?? 0).valueOf()
    const bDate = new Date(b.data.updatedDate ?? b.data.publishDate ?? 0).valueOf()
    return bDate - aDate
  })
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getAllTags(collections: BlogCollection) {
  return collections.flatMap((collection) => [...(collection.data.tags ?? [])])
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTags(collections: BlogCollection) {
  return [...new Set(getAllTags(collections))]
}

/** Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so. */
export function getUniqueTagsWithCount(collections: BlogCollection): [string, number][] {
  return [
    ...getAllTags(collections).reduce(
      (acc, t) => acc.set(t, (acc.get(t) || 0) + 1),
      new Map<string, number>()
    )
  ].sort((a, b) => b[1] - a[1])
}
