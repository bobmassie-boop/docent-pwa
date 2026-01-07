const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/docent/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add medium and subject state variables after collection
content = content.replace(
  "const [collection, setCollection] = useState('');",
  `const [collection, setCollection] = useState('');
  const [medium, setMedium] = useState('');
  const [subject, setSubject] = useState('');`
);

// 2. Add helper functions after searchRef
const helperFunctions = `

  // Helper function to categorize artwork by medium
  function getMediumCategory(mediumStr) {
    if (!mediumStr) return 'other';
    const m = mediumStr.toLowerCase();
    if (m.includes('oil')) return 'oil';
    if (m.includes('watercolor')) return 'watercolor';
    if (m.includes('bronze') || m.includes('marble') || m.includes('sculpture') || m.includes('plaster') || m.includes('terra')) return 'sculpture';
    if (m.includes('pastel')) return 'pastel';
    if (m.includes('charcoal') || m.includes('pencil') || m.includes('drawing') || m.includes('graphite') || m.includes('chalk')) return 'drawing';
    if (m.includes('print') || m.includes('etching') || m.includes('lithograph') || m.includes('engraving')) return 'print';
    return 'other';
  }

  // Helper function to categorize artwork by subject
  function getSubjectCategory(title, mediumStr) {
    if (!title) return 'other';
    const t = title.toLowerCase();
    const m = (mediumStr || '').toLowerCase();
    if (t.includes('portrait') || t.includes('self-portrait') || /^(mrs|mr|miss|dr|colonel|madame|mme)\\b/.test(t)) return 'portrait';
    if (t.includes('sea') || t.includes('coast') || t.includes('harbor') || t.includes('ship') || t.includes('marine') || t.includes('beach') || t.includes('ocean') || t.includes('bay') || t.includes('fishing') || t.includes('whaler') || t.includes('sail') || t.includes('vessel')) return 'seascape';
    if (t.includes('landscape') || t.includes('mountain') || t.includes('valley') || t.includes('river') || t.includes('lake') || t.includes('forest') || t.includes('sunrise') || t.includes('sunset') || t.includes('morning') || t.includes('evening') || t.includes('autumn') || t.includes('winter') || t.includes('spring') || t.includes('summer') || t.includes('cloud') || t.includes('storm') || t.includes('snow') || t.includes('meadow') || t.includes('hill') || t.includes('creek') || t.includes('abbey') || t.includes('castle') || t.includes('ruins')) return 'landscape';
    if (t.includes('still life') || t.includes('flower') || t.includes('fruit') || t.includes('melon') || t.includes('vase') || t.includes('bouquet')) return 'stilllife';
    if (t.includes('angel') || t.includes('christ') || t.includes('madonna') || t.includes('resurrection') || t.includes('venus') || t.includes('bacch') || t.includes('europa') || t.includes('calypso') || t.includes('nymph') || t.includes('apollo') || t.includes('diana')) return 'mythological';
    if (m.includes('bronze') || m.includes('marble') || m.includes('sculpture')) return 'sculpture';
    return 'other';
  }
`;

content = content.replace(
  'const searchRef = useRef<HTMLDivElement>(null);',
  `const searchRef = useRef<HTMLDivElement>(null);${helperFunctions}`
);

// 3. Add medium and subject filters in the useEffect
content = content.replace(
  "if (collection) {\n      filtered = filtered.filter(artwork => artwork.Collection === collection);\n    }\n\n    // Apply sorting",
  `if (collection) {
      filtered = filtered.filter(artwork => artwork.Collection === collection);
    }

    // Apply medium filter
    if (medium) {
      filtered = filtered.filter(artwork => getMediumCategory(artwork.Medium) === medium);
    }

    // Apply subject filter
    if (subject) {
      filtered = filtered.filter(artwork => getSubjectCategory(artwork.Title, artwork.Medium) === subject);
    }

    // Apply sorting`
);

// 4. Update the useEffect dependency array
content = content.replace(
  '}, [searchQuery, artworks, sortBy, showOnDisplay, showNotOnDisplay, galleryLocation, collection]);',
  '}, [searchQuery, artworks, sortBy, showOnDisplay, showNotOnDisplay, galleryLocation, collection, medium, subject]);'
);

// 5. Add Medium dropdown after Collection dropdown
const mediumDropdown = `
          {/* Medium filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Medium:</label>
            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="">All Mediums</option>
              <option value="oil">Oil Paintings</option>
              <option value="watercolor">Watercolors</option>
              <option value="sculpture">Sculpture</option>
              <option value="drawing">Drawings</option>
              <option value="pastel">Pastels</option>
              <option value="print">Prints</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Subject filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Subject:</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="">All Subjects</option>
              <option value="portrait">Portraits</option>
              <option value="landscape">Landscapes</option>
              <option value="seascape">Seascapes & Marine</option>
              <option value="stilllife">Still Life</option>
              <option value="mythological">Religious & Mythological</option>
              <option value="sculpture">Sculpture</option>
              <option value="other">Other</option>
            </select>
          </div>
`;

content = content.replace(
  '</select>\n          </div>\n\n          {/* Sort dropdown */',
  `</select>
          </div>
${mediumDropdown}
          {/* Sort dropdown */`
);

fs.writeFileSync(filePath, content);
console.log('Filters added successfully!');
