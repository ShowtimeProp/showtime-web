import {defineType} from 'sanity';

export default defineType({
  name: 'localeBlock',
  title: 'Localized Portable Text',
  type: 'object',
  fields: [
    {name: 'es', type: 'array', of: [{type: 'block'}], title: 'Español'},
    {name: 'pt', type: 'array', of: [{type: 'block'}], title: 'Português'},
    {name: 'en', type: 'array', of: [{type: 'block'}], title: 'English'}
  ]
});
