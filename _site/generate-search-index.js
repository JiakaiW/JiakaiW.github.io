const fs = require('fs');
const path = require('path');

// Configuration
const contentDir = '.';  // Root directory
const outputFile = 'assets/search-index.json';  // Output to assets directory
const excludeDirs = ['assets', 'files', '_site', 'node_modules', '.git'];
const fileTypes = ['.md', '.html'];

// Function to extract text content from HTML
function extractTextFromHtml(html) {
    // Remove scripts and style elements
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML tags and decode entities
    let text = html.replace(/<[^>]+>/g, ' ');
    text = text.replace(/&[^;]+;/g, ' ');
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

// Function to extract frontmatter
function extractFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return {};
    
    const frontmatter = {};
    const lines = match[1].split('\n');
    
    lines.forEach(line => {
        const [key, ...values] = line.split(':').map(s => s.trim());
        if (key && values.length) {
            frontmatter[key] = values.join(':');
        }
    });
    
    return frontmatter;
}

// Function to get title from content
function extractTitle(content, filePath) {
    // Try to get title from frontmatter
    const frontmatter = extractFrontmatter(content);
    if (frontmatter.title) {
        return frontmatter.title;
    }
    
    // Try to get first h1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
        return h1Match[1];
    }
    
    // Fallback to filename
    return path.basename(filePath, path.extname(filePath))
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Function to walk directory recursively
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (!excludeDirs.includes(f) && !f.startsWith('_')) {
                walkDir(dirPath, callback);
            }
        } else {
            callback(path.join(dir, f));
        }
    });
}

// Main function to generate search index
function generateSearchIndex() {
    const searchData = [];

    walkDir(contentDir, (filePath) => {
        const ext = path.extname(filePath);
        if (!fileTypes.includes(ext)) return;

        const content = fs.readFileSync(filePath, 'utf8');
        
        // Skip files without frontmatter (likely not content pages)
        if (!content.startsWith('---')) return;
        
        // Get URL path
        let urlPath = '/' + path.relative(contentDir, filePath)
            .replace(/\\/g, '/')
            .replace(/\.md$/, '')
            .replace(/\.html$/, '')
            .replace(/index$/, '');

        const title = extractTitle(content, filePath);
        const textContent = extractTextFromHtml(content);

        searchData.push({
            title: title,
            url: urlPath,
            content: textContent
        });
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write search index to file
    fs.writeFileSync(outputFile, JSON.stringify(searchData, null, 2));
    console.log(`Search index generated with ${searchData.length} entries`);
}

// Run the generator
generateSearchIndex(); 