import { defineQuery } from "next-sanity";

export const PROJECTS_QUERY = defineQuery(`
    *[_type == 'project' && defined(slug.current) && !defined($search) || title match $search|| category match $search || author -> name match $search ] | order(_createdAt desc){ 
        _id, title, slug, _createdAt, author -> {
            _id, name, image, bio
        }, views, description,
        category, image
    }`
);

export const PROJECT_BY_ID_QUERY = defineQuery(`*[_type == 'project' && _id == $id][0]{
  _id, title, slug, _createdAt, author -> {
    _id, name, username, image, bio
  }, description, views,
    category, image, tagline, content
}
`);

export const PROJECT_VIEWS_QUERY = defineQuery(`
    *[_type == 'project' && _id == $id][0]{
        _id, views
    }
`);

export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`
    *[_type == 'author' && id == $id][0]{
    _id, id, name, username, email, image, bio}` );