import {defineType} from 'sanity'
import SeoLengthInput from '../components/SeoLengthInput'

export default defineType({
  name: 'localeSeoDescription',
  title: 'SEO Description (localized)',
  type: 'object',
  fields: [
    {name: 'es', type: 'string', title: 'Español', components: { input: SeoLengthInput }, options: { max: 155, kind: 'description' }},
    {name: 'pt', type: 'string', title: 'Português', components: { input: SeoLengthInput }, options: { max: 155, kind: 'description' }},
    {name: 'en', type: 'string', title: 'English', components: { input: SeoLengthInput }, options: { max: 155, kind: 'description' }},
  ]
})
