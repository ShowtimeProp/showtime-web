import {defineType} from 'sanity';

export default defineType({
  name: 'localeString',
  title: 'Localized String',
  type: 'object',
  fields: [
    {name: 'es', type: 'string', title: 'Español'},
    {name: 'pt', type: 'string', title: 'Português'},
    {name: 'en', type: 'string', title: 'English'}
  ]
});
