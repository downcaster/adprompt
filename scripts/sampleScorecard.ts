import { aggregateScores } from '../src/services/critique/scoreAggregator.js';

const responses = [
  {
    agent: 'brandfit-agent',
    output: {
      dimension: 'BrandFit',
      score: 0.92,
      status: 'pass',
      evidence: { summary: 'Logo usage and palette match guidance.' },
    },
  },
  {
    agent: 'visual-agent',
    output: {
      dimension: 'VisualQuality',
      score: 0.87,
      status: 'pass',
      evidence: { summary: 'Frames are crisp with no artifacts.' },
    },
  },
  {
    agent: 'safety-agent',
    output: {
      dimension: 'Safety',
      score: 0.95,
      status: 'pass',
      evidence: { summary: 'No unsafe or misleading content detected.' },
    },
  },
  {
    agent: 'clarity-agent',
    output: {
      dimension: 'Clarity',
      score: 0.78,
      status: 'fail',
      evidence: { summary: 'CTA text difficult to read in final frame.' },
    },
  },
];

const scorecard = aggregateScores(responses, {
  assetUrl: 'uploads/generated/demo.mp4',
  iterations: 1,
  threshold: 0.8,
});

console.log(JSON.stringify(scorecard, null, 2));
