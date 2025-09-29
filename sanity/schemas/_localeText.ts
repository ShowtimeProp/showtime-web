import {defineType} from 'sanity';

export default defineType({
  name: 'localeText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    {name: 'es', type: 'text', title: 'Español'},
    {name: 'pt', type: 'text', title: 'Português'},
    {name: 'en', type: 'text', title: 'English'}
  ]
});
