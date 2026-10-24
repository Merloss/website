import { og } from '../lib/og';
import { PROFILE, CAREER } from '../lib/site';

export const GET = () => og({ eyebrow: '~/', title: `${PROFILE.name}\n${PROFILE.role}`, footer: [`Based in ${PROFILE.location}`, `Currently at ${CAREER[0].company}`] });
