const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getSubjectCategory(title, mediumStr) {
  if (!title) return 'other';
  // Normalize curly apostrophes to straight for consistent matching
  const t = title.toLowerCase().replace(/[\u2018\u2019]/g, "'");
  const m = (mediumStr || '').toLowerCase();

  // Specific artwork overrides - Contemporary/Abstract
  const contemporary = [
    'composition 1'
  ];
  if (contemporary.some(name => t === name)) return 'contemporary';

  const genreScenes = [
    'the poetry reading', 'hotel lobby', "new year's shooter", 'tidying up',
    'two disciples at the tomb (the kneeling disciple)', 'preparing for the matinee', 'hauptmann must die',
    'glow of gold, gleam of pearl', 'herman and verman', 'promenade', 'reclining nude',
    'sunlight', 'dolly & rach', 'girl at the piano', 'girl at the piano: recording sound',
    'he is risen', 'reflections', "the artist's party", 'the bacidae', 'the blue tiger',
    'the boat builders', 'the love song', 'untitled (the birth)', "judith, or cowper's oak",
    'our flag', 'concretion', 'henry look unhitching', 'new york, new haven and hartford',
    'streetlight', 'the statuette', 'the seiner (the net)',
    'a june idyll', 'afternoon – yellow room', 'afternoon tea', 'at the end of the porch',
    'eleanor', 'girl sweeping', 'harmony in pink and gray: lady meux', 'his majesty receives',
    'ideal head', 'joan of arc', 'picking cotton', 'poppies', 'red kimono on the roof', 'sleep',
    'wash day', 'training for war', 'the young artist', 'sunlit window', 'temptation',
    'the consecration', 'the robe'
  ];
  if (genreScenes.some(name => t === name)) return 'genre';

  const sculptures = [
    'the mountain man', 'gamin', 'framed mirror', 'bacchante and infant faun', 'diana'
  ];
  if (sculptures.some(name => t === name)) return 'sculpture';

  const cityscapes = [
    'harlem at night', 'paris: hôtel de ville', 'rainy night, etaples',
    'venice: santa maria della salute from the grand canal', 'venice: the rialto',
    'washington street, indianapolis at dusk', 'dunstaffnage', 'kenilworth castle',
    'monday morning', 'san giorgio, verona', 'the canal, morning effect',
    'west front, bath abbey', 'worcester from the river severn',
    'cross at the entrance to hereford', 'fontainebleau: the departure of napoleon',
    "king edgar's gate, worcester", 'oberwesel on the rhine',
    'philae: a view of the temples from the south', 'west window, worcester cathedral'
  ];
  if (cityscapes.some(name => t === name)) return 'cityscape';

  const landscapes = [
    'bellinzona', 'cliff rock—appledore', 'cliff rock - appledore',
    'fountains abbey, yorkshire', 'glacier du rhone and the galenstock, from the furka pass road',
    'hurricane', 'lock, long', 'loch long', 'martinswand, near innsbruck',
    'matlock', 'pool in the adirondacks', 'quarry at byram', 'remagen, erpel and linz',
    'thames nocturne', 'the marxburg', 'the olive grove', 'the pioneers', 'the rainbow',
    'scene in indianapolis', 'fall of the trees, yorkshire', 'fall of the tees, yorkshire',
    'rosslyn castle'
  ];
  if (landscapes.some(name => t === name)) return 'landscape';

  const portraits = [
    'dorothy', 'indian girl', 'little brown girl', 'margaret mckittrick',
    'marianne ashley walker', 'j. m. w. turner at a drawing table (recto), mrs. monro asleep (verso)',
    'the pianist (stanley addicks)', 'study of a young woman',
    'george washington at princeton'
  ];
  if (portraits.some(name => t === name)) return 'portrait';

  if (t === 'jimson weed') return 'stilllife';

  if (t.includes('portrait') || t.includes('self-portrait') || /^(mrs|mr|miss|dr|colonel|madame|mme)\b/.test(t)) return 'portrait';

  if (t.includes('sea') || t.includes('coast') || t.includes('harbor') || t.includes('ship') ||
      t.includes('marine') || t.includes('beach') || t.includes('ocean') || t.includes('bay') ||
      t.includes('fishing') || t.includes('whaler') || t.includes('sail') || t.includes('vessel')) return 'seascape';

  if (t.includes('landscape') || t.includes('mountain') || t.includes('valley') || t.includes('river') ||
      t.includes('lake') || t.includes('forest') || t.includes('sunrise') || t.includes('sunset') ||
      t.includes('morning') || t.includes('evening') || t.includes('autumn') || t.includes('winter') ||
      t.includes('spring') || t.includes('summer') || t.includes('cloud') || t.includes('storm') ||
      t.includes('snow') || t.includes('meadow') || t.includes('hill') || t.includes('creek') ||
      t.includes('ruins') || t.includes('grove') || t.includes('pool') || t.includes('quarry')) return 'landscape';

  if (t.includes('still life') || t.includes('flower') || t.includes('fruit') ||
      t.includes('melon') || t.includes('vase') || t.includes('bouquet')) return 'stilllife';

  if (t.includes('angel') || t.includes('christ') || t.includes('madonna') || t.includes('resurrection') ||
      t.includes('venus') || t.includes('bacch') || t.includes('europa') || t.includes('calypso') ||
      t.includes('nymph') || t.includes('apollo')) return 'mythological';

  if (m.includes('bronze') || m.includes('marble') || m.includes('sculpture')) return 'sculpture';

  return 'other';
}

async function main() {
  const { data } = await supabase.from('Artworks').select('Title, Medium').order('Title');

  const others = data.filter(a => getSubjectCategory(a.Title, a.Medium) === 'other');

  console.log('Artworks in OTHER category (' + others.length + '):');
  others.forEach(a => console.log('  "' + a.Title.toLowerCase() + '"'));
}

main().catch(console.error);
