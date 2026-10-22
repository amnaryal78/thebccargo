import React from 'react';
import { useParams } from 'react-router-dom';
import { getCountryGuide } from '../data/countryGuides';
import { CountryGuidePage } from '../features/countryGuides/CountryGuidePage';
import { BlogPostPage } from './BlogPostPage';

/** /blogs/:slug — country guides come from the content files; every other slug is a Supabase blog post. */
export const BlogSlugPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = getCountryGuide(slug);
  return guide ? <CountryGuidePage key={guide.slug} guide={guide} /> : <BlogPostPage />;
};
