import type { RemarkPlugin } from '@astrojs/markdown-remark';
import { visit } from 'unist-util-visit';

export const remarkNormalizeLinks: RemarkPlugin = () => {
  return (tree) => {
    visit(tree, 'link', (node: any) => {
      if (!node.url) return;

      // Ignore external links
      if (node.url.match(/^(https?:|mailto:|tel:)/)) return;
      // Ignore anchor only
      if (node.url.startsWith('#')) return;

      try {
        let url = decodeURI(node.url);
        
        const parts = url.split('#');
        let path = parts[0];
        const fragment = parts[1] ? `#${parts[1]}` : '';

        // If it looks like a file path or internal vault path
        // BUT ignore image/asset extensions since they are case sensitive on disk
        if (path.match(/\.(png|jpg|jpeg|gif|webp|svg|pdf)$/i)) return;

        if (
          path.match(/\.(md|mdx)$/) || 
          path.startsWith('/vault/') ||
          !path.startsWith('/') // relative path
        ) {
          // Logic: 
          // 1. Remove extension
          path = path.replace(/\.(md|mdx)$/, '');
          
          // 2. Normalize segments (lowercase, space to dash, dedup dash)
          path = path.split('/').map(part => {
             // Avoid modifying dot segments like .. or . if traversing
             if (part === '.' || part === '..') return part;
             
             return part.toLowerCase()
               .replace(/\s+/g, '-')
               .replace(/--+/g, '-');
          }).join('/');

          node.url = path + fragment;
        }
      } catch (e) {
        // failed to decode or process
        console.warn('Failed to normalize link:', node.url);
      }
    });
  };
};
