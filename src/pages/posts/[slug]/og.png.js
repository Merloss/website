import { og } from '../../../lib/og';
import { getPosts, fmtDate } from '../../../lib/posts';

export const getStaticPaths = () => getPosts().map((post) => ({ params: { slug: post.slug }, props: { post } }));

export const GET = ({ props: { post } }) =>
  og({ eyebrow: '~/posts', title: post.title, footer: [fmtDate(post.date), `${post.minutes} min read`, ...post.tags.slice(0, 1)] });
