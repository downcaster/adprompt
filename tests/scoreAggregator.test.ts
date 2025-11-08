import { describe, expect, it } from 'vitest';
import { aggregateScores } from '../src/services/critique/scoreAggregator.js';

const makeResponse = (dimension: 'BrandFit' | 'VisualQuality' | 'Safety' | 'Clarity', score: number) => ({
  agent: `${dimension}-agent`,
  output: {
    dimension,
    score,
    status: score >= 0.8 ? 'pass' : 'fail',
    evidence: {
      summary: `${dimension} score ${score}`,
    },
  },
});

describe('aggregateScores', () => {
  it('marks overall status pass when every dimension meets threshold', () => {
    const responses = [
      makeResponse('BrandFit', 0.9),
      makeResponse('VisualQuality', 0.85),
      makeResponse('Safety', 0.82),
      makeResponse('Clarity', 0.88),
    ];

    const scorecard = aggregateScores(responses, {
      assetUrl: 'uploads/generated/test.mp4',
      iterations: 1,
      threshold: 0.8,
    });

    expect(scorecard.overallStatus).toBe('pass');
    expect(scorecard.scores.every((score) => score.status === 'pass')).toBe(true);
  });

  it('forces status to fail whenever a score is below threshold', () => {
    const responses = [
      makeResponse('BrandFit', 0.95),
      makeResponse('VisualQuality', 0.79),
      makeResponse('Safety', 0.9),
      makeResponse('Clarity', 0.85),
    ];

    const scorecard = aggregateScores(responses, {
      assetUrl: 'uploads/generated/test.mp4',
      iterations: 2,
      threshold: 0.8,
    });

    const failingDimension = scorecard.scores.find((score) => score.dimension === 'VisualQuality');
    expect(failingDimension?.status).toBe('fail');
    expect(scorecard.overallStatus).toBe('fail');
  });
});
