import {defineType} from 'sanity'
import SeoLengthInput from '../components/SeoLengthInput'

export default defineType({
  name: 'localeSeoTitle',
  title: 'SEO Title (localized)',
  type: 'object',
  fields: [
    {name: 'es', type: 'string', title: 'Español', components: { input: SeoLengthInput }, options: { max: 60, kind: 'title' }},
    {name: 'pt', type: 'string', title: 'Português', components: { input: SeoLengthInput }, options: { max: 60, kind: 'title' }},
    {name: 'en', type: 'string', title: 'English', components: { input: SeoLengthInput }, options: { max: 60, kind: 'title' }},
  ]
})
