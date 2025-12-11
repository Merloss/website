/**
 * Composable for generating R2 image URLs
 * 
 * @example
 * ```ts
 * const imageUrl = useR2Image('sourcegraph_conc.png')
 * // Returns: /api/images/sourcegraph_conc.png
 * ```
 */
export const useR2Image = (filename: string): string => {
	// Remove leading slash if present
	const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
	
	// Remove 'images/' prefix if present (API endpoint adds it automatically)
	const imageName = cleanFilename.startsWith('images/') 
		? cleanFilename.replace('images/', '') 
		: cleanFilename;
	
	// Return the API endpoint URL (API will automatically add images/ prefix)
	return `/api/images/${imageName}`;
};

